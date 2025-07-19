import { readConfig, setUser } from "./config";
import { createUser, getUser, resetUsers, getUsers, getUserById } from "./lib/db/queries/users";
import { fetchFeed } from "./lib/rss";
import { createFeed, getFeedByUrl, getFeeds, getNextFeedToFetch, markFeedFetched } from "./lib/db/queries/feeds";
import { Feed, User } from "./lib/db/schema";
import { createFeedFollow, getFeedFollowsForUser, deleteFeedFlollow } from "./lib/db/queries/feed_follow";

export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>; 
export type UserCommandHandler = (cmdName: string, user: User, ...args: string[]) => Promise<void>;
export type CommandRegistry = { [key: string]: CommandHandler; };
 
export function middlewareLoggedIn(
  handler: UserCommandHandler,
): CommandHandler {
  return async (cmdName: string, ...args: string[]): Promise<void> => {
    const config = readConfig();
    const userName = config.currentUserName;
    if (!userName) {
      throw new Error("User not logged in");
    }

    const user = await getUser(userName);
    if (!user) {
      throw new Error(`User ${userName} not found`);
    }

    await handler(cmdName, user, ...args);
  };
}

export function reigsterCommand(registry: CommandRegistry, cmdName: string, handler: CommandHandler) {
  registry[cmdName] = handler;
};

export async function runCommand(registry: CommandRegistry, cmdName: string, ...args: string[]) {
  if (!registry[cmdName]) {
    throw new Error(`Command ${cmdName} is not registered.`);
  }

  await registry[cmdName](cmdName, ...args);
};

// ---------------------------- Helpers ---------------------------- // 

function printFeed(feed: Feed, user: User) {
  console.log(`* ID:            ${feed.id}`);
  console.log(`* Created:       ${feed.createdAt}`);
  console.log(`* Updated:       ${feed.updatedAt}`);
  console.log(`* name:          ${feed.name}`);
  console.log(`* URL:           ${feed.url}`);
  console.log(`* User:          ${user.name}`);
}

function parseDuration(durationStr: string) {
  const regex = /^(\d+)(ms|s|m|h)$/;
  const match = durationStr.match(regex);

  if (!match) {
    throw new Error(`Invalid duration string: ${durationStr}`);
  }

  const time = parseInt(match[1]);
  const unit = match[2];
  let timeInMS; 
  switch (unit) {
    case "ms":
      timeInMS = time;
      break;
    case "s":
      timeInMS = time * 1000;
      break;
    case "m":
      timeInMS = time * 60 * 1000;
      break;
    case "h":
      timeInMS = time * 60 * 60 * 1000;
      break;
    default:
      throw new Error(`Invalid duration unit: ${unit}`);
  }

  let timeToAnnounce;
  if (timeInMS < 1000) {
    timeToAnnounce = `${timeInMS}ms`;
  } else if (timeInMS < 60 * 1000) {
    const seconds = Math.floor(timeInMS / 1000);
    timeToAnnounce = `${seconds}s$`;
  } else if (timeInMS < 60 * 60 * 1000) { 
    const minutes = Math.floor(timeInMS / (1000 * 60));
    const seconds = Math.floor((timeInMS % (1000 * 60)) / 1000);
    timeToAnnounce = `${minutes}m${seconds}s`;
  } else {
    const hours = Math.floor(timeInMS / (1000 * 60 * 60));
    const minutes = Math.floor((timeInMS % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeInMS % (1000 * 60)) / 1000);
    timeToAnnounce = `${hours}h${minutes}m${seconds}s`;
  }

  console.log(`Collecting feeds every ${timeToAnnounce}`);
  return timeInMS;
}

async function scrapeFeeds() {
  const feedToMark = await getNextFeedToFetch();
  if (!feedToMark) {
    throw new Error("No feeds to fetch");
  }

  const feedToFetch = await markFeedFetched(feedToMark.id);
  if (!feedToFetch) {
    throw new Error("Failed to mark feed as fetched");
  }

  const feedData = await fetchFeed(feedToFetch.url);
  if (!feedData) {
    throw new Error("Failed to fetch feed");
  }

  for (const item of feedData.channel.item) {
    console.log(item.title);
  }
}

function handleError(error: any) {
  if (error instanceof Error) {
    console.error(`Error: ${error.message}`);
  } else {
    console.error(`An unknown error occurred: ${error}`);
  }
}

// ---------------------------- Non Logged In Handlers ---------------------------- // 


export async function handlerLogin(cmdName: string, ...args: string[]) {
  if (args.length !== 1) {
    throw new Error(`usage: ${cmdName} <name>`);
  }

  const userName = args[0];
  const existingUser = await getUser(userName);
  if (!existingUser) {
    throw new Error(`User ${userName} not found`);
  }

  setUser(existingUser.name);
  console.log("User switched successfully!");
}

export async function handlerRegister(cmdName: string, ...args: string[]) {
  if (args.length !== 1) {
    throw new Error("usage: ${cmdName} <name>");
  }

  let result = await createUser(args[0]);
  if (!result) {
    throw new Error(`Failed to register user ${args[0]}. User might already exist.`);
  }

  await handlerLogin(cmdName, args[0]);      
};

export async function handlerReset(cmdName: string, ...args: string[]) {
  if (args.length !== 0) {
    throw new Error(`usage: ${cmdName}`);
  }

  await resetUsers();
  console.log("Users reset successfully!");
};

export async function handlerUsers(cmdName: string, ...args: string[]) {
  if (args.length !== 0) {
    throw new Error(`usage: ${cmdName}`);
  }

  const users = await getUsers();
  let currentUser = readConfig().currentUserName; 

  for (const user of users) {
    if (currentUser === user.name) {
      console.log(`- ${user.name} (current)`);
    } else {
      console.log(`- ${user.name}`);
    }
  }
};

export async function handlerAgg(cmdName: string, ...args: string[]) {
  if (args.length !== 1) {
    throw new Error(`usage: ${cmdName} <time_between_reqs>`);
  }

  const timeBetweenRequests = parseDuration(args[0]);

  scrapeFeeds().catch(handleError);
  const interval = setInterval(() => {
    scrapeFeeds().catch(handleError);
  }, timeBetweenRequests);

  await new Promise<void>((resolve) => {
    process.on("SIGINT", () => {
      console.log("Shutting down feed aggregator...");
      clearInterval(interval);
      resolve();
    });
  });
};

export async function handlerFeeds(cmdName: string, ...args: string[]) {
  if (args.length !== 0) {
    throw new Error(`usage: ${cmdName}`);
  }

  const feeds = await getFeeds();
  for (const feed of feeds) {
    console.log(feed.name);
    console.log(feed.url);
    console.log((await getUserById(feed.user_id)).name); 
  }
}

// ---------------------------- Logged In Handlers ---------------------------- // 

export async function handlerAddFeed(cmdName: string, user: User, ...args: string[]) {
  if (args.length !== 2) {
    throw new Error(`usage: ${cmdName} <feedname> <url>`);
  }

  const currentUser = user; 

  let name = args[0];
  let url = args[1];
  const result = await createFeed(name, url, currentUser.id);
  printFeed(result, currentUser);
  await handlerFollow(cmdName, user, url);
}

export async function handlerFollow(cmdName: string, user: User,  ...args: string[]) {
  if (args.length !== 1) {
    throw new Error(`usage: ${cmdName} <url>`);
  }

  const url = args[0];
  const currentUser = user; 
  const feed = await getFeedByUrl(url);
  const newFeedFollow = await createFeedFollow(feed.id, currentUser.id);
  console.log(`${newFeedFollow.userName} has started following ${newFeedFollow.feedName}`)
}

export async function handlerFollowing(cmdName: string, user: User,  ...args: string[]) {
  if (args.length !== 0) {
    throw new Error(`usage: ${cmdName}`);
  }

  const currentUser = user; 
  const followings = await getFeedFollowsForUser(currentUser.id);
  console.log(`Following feeds for ${currentUser.name}:`);
  for (const following of followings) {
    console.log(` - ${following.feedName}`);
  } 
}

export async function handlerUnfollow(cmdName: string, user: User,  ...args: string[]) {
  if (args.length !== 1) {
    throw new Error(`usage: ${cmdName} <url>`);
  }

  let url = args[0];
  const currentUser = user; 
  const feed = await getFeedByUrl(url);
  const result = await deleteFeedFlollow(currentUser.id, feed.id);
  
  if (!result) {
    throw new Error(`Failed to unfollow feed ${url}`);
  }

  console.log(`${currentUser.name} unfollowed feed ${feed.name}`);
}
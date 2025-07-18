import { readConfig, setUser } from "./config";
import { createUser, getUser, resetUsers, getUsers, getUserById } from "./lib/db/queries/users";
import { fetchFeed } from "./lib/rss";
import { createFeed, getFeedByUrl, getFeeds } from "./lib/db/queries/feeds";
import { Feed, User } from "./lib/db/schema";
import { createFeedFollow, getFeedFollowsForUser } from "./lib/db/queries/feed_follow";

export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>; 
export type UserCommandHandler = (cmdName: string, user: string, ...args: string[]) => Promise<void>;
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
  if (args.length !== 0) {
    throw new Error(`usage: ${cmdName}`);
  }
  const feedURL = "https://www.wagslane.dev/index.xml";

  const feedData = await fetchFeed(feedURL);
  const feedDataStr = JSON.stringify(feedData, null, 2);
  console.log(feedDataStr);
};

function printFeed(feed: Feed, user: User) {
  console.log(`* ID:            ${feed.id}`);
  console.log(`* Created:       ${feed.createdAt}`);
  console.log(`* Updated:       ${feed.updatedAt}`);
  console.log(`* name:          ${feed.name}`);
  console.log(`* URL:           ${feed.url}`);
  console.log(`* User:          ${user.name}`);
}

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

// ---------------------------- LoggedInFucntions ---------------------------- // 

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
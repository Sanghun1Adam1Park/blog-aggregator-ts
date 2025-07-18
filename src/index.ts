import { 
  CommandRegistry,  
  reigsterCommand,
  handlerLogin,
  runCommand, 
  handlerRegister,
  handlerReset,
  handlerUsers,
  handlerAgg,
  handlerAddFeed,
  handlerFeeds,
  handlerFollow,
  handlerFollowing
} from "./command_handler";

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log("usage: cli <command> [args...]");
    process.exit(1);
  }

  const cmdName = args[0];
  const cmdArgs = args.slice(1);
  const commandsRegistry: CommandRegistry = {};

  reigsterCommand(commandsRegistry, "login", handlerLogin);
  reigsterCommand(commandsRegistry, "register", handlerRegister);
  reigsterCommand(commandsRegistry, "reset", handlerReset);
  reigsterCommand(commandsRegistry, "users", handlerUsers);
  reigsterCommand(commandsRegistry, "agg", handlerAgg);
  reigsterCommand(commandsRegistry, "addfeed", handlerAddFeed);
  reigsterCommand(commandsRegistry, "feeds", handlerFeeds);
  reigsterCommand(commandsRegistry, "follow", handlerFollow);
  reigsterCommand(commandsRegistry, "following", handlerFollowing);

  try {
    await runCommand(commandsRegistry, cmdName, ...cmdArgs);
  } catch (err) {
    if (err instanceof Error) {
      console.error(`Error running command ${cmdName}: ${err.message}`);
    } else {
      console.error(`Error running command ${cmdName}: ${err}`);
    }
    process.exit(1);
  }
  process.exit(0);
}

main();
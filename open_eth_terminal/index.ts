import inquirer from "inquirer";
import chalk from "chalk";
import { spotTerminal } from "./spot/index.ts";

import terminalKit from "terminal-kit";
const { terminal } = terminalKit;
import figlet from "figlet";

import { ENVIRONMENT, DEBUG, COINGECKO_API_KEY } from "./config.ts";
import { Menu, MenuOption, TerminalUserStateConfig } from "./types.ts";

const menuOptions: MenuOption[] = [
    {
        name: "spot",
        description: "Fetch spot prices from various sources",
        action: (st: TerminalUserStateConfig) => spotTerminal(st),
    },
    {
        name: "exit",
        description: "Exit the application",
        action: (st: TerminalUserStateConfig) => process.exit(0),
    },
];

const mainMenu: Menu = {
    name: "Main Menu",
    description: "Main Menu",
    messagePrompt: "Select an option:",
    options: menuOptions,
}

export async function terminalMain(state: TerminalUserStateConfig) {

  const tableDescriptions = mainMenu.options.map((option) => [option.name, option.description]);
  terminal.table([
      ['Option', 'Description'],
      ...tableDescriptions,
  ], {
      hasBorder: true,
      contentHasMarkup: true,
      borderChars: 'lightRounded',
      borderAttr: { color: 'blue' },
      textAttr: { bgColor: 'default' },
      firstRowTextAttr: { bgColor: 'blue' },
      width: 60,
      fit: true
  });

  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: mainMenu.messagePrompt,
      choices: mainMenu.options.map((option) => option.name),
    },
  ]);

  const option = mainMenu.options.find((option) => option.name === action);
  if (!option) {
    console.log(chalk.red("Invalid option"));
    return terminalMain(state); // Retry
  }
  
  // Execute action. If it returns a state, use it. Otherwise keep current state.
  // We expect sub-menus to potentially return modified state.
  const newState = await option.action(state);
  
  // Recursive step: call main with new or existing state
  // Note: spotTerminal is now responsible for its own loop or recursion, 
  // but if it returns here, we are back at main menu.
  return terminalMain(newState || state);
}

export async function startMain() {
  // Only show banner on initial load
  console.log(chalk.green(figlet.textSync("Open Eth Terminal", { horizontalLayout: 'full' })));
  
  const state: TerminalUserStateConfig = {
    environment: ENVIRONMENT,
    debugMode: DEBUG,
    apiKeys: {
        coingecko: COINGECKO_API_KEY,
    },
    loadedContext: {},
  };
  
  return terminalMain(state); 
}
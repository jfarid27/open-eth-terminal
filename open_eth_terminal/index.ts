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

export async function terminalMain() {
  console.log(chalk.green(figlet.textSync("Open Eth Terminal", { horizontalLayout: 'full' })));
  
  const state: TerminalUserStateConfig = {
    environment: ENVIRONMENT,
    debugMode: DEBUG,
    apiKeys: {
        coingecko: COINGECKO_API_KEY,
    },
  };

  while (true) {
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
      continue;
    }
    await option.action(state);
  }
}

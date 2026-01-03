import inquirer from "inquirer";
import chalk from "chalk";
import { spotTerminal } from "./spot/index.ts";
import { predictionMarketsTerminal } from "./prediction_markets/index.ts";

import terminalKit from "terminal-kit";
const { terminal } = terminalKit;
import figlet from "figlet";

import { ENVIRONMENT, DEBUG, COINGECKO_API_KEY } from "./config.ts";
import { Menu, MenuOption, TerminalUserStateConfig, CommandResult } from "./types.ts";
import { registerTerminalApplication } from "./utils/program_loader.ts";

const menuOptions: MenuOption[] = [
    {
        name: "spot",
        command: "spot",
        description: "Fetch spot prices from various sources",
        action: (st: TerminalUserStateConfig) => async () => {
            const newState = await spotTerminal(st);
            return {
                result: CommandResult.Success, // Assuming success if it returns
                state: newState,
            };
        },
    },
    {
        name: "prediction markets",
        command: "predictions",
        description: "Fetch prediction markets prices from various sources",
        action: (st: TerminalUserStateConfig) => async () => {
            const newState = await predictionMarketsTerminal(st);
            return {
                result: CommandResult.Success, // Assuming success if it returns
                state: newState,
            };
        },
    },
    {
        name: "exit",
        command: "exit",
        description: "Exit the application",
        action: (st: TerminalUserStateConfig) => async () => {
             process.exit(0);
             return { result: CommandResult.Exit, state: st };
        },
    },
];

const mainMenu: Menu = {
    name: "Main Menu",
    description: "Main Menu",
    messagePrompt: "Select an option:",
    options: menuOptions,
}

export const terminalMain = registerTerminalApplication(mainMenu);

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
    actionTimeout: 5000,
  };
  
  try {
    await terminalMain(state); 
  } catch (error) {
    console.error("Error in main terminal:", error);
    process.exit(1);
  }
}
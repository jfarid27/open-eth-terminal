import chalk from "chalk";
import cryptoTerminal from "./crypto/index.ts";
import predictionMarketsTerminal from "./prediction_markets/index.ts";
import stocksTerminal from "./stocks/index.ts";
import { menu_top } from "./utils/menu_globals.ts";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import newsTerminal from "./news/index.ts";

import figlet from "figlet";

import { ENVIRONMENT, LOG_LEVEL, COINGECKO_API_KEY, ALPHAVANTAGE_API_KEY } from "./config.ts";
import { Menu, MenuOption, TerminalUserStateConfig, CommandResultType } from "./types.ts";
import { registerTerminalApplication } from "./utils/program_loader.ts";

const menuOptions: MenuOption[] = [
    {
        name: "crypto",
        command: "crypto",
        description: "Fetch crypto prices from various sources",
        action: (st: TerminalUserStateConfig) => async () => {
            const newState = await cryptoTerminal(st);
            return {
                result: { type: CommandResultType.Success },
                state: newState,
            };
        },
    },
    {
        name: "stocks",
        command: "stocks",
        description: "Fetch stock prices from various sources",
        action: (st: TerminalUserStateConfig) => async () => {
            const newState = await stocksTerminal(st);
            return {
                result: { type: CommandResultType.Success },
                state: newState,
            };
        },
    },
    {
        name: "news",
        command: "news",
        description: "Fetch news from various sources",
        action: (st: TerminalUserStateConfig) => async () => {
            const newState = await newsTerminal(st);
            return {
                result: { type: CommandResultType.Success },
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
                result: { type: CommandResultType.Success },
                state: newState,
            };
        },
    },
    {
        name: "script",
        command: "script [filename]",
        description: "Run a script from the scripts folder with a specified filename",
        action: (st: TerminalUserStateConfig) => async (filename: string) => {
             try {
                const scriptPath = join(process.cwd(), "scripts", filename);
                const fileContent = await readFile(scriptPath, "utf-8");
                const [currentCommand, ...tailCommands] = fileContent.split("\n").map(l => l.trim()).filter(l => l.length > 0);

                return {
                    result: { type: CommandResultType.Success },
                    state: {
                        ...st,
                        scriptContext: {
                            filename,
                            currentCommand,
                            tailCommands,
                        }
                    },
                };
            } catch (error) {
                console.log(chalk.red(`Failed to load script: ${error}`));
                return {
                    result: { type: CommandResultType.Error },
                    state: st,
                };
            }
        },
    },
    ...menu_top
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
    logLevel: LOG_LEVEL,
    apiKeys: {
        coingecko: COINGECKO_API_KEY,
        alphavantage: ALPHAVANTAGE_API_KEY,
    },
    loadedContext: {},
    scriptContext: {}
  };
  
  try {
    await terminalMain(state); 
  } catch (error) {
    console.error("Error in main terminal:", error);
    process.exit(1);
  }
}
import inquirer from "inquirer";
import { Command } from "commander";
import chalk from "chalk";
import { spot } from "../../open_eth/spot/index.ts";
import { ExchangeSymbolType } from "../../open_eth/types/symbols.ts";
import type { ActionOptions } from "../types.ts";
import { loadProgram } from "../utils/program_loader.ts";
import { TerminalUserStateConfig, EnvironmentType, Menu, MenuOption, CommandState, CommandResult } from "../types.ts";
import { lensPath, view, pipe } from "ramda";
import terminalKit from "terminal-kit";
const { terminal } = terminalKit;

// Lens for the loaded token on the user state config.
const tokenLens = lensPath(["loadedContext", "token", "symbol"]);

// View the loaded token on the user state config.
const getLoadedToken = view(tokenLens);

const spotPriceHandler = (st: TerminalUserStateConfig) => async (symbolStr: string): Promise<CommandState> => {
    const COINGECKO_API_KEY = st.apiKeys.coingecko;
    if (!COINGECKO_API_KEY) {
        console.log(chalk.red("No CoinGecko API key found"));
        return {
            result: CommandResult.Error,
            state: st,
        };
    }

    let loadedTokenSymbol: string | undefined = symbolStr || getLoadedToken(st); 

    if (!loadedTokenSymbol) {
        console.log("No symbol provided");
        return {
            result: CommandResult.Error,
            state: st,
        };
    }

    try {
      const symbolObj = {
        name: loadedTokenSymbol,
        id: loadedTokenSymbol.toLowerCase(),
        _type: ExchangeSymbolType.CoinGecko,
      };
  
      const result = await spot(symbolObj, COINGECKO_API_KEY);
  
      if (st.debugMode) {
        console.log(result);
      }
  
      console.log(chalk.yellow(`Symbol: ${result.symbol.name}`));
      console.log(chalk.green(`Price: $${result.price}`));
    } catch (error) {
        if (st.environment === EnvironmentType.Development) {
            console.log(error);
        }
        console.log(chalk.red("Network Error"));
        return {
            result: CommandResult.Error,
            state: st,
        };
    }
    
    return {
        result: CommandResult.Success,
        state: st,
    };
}

const spotMenuOptions: MenuOption[] = [
    {
        name: "price",
        command: "price [symbol]",
        description: "Fetch current price for the given symbol (default: ethereum)",
        action: spotPriceHandler,
    },
    {
        name: "back",
        command: "back",
        description: "Go back to the main menu",
        action: (st: TerminalUserStateConfig) => async (ops?: ActionOptions) => {
            return {
                result: CommandResult.Back,
                state: st,
            };
        },
    },
    {
        name: "exit",
        command: "exit",
        description: "Exit the application",
        action: (st: TerminalUserStateConfig) => async (ops?: ActionOptions) => { 
            return {
                result: CommandResult.Exit,
                state: st,
            };
        },
    },
]

const spotMenu: Menu = {
    name: "Spot Menu",
    description: "Spot Menu",
    messagePrompt: "Select an option:",
    options: spotMenuOptions,
}

export async function spotTerminal(st: TerminalUserStateConfig): Promise<TerminalUserStateConfig> {
  console.log(chalk.blue("Entered Spot Market Application"));
  
  const tableDescriptions = spotMenu.options.map((option) => [option.name, option.description]);
  
    terminal.table([
        ['Command', 'Description'],
        ...tableDescriptions,
    ], {
        hasBorder: true,
        contentHasMarkup: true,
        borderChars: 'lightRounded',
        borderAttr: { color: 'cyan' },
        textAttr: { bgColor: 'default' },
        firstRowTextAttr: { bgColor: 'cyan' },
        width: 60,
        fit: true
    });
    
    const { command } = await inquirer.prompt([
      {
        type: "input",
        name: "command",
        message: "Spot >",
      },
    ]);

    const input = command.trim();
    if (!input) return spotTerminal(st);

    let shouldReturn = false;
    let nextState = st;

    const program = new Command();
    program.exitOverride();
    program.configureOutput({
      writeErr: (str) => process.stdout.write(chalk.red(str)),
    });
      

    const resultPs = spotMenu.options.map((option) => {
        return loadProgram(program, option, st);
    });
    
    
    try {
        const args = input.split(/\s+/);
        await program.parseAsync(args, { from: "user" });
        const result = await Promise.race(resultPs);
        if (result && result.result === CommandResult.Back) {
            return result.state;
        }
        
        if (result && result.result === CommandResult.Exit) {
            process.exit(0);
        }
      
    } catch (err: any) {
        
        if (err.result === CommandResult.Timeout) {
            console.log(chalk.red("Command timed out"));
        }
        
        if (err.result === CommandResult.Error) {
            console.log(chalk.red("Command failed"));
        }
        
        if (st.debugMode) {
            console.log(err);
        }

    }
    
    
    return spotTerminal(nextState);
}

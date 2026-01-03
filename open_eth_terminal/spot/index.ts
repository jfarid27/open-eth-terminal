import inquirer from "inquirer";
import { Command } from "commander";
import chalk from "chalk";
import { spot } from "../../open_eth/spot/index.ts";
import { ExchangeSymbolType } from "../../open_eth/types/symbols.ts";
import { TerminalUserStateConfig, EnvironmentType } from "../types.ts";
import { lensPath, view, pipe } from "ramda";
import terminalKit from "terminal-kit";
const { terminal } = terminalKit;

// Lens for the loaded token on the user state config.
const tokenLens = lensPath(["loadedContext", "token", "symbol"]);

// View the loaded token on the user state config.
const getLoadedToken = view(tokenLens);

export async function spotTerminal(st: TerminalUserStateConfig) {
  console.log(chalk.blue("Entered Spot Market Application"));
  
  while (true) {
    terminal.table([
        ['Command', 'Description'],
        ['price [SYMBOL]', 'Fetch current price for the given symbol (default: ethereum)'],
        ['back', 'Go back to the main menu'],
        ['exit', 'Exit the application']
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
    if (!input) continue;

    let shouldReturn = false;

    const program = new Command();
    program.exitOverride();
    program.configureOutput({
      writeErr: (str) => process.stdout.write(chalk.red(str)),
    });

    program
      .command("back")
      .description("Go back to the main menu")
      .action(() => {
        shouldReturn = true;
      });

    program
      .command("exit")
      .description("Exit the application")
      .action(() => {
        process.exit(0);
      });
      
    program
      .command("price [symbol]")
      .description("Get current price of a symbol")
      .action(async (symbolStr: string) => {
        const COINGECKO_API_KEY = st.apiKeys.coingecko;
        if (!COINGECKO_API_KEY) {
            console.log(chalk.red("No CoinGecko API key found"));
            return;
        }
        
        let loadedTokenSymbol = getLoadedToken(st) || symbolStr;
        if (!loadedTokenSymbol) {
            console.log(chalk.red("No symbol provided"));
            return;
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
            console.log(st.environment === EnvironmentType.Development)
            if (st.environment === EnvironmentType.Development) {
                console.log(error);
            }
            console.log(chalk.red("Network Error"));
        }
      });

    try {
      // Split by whitespace to simulate argv
      const args = input.split(/\s+/);
      await program.parseAsync(args, { from: "user" });
    } catch (err: any) {
        // Command execution failed or help was displayed
        if (err.code === 'commander.unknownCommand') {
             // Default commander error message is usually sufficient (printed via writeErr above)
        }
    }
    
    if (shouldReturn) {
        return;
    }
  }
}

import chalk from "chalk";
import { spot } from "./model/index.ts";
import { ExchangeSymbolType } from "./model/types.ts";
import { registerTerminalApplication } from "../utils/program_loader.ts";
import { TerminalUserStateConfig, EnvironmentType, Menu, MenuOption, CommandState, CommandResultType } from "../types.ts";
import { lensPath, view } from "ramda";
import { menu_globals } from "../utils/menu_globals.ts";

// Lens for the loaded token on the user state config.
const tokenLens = lensPath(["loadedContext", "token", "symbol"]);

// View the loaded token on the user state config.
const getLoadedToken = view(tokenLens);

const spotPriceHandler = (st: TerminalUserStateConfig) => async (symbolStr: string): Promise<CommandState> => {
    const COINGECKO_API_KEY = st.apiKeys.coingecko;
    if (!COINGECKO_API_KEY) {
        console.log(chalk.red("No CoinGecko API key found"));
        return {
            result: { type: CommandResultType.Error },
            state: st,
        };
    }

    let loadedTokenSymbol: string | undefined = symbolStr || getLoadedToken(st); 

    if (!loadedTokenSymbol) {
        console.log("No symbol provided");
        return {
            result: { type: CommandResultType.Error },
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
  
      if (st.logLevel) {
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
            result: { type: CommandResultType.Error },
            state: st,
        };
    }
    
    return {
        result: { type: CommandResultType.Success },
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
    ...menu_globals,
]

const spotMenu: Menu = {
    name: "Spot Menu",
    description: "Spot Menu",
    messagePrompt: "Select an option:",
    options: spotMenuOptions,
}

export const spotTerminal = registerTerminalApplication(spotMenu);

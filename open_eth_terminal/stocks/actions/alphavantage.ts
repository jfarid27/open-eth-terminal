import chalk from "chalk";
import stocks from "./../model/index.ts";
import { ExchangeSymbolType } from "./../../types.ts";
import {
    TerminalUserStateConfig, EnvironmentType,
     CommandState, CommandResultType
} from "./../../types.ts";
import { lensPath, view } from "ramda";

// Lens for the loaded token on the user state config.
const tokenLens = lensPath(["loadedContext", "token", "symbol"]);

// View the loaded token on the user state config.
const getLoadedToken = view(tokenLens);


export const chartPriceHandler = (st: TerminalUserStateConfig) => async (symbolStr: string): Promise<CommandState> => {
    const ALPHAVANTAGE_API_KEY = st.apiKeys.alphavantage;
    if (!ALPHAVANTAGE_API_KEY) {
        console.log(chalk.red("No AlphaVantage API key found"));
        return {
            result: { type: CommandResultType.Error },
            state: st,
        };
    }

    const loadedTokenSymbol: string | undefined = symbolStr || getLoadedToken(st); 

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
  
      const result = await stocks.chart.get(symbolObj, ALPHAVANTAGE_API_KEY);
  
      if (st.logLevel) {
        console.log(result);
      }
      
      console.log(result)
  
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
import chalk from "chalk";
import model from "../model/index.ts";
import { ExchangeSymbolType } from "../../types.ts";
import {
    TerminalUserStateConfig, EnvironmentType,
     CommandState, CommandResultType
} from "../../types.ts";
import { lensPath, view } from "ramda";
import { showLineChart } from "./../../components/charting.ts";
import { prop, mapObjIndexed, sortBy, values, pipe } from "ramda";

// Lens for the loaded token on the user state config.
const tokenLens = lensPath(["loadedContext", "token", "symbol"]);

// View the loaded token on the user state config.
const getLoadedToken = view(tokenLens);

const alphavantageTimeSeriesDailyP = prop("Time Series (Digital Currency Daily)");


/**
 * Process the daily data from AlphaVantage by projecting the nested object into
 * an array of objects with date, close, timestamp
 * @param data raw object data from AlphaVantage 
 * @returns object array with date, close, timestamp
 */
const processAlphavantageDailyData = pipe(
      alphavantageTimeSeriesDailyP,
      mapObjIndexed((value: Record<string, string>, key:string) => {
       return {
         date: key,
         close: Number(value["4. close"]),
         timestamp: new Date(key).getTime()
       } 
      }),
      values,
      sortBy(prop("timestamp"))
);

export const chartPriceHandler = (st: TerminalUserStateConfig) =>
    async (symbolStr: string): Promise<CommandState> => {
        const API_KEY = st.apiKeys.alphavantage;
        if (!API_KEY) {
            console.log(chalk.red("No API key found"));
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
                id: loadedTokenSymbol,
                _type: ExchangeSymbolType.CoinGecko,
            };
        
            const result = await model.alphavantage.chart(symbolObj, API_KEY);
        
            const sorted = processAlphavantageDailyData(result) as Record<string, string | number>[];
            console.log(result["0"]);
            await showLineChart(sorted, "timestamp", "close", "Price Chart"); 
        
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

export const spotPriceHandler = (st: TerminalUserStateConfig) => async (symbolStr: string): Promise<CommandState> => {
    const COINGECKO_API_KEY = st.apiKeys.coingecko;
    if (!COINGECKO_API_KEY) {
        console.log(chalk.red("No CoinGecko API key found"));
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
  
      const result = await model.coingecko.spot(symbolObj, COINGECKO_API_KEY);
  
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
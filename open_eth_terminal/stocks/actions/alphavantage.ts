import chalk from "chalk";
import stocks from "./../model/index.ts";
import { ExchangeSymbolType } from "./../../types.ts";
import {
    TerminalUserStateConfig, EnvironmentType,
     CommandState, CommandResultType
} from "./../../types.ts";
import { showChart } from "./../../components/charting.ts";
import { lensPath, lensProp, pipe, view, values, tap,
    prop, mapObjIndexed, sortBy } from "ramda";

// Lens for the loaded token on the user state config.
const tokenLens = lensPath(["loadedContext", "token", "symbol"]);

// View the loaded token on the user state config.
const getLoadedToken = view(tokenLens);
const timeSeriesDailyP = prop("Time Series (Daily)");

const processDailyData = pipe(
      timeSeriesDailyP,
      mapObjIndexed((value: Record<string, string>, key:string) => {
       return {
         date: key,
         close: Number(value["4. close"]),
         timestamp: new Date(key).getTime()
       } 
      }),
      values,
      tap(console.log),
      sortBy(prop("timestamp"))
);

/**
 * Generate the ordered date range inclusive between startDate and endDate in the format YYYY-MM-DD
 * @param startDate 
 * @param endDate 
 * @returns Array of dates in the format YYYY-MM-DD 
 */
function generateDateRange(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dateRange = [];
    while (start <= end) {
        dateRange.push(start.toISOString().split("T")[0]);
        start.setDate(start.getDate() + 1);
    }
    return dateRange;
}

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
      
      const sorted = processDailyData(result) as Record<string, string | number>[];
      await showChart(sorted, "timestamp", "close", "Price Chart"); 
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
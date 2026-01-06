import chalk from "chalk";
import stocks from "./../model/index.ts";
import { DataSourceType } from "./../../types.ts";
import {
    TerminalUserStateConfig, EnvironmentType,
     CommandState, CommandResultType
} from "./../../types.ts";
import { showLineChart } from "./../../components/charting.ts";
import { lensPath, lensProp, pipe, view, values, tap,
    prop, mapObjIndexed, sortBy, props, 
    project} from "ramda";
import terminalKit from "terminal-kit";
const { terminal } = terminalKit;

// Lens for the loaded token on the user state config.
const tokenLens = lensPath(["loadedContext", "token", "symbol"]);

// View the loaded token on the user state config.
const getLoadedToken = view(tokenLens);
const timeSeriesDailyP = prop("Time Series (Daily)");


/**
 * Process the daily data from AlphaVantage by projecting the nested object into
 * an array of objects with date, close, timestamp
 * @param data raw object data from AlphaVantage 
 * @returns object array with date, close, timestamp
 */
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
      sortBy(prop("timestamp"))
);

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
        _type: DataSourceType.AlphaVantage,
      };
  
      const result = await stocks.chart.get(symbolObj, ALPHAVANTAGE_API_KEY);
  
      if (st.logLevel) {
        console.log(result);
      }
      
      const sorted = processDailyData(result) as Record<string, string | number>[];
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
        _type: DataSourceType.AlphaVantage,
      };
  
      const result: Record<string, string> = await stocks.spot.get(symbolObj, ALPHAVANTAGE_API_KEY);
      const spotData = pipe(
          prop("Global Quote"),
          props([
              "01. symbol", 
              "05. price", 
              "09. change", 
              "10. change percent", 
              "06. volume", 
              "07. latest trading day"
          ]),
          values,
      )(result) as string[];
      
      terminal.table([
          ['Symbol', 'Price', 'Change', 'Change %', 'Volume', 'Latest Trading Day'],
          spotData
      ], {
          hasBorder: true,
          contentHasMarkup: true,
          borderChars: 'lightRounded',
          borderAttr: { color: 'green' },
          textAttr: { bgColor: 'default' },
          firstRowTextAttr: { bgColor: 'green' },
          width: 120,
          fit: true
      });
      
      if (st.logLevel) {
        console.log(result);
      }
      
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
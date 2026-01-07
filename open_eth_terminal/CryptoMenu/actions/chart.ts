import chalk from "chalk";
import { chart } from "../model/index.ts";
import {
    TerminalUserStateConfig,
    CommandState, CommandResultType, DataSourceType,
    LogLevel
} from "../../types.ts";
import { inspectLogger } from "./../../utils/logging.ts"
import { getLoadedToken, getCoinGeckoApiKey } from "./../../utils/index.ts";
import { showLineChart } from "../../components/charting.ts";

/**
 * Handler for the chart price command.
 * 
 * At the moment, all handing is done by CoinGeckoAPI for chart.
 * The function will error if no CoinGecko API key is provided on
 * the {@link TerminalUserStateConfig}.
 * 
 * @param st The {@link TerminalUserStateConfig} 
 * @param symbolStr The symbol to get the chart for 
 * @returns {@link CommandState} 
 * @note The function is intended to expand to support multiple data sources.
 */
export const chartPriceHandler = (st: TerminalUserStateConfig) => async (symbolStr: string): Promise<CommandState> => {
    const applicationLogging = inspectLogger(st);
    const API_KEY = getCoinGeckoApiKey(st);

    if (!API_KEY) {
        console.log("No CoinGecko API key provided");
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
    
    applicationLogging(LogLevel.Info)(`Fetching chart for ${loadedTokenSymbol}`);
    applicationLogging(LogLevel.Info)(`Using CoinGecko API key.`);

    try {
      const symbolObj = {
        name: loadedTokenSymbol,
        id: loadedTokenSymbol.toLowerCase(),
        _type: DataSourceType.CoinGecko,
      };
      const chartData = await chart(symbolObj, API_KEY);
      
      await showLineChart(chartData.prices, "timestamp", "price", `${loadedTokenSymbol} Price`);
 
      applicationLogging(LogLevel.Debug)("Result: ");
      applicationLogging(LogLevel.Debug)(chartData);

    } catch (error) {
        applicationLogging(LogLevel.Error)(error);
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
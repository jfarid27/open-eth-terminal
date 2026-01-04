import { ExchangeSymbol } from "../../types.ts";
import axios from "axios";

/**
 * Fetches the chart data for a specified symbol from the AlphaVantage API.
 * 
 * @param symbol The symbol to fetch the chart data for.
 * @param ALPHAVANTAGE_API_KEY The AlphaVantage API key.
 * @returns The chart data for the specified symbol.
 * @see https://www.alphavantage.co/documentation/
 */
export async function fetchChartAlphaVantage(symbol: ExchangeSymbol, ALPHAVANTAGE_API_KEY: string) {
    
    const response = await axios.get("https://www.alphavantage.co/query", {
        params: {
            function: "TIME_SERIES_DAILY",
            outputsize: "compact",
            symbol: symbol.id,
            apikey: ALPHAVANTAGE_API_KEY,
        },
    });

    return response.data;
}
import { ExchangeSymbol } from "../../types.ts";
import { fetchChartAlphaVantage, fetchSpotPriceAlphaVantage } from "./alphavantage.ts";

const stocks = {
    chart: {
        get: (symbol: ExchangeSymbol, ALPHAVANTAGE_API_KEY: string) => {
            return fetchChartAlphaVantage(symbol, ALPHAVANTAGE_API_KEY);
        }
    },
    spot: {
        get: (symbol: ExchangeSymbol, ALPHAVANTAGE_API_KEY: string) => {
            return fetchSpotPriceAlphaVantage(symbol, ALPHAVANTAGE_API_KEY);
        }
    }
}

export default stocks;

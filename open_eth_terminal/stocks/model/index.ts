import { ExchangeSymbol } from "../../types.ts";
import { fetchChartAlphaVantage } from "./alphavantage.ts";

const stocks = {
    chart: {
        get: (symbol: ExchangeSymbol, ALPHAVANTAGE_API_KEY: string) => {
            return fetchChartAlphaVantage(symbol, ALPHAVANTAGE_API_KEY);
        }
    }
}

export default stocks;

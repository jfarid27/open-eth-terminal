import { ExchangeSymbol, ExchangeSymbolType } from "../../types.ts";
import { fetchSpotCoingecko } from "./CoinGeckoApi.ts";
import { fetchChartAlphavantage } from "./AlphavantageApi.ts";

/**
 * Fetches the current price for a specified symbol.
 * @param symbol Specified symbol to fetch current price for.
 */
export async function spot(symbol: ExchangeSymbol, COINGECKO_API_KEY: string) {
    switch (symbol._type) {
        case ExchangeSymbolType.CoinGecko:
            return await fetchSpotCoingecko(symbol, COINGECKO_API_KEY);
        default:
            throw new Error(`Unsupported symbol type: ${symbol._type}`);
    }
}

export async function chart(symbol: ExchangeSymbol, API_KEY: string) {
    switch (symbol._type) {
        case ExchangeSymbolType.CoinGecko:
            return await fetchChartAlphavantage(symbol, API_KEY);
        default:
            throw new Error(`Unsupported symbol type: ${symbol._type}`);
    }
}

export default { 
    coingecko: { spot }, 
    alphavantage: { chart }
};
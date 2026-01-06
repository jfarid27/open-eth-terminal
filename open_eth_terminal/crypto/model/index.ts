import { CryptoSymbolType } from "../types.ts";
import { DataSourceType } from "../../types.ts";
import { fetchSpotCoingecko } from "./CoinGeckoApi.ts";

/**
 * Fetches the current price for a specified symbol.
 * @param symbol Specified symbol to fetch current price for.
 */
export async function spot(symbol: CryptoSymbolType, COINGECKO_API_KEY: string) {
    switch (symbol._type) {
        case DataSourceType.CoinGecko:
            return await fetchSpotCoingecko(symbol, COINGECKO_API_KEY);
        default:
            throw new Error(`Unsupported symbol type: ${symbol._type}`);
    }
}

export async function chart(symbol: CryptoSymbolType, COINGECKO_API_KEY: string) {
    return undefined;
}

export default { spot, chart };
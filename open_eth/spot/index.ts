import { ExchangeSymbol, ExchangeSymbolType } from "../types/symbols.ts";
import { fetchSpotCoingecko } from "./model/CoinGeckoApi.ts";

/**
 * Fetches the current price for a specified symbol.
 * @param symbol Specified symbol to fetch current price for.
 */
export async function spot(symbol: ExchangeSymbol) {
    switch (symbol._type) {
        case ExchangeSymbolType.CoinGecko:
            return fetchSpotCoingecko(symbol);
        default:
            throw new Error(`Unsupported symbol type: ${symbol._type}`);
    }
}

export default spot;
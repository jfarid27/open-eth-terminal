import axios from "axios";
import { lensPath, view, defaultTo, pipe } from "ramda";
import { DataSourceType } from "../../types.ts";
import { CryptoSymbolType } from "../types.ts";

const COINGECKO_API = "https://api.coingecko.com/api/v3/simple/price";

export type fetchSpotCoingeckoResponse = {
    symbol: CryptoSymbolType;
    price: number;
};

/**
 * Fetches the current price for a specified symbol from the CoinGecko API.
 * 
 * @param symbol The symbol to fetch the price for.
 * @param COINGECKO_API_KEY The CoinGecko API key.
 * @returns The current price for the specified symbol.
 */
export async function fetchSpotCoingecko(symbol: CryptoSymbolType, COINGECKO_API_KEY: string): Promise<fetchSpotCoingeckoResponse> {
    if (symbol._type !== DataSourceType.CoinGecko) {
        throw new Error("Invalid data source type");
    }
    const response = await axios.get(COINGECKO_API, {
        params: {
            vs_currencies: "usd",
            ids: symbol.id,
            x_cg_demo_api_key: COINGECKO_API_KEY,
        },
    });
    
    const price = pipe(
        view(lensPath([symbol.id, "usd"])),
        defaultTo(0)
    )(response.data);

    return { symbol, price };
}
import axios from "axios";
import { lensPath, view, defaultTo, pipe } from "ramda";
import { ExchangeSymbol } from "../../types.ts";

const COINGECKO_API = "https://api.coingecko.com/api/v3/simple/price";

export type fetchSpotCoingeckoResponse = {
    symbol: ExchangeSymbol;
    price: number;
};

/**
 * Returns a lens for the price of a symbol from the CoinGecko API response.
 * 
 * @param symbol The symbol to get the price for.
 * @returns A lens for the price of the symbol.
 */
const CoinGeckoLensPrice = (symbol: ExchangeSymbol) => lensPath([symbol.id, "usd"]);

/**
 * Fetches the current price for a specified symbol from the CoinGecko API.
 * 
 * @param symbol The symbol to fetch the price for.
 * @param COINGECKO_API_KEY The CoinGecko API key.
 * @returns The current price for the specified symbol.
 */
export async function fetchSpotCoingecko(symbol: ExchangeSymbol, COINGECKO_API_KEY: string): Promise<fetchSpotCoingeckoResponse> {
    const response = await axios.get(COINGECKO_API, {
        params: {
            vs_currencies: "usd",
            ids: symbol.id,
            x_cg_demo_api_key: COINGECKO_API_KEY,
        },
    });
    
    const price = pipe(
        view(CoinGeckoLensPrice(symbol)),
        defaultTo(0)
    )(response.data);

    return { symbol, price };
}
import axios from "axios";
import { lensPath, view, defaultTo, pipe } from "ramda";
import { COINGECKO_API_KEY } from "../../config.ts";
import { ExchangeSymbol } from "../../types/symbols.ts";

const COINGECKO_API = "https://api.coingecko.com/api/v3/simple/price";

// https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=bitcoin&x_cg_demo_api_key=CG-K6DJf3NW7XupuMyLpsE4kBeT
    
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
 * @returns The current price for the specified symbol.
 */
export async function fetchSpotCoingecko(symbol: ExchangeSymbol): Promise<fetchSpotCoingeckoResponse> {
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
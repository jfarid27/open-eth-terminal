import axios from "axios";
import { pause } from "./../../../utils/timing.ts";

/**
 * Fetches market data for a given event ticker from Kalshi.
 * @param eventTicker The event ticker to fetch markets for (e.g., "KXHIGHNY-26JAN10").
 * @param limit The maximum number of markets to fetch (optional).
 * @link https://docs.kalshi.com/getting_started/quick_start_market_data
 */
export async function fetchMarketsByEventTicker(eventTicker: string, limit?: number) {
    const response = await axios.get(
        `https://api.elections.kalshi.com/trade-api/v2/markets`,
        {
            params: {
                event_ticker: eventTicker,
                ...(limit && { limit }),
            },
        }
    );
    await pause(1000);
    return response.data;
}

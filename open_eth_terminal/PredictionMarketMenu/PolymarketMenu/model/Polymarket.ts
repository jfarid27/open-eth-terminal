import axios from "axios";
import { pause } from "./../../../utils/timing.ts"

/**
 * Fetches the list of available topic tags from Polymarket.
 * @link https://docs.polymarket.com/api-reference/
 */
export async function fetchTopicsPolymarket() {
    const response = await axios.get("https://gamma-api.polymarket.com/tags", {
        params: {
            limit: 1000,
        },
    });
    return response.data;
}

/**
 * Fetches the event data for a given slug from Polymarket.
 * @param slug The slug of the event to fetch events for.
 * @link https://docs.polymarket.com/api-reference/
 */
export async function fetchEventDataBySlug(slug: string) {
    const response = await axios.get(
        `https://gamma-api.polymarket.com/events/slug/${slug}`
    );
    return response.data;
}

/**
 * Fetches the market data for a given slug from Polymarket.
 * @param slug The slug of the market to fetch data for.
 * @link https://docs.polymarket.com/api-reference/
 */
export async function fetchMarketDataBySlug(slug: string) {

    const url = `https://gamma-api.polymarket.com/markets/slug/${slug}`;
    const response = await axios.get(url);
    await pause(1000);
    return response.data;
}

/**
 * Fetches the list of available events from Polymarket.
 * @param tagId The ID of the tag to fetch events for.
 * @link https://docs.polymarket.com/api-reference/
 */
export async function fetchEventDataByTagId(tagId: string) {
    const response = await axios.get(
        `https://gamma-api.polymarket.com/events`,
        {
            params: {
                tag_id: tagId,
            },
        }
    );
    return response.data;
}

/**
 * Fetches the list of available markets from Polymarket.
 * @param tagId The ID of the tag to fetch markets for.
 * @link https://docs.polymarket.com/api-reference/
 */
export async function fetchMarketDataByTagId(tagId: string) {
    const response = await axios.get(
        `https://gamma-api.polymarket.com/markets`,
        {
            params: {
                tag_id: tagId,
                closed: false,
                order: 'liquidityNum',
                ascending: false,
            },
        }
    );
    return response.data;
}

/**
 * Fetches the list of available events from Polymarket.
 * @param limit The number of events to fetch.
 * @link https://docs.polymarket.com/api-reference/
 */
export async function fetchTopEventData(limit: number = 10) {
    const response = await axios.get(
        'https://gamma-api.polymarket.com/events',
        {
            params: {
                order: 'liquidityNum',
                ascending: false,
                closed: false,
                limit,
                volume_num_min: 100000
            },
        }
    );
    await pause(1000);
    return response.data;
}

/**
 * Fetches the list of available markets from Polymarket.
 * @param limit The number of markets to fetch.
 * @link https://docs.polymarket.com/api-reference/
 */
export async function fetchTopMarketData(limit: number = 10) {
    const response = await axios.get(
        'https://gamma-api.polymarket.com/markets',
        {
            params: {
                order: 'liquidityNum',
                ascending: false,
                closed: false,
                limit,
                volume_num_min: 100000
            },
        }
    );
    await pause(1000);
    return response.data;
}

export async function fetchUserPositions(address: string) {
    const response = await axios.get(
        `https://data-api.polymarket.com/positions/`,
        {
            params: {
                user: address,
            },
        }
    );
    return response.data;
}
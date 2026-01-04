import axios from "axios";

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
            },
        }
    );
    return response.data;
}

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
    return response.data;
}
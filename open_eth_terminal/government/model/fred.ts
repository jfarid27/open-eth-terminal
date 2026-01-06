import axios from "axios";

export async function fetchTopMarketData(id: number = 52, fredAPIKey: string) {

    const url = `https://api.stlouisfed.org/fred/v2/release/observations`;
    const response = await axios.get(
        url,
        {
            headers: {
                'x-api-key': fredAPIKey,
            },
            params: {
                release_id: id,
                format: 'json',
            },
        }
    );
    return response.data;
}
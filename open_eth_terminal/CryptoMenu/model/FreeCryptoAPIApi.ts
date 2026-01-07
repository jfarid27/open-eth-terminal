import { CryptoSymbolType } from "../types.ts";
import { lens, prop, view } from "ramda";
import axios from "axios";

const URL = "https://api.freecryptoapi.com/v1"

export async function fetchChartFreeCryptoAPI(symbol: CryptoSymbolType, API_KEY: string) {
    const symbolId = symbol.id;
    const response = await axios.get(`${URL}/getHistory`, {
        headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Accept": "application/json"
        },
        params: {
            symbol: symbolId,
            days: "14"
        },
    });
    return response.data;
}
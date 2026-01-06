import { ExchangeSymbol } from "../../types.ts";
import axios from "axios";

export async function fetchChartAlphavantage(symbol: ExchangeSymbol, ALPHAVANTAGE_API_KEY: string): Promise<any> {
    const symbolId = symbol.id;
    const ALPHAVANTAGE_CHART_API = 'https://www.alphavantage.co/query';
    const response = await axios.get(ALPHAVANTAGE_CHART_API, {
        headers: {
            "Content-Type": "application/json",
            "User-Agent": "request"
        },
        params: {
            "apikey": ALPHAVANTAGE_API_KEY,
            "market": "USD",
            "symbol": symbolId,
            "function": "DIGITAL_CURRENCY_DAILY",
            "interval": "60min",
            "outputsize": "compact",
            "datatype":"json"
        },
        responseType: "json"
    })
    
    return JSON.parse(response.data);
}
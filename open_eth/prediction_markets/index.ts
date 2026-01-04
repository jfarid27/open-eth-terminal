import { fetchTopicsPolymarket, fetchEventData, fetchMarketData } from "./model/Polymarket.ts";


const PolymarketData = {
    tags: {
        get: fetchTopicsPolymarket,
    },
    events: {
        get: fetchEventData,
    },
    markets: {
        get: fetchMarketData,
    },
}
export default PolymarketData;
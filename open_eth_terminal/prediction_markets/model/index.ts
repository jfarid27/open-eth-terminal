import { fetchTopicsPolymarket, fetchEventData, fetchMarketData } from "./Polymarket.ts";

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

const PredictionMarketsData = {
   polyMarketData: PolymarketData,    
}

export default PredictionMarketsData;
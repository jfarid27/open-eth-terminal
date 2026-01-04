import { fetchTopicsPolymarket, fetchEventDataByTagId, fetchMarketDataByTagId, fetchTopMarketData } from "./Polymarket.ts";

const PolymarketData = {
    tags: {
        get: fetchTopicsPolymarket,
    },
    events: {
        getByTagId: fetchEventDataByTagId,
    },
    markets: {
        getByTagId: fetchMarketDataByTagId,
        top: fetchTopMarketData,
    },
}

const PredictionMarketsData = {
   polyMarketData: PolymarketData,    
}

export default PredictionMarketsData;
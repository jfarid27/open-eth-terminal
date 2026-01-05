import {
    fetchTopicsPolymarket, fetchEventDataByTagId,
    fetchMarketDataByTagId, fetchTopMarketData,
    fetchMarketDataBySlug,
    fetchEventDataBySlug,
} from "./Polymarket.ts";

const PolymarketData = {
    tags: {
        get: fetchTopicsPolymarket,
    },
    events: {
        getByTagId: fetchEventDataByTagId,
    },
    event: {
        getBySlug: fetchEventDataBySlug,
    },
    markets: {
        getByTagId: fetchMarketDataByTagId,
        top: fetchTopMarketData,
    },
    market: {
        getBySlug: fetchMarketDataBySlug,
    },
}

const PredictionMarketsData = {
   polyMarketData: PolymarketData,    
}

export default PredictionMarketsData;
import {
    fetchTopicsPolymarket, fetchEventDataByTagId,
    fetchMarketDataByTagId, fetchTopEventData,
    fetchTopMarketData,
    fetchMarketDataBySlug,
    fetchEventDataBySlug,
    fetchUserPositions,
} from "./Polymarket.ts";

const PolymarketData = {
    tags: {
        get: fetchTopicsPolymarket,
    },
    events: {
        getByTagId: fetchEventDataByTagId,
        top: fetchTopEventData,
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
    user: {
        getPositions: fetchUserPositions,
    }
}

const PredictionMarketsData = {
   polyMarketData: PolymarketData,    
}

export default PredictionMarketsData;
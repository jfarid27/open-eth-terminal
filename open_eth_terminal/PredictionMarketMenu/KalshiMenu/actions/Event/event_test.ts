import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { eventMockData } from "./constants.ts";
import { processMarketsData } from "./index.ts"

describe("Kalshi Event Data Transformer", () => {
    const processedMarkets = processMarketsData(eventMockData.markets);
    const firstMarket = processedMarkets[0];
    const secondMarket = processedMarkets[1];
    
    describe("Market Summary Data", () => {
        it("should extract correct summary data for first market", () => {
            expect(firstMarket.summary.title,
                "Title should be correctly extracted"
            ).toBe(eventMockData.markets[0].title);

            expect(firstMarket.summary.subtitle,
                "Subtitle should be correctly extracted"
            ).toBe(eventMockData.markets[0].subtitle);

            expect(firstMarket.summary.volume,
                "Volume should be correctly extracted"
            ).toBe(eventMockData.markets[0].volume);

            expect(firstMarket.summary.volume_24h,
                "Volume 24h should be correctly extracted"
            ).toBe(eventMockData.markets[0].volume_24h);

            expect(firstMarket.summary.liquidity,
                "Liquidity should be correctly extracted"
            ).toBe(eventMockData.markets[0].liquidity);

            expect(firstMarket.summary.liquidity_dollars,
                "Liquidity in dollars should be correctly extracted"
            ).toBe(eventMockData.markets[0].liquidity_dollars);
        });
        
        it("should extract correct summary data for second market", () => {
            expect(secondMarket.summary.title,
                "Title should be correctly extracted"
            ).toBe(eventMockData.markets[1].title);

            expect(secondMarket.summary.volume,
                "Volume should be correctly extracted"
            ).toBe(eventMockData.markets[1].volume);
        });
    });
    
    describe("Bid/Ask Data with Spreads", () => {
        it("should correctly compute Yes option bid/ask/spread for first market", () => {
            expect(firstMarket.bidAsk.yes.bid,
                "Yes bid should be correctly extracted"
            ).toBe("0.15");
            
            expect(firstMarket.bidAsk.yes.ask,
                "Yes ask should be correctly extracted"
            ).toBe("0.18");
            
            expect(firstMarket.bidAsk.yes.spread,
                "Yes spread should be correctly computed"
            ).toBe("0.0300");
        });
        
        it("should correctly compute No option bid/ask/spread for first market", () => {
            expect(firstMarket.bidAsk.no.bid,
                "No bid should be correctly extracted"
            ).toBe("0.82");
            
            expect(firstMarket.bidAsk.no.ask,
                "No ask should be correctly extracted"
            ).toBe("0.85");
            
            expect(firstMarket.bidAsk.no.spread,
                "No spread should be correctly computed"
            ).toBe("0.0300");
        });
        
        it("should correctly compute Yes option bid/ask/spread for second market", () => {
            expect(secondMarket.bidAsk.yes.bid,
                "Yes bid should be correctly extracted"
            ).toBe("0.05");
            
            expect(secondMarket.bidAsk.yes.ask,
                "Yes ask should be correctly extracted"
            ).toBe("0.08");
            
            expect(secondMarket.bidAsk.yes.spread,
                "Yes spread should be correctly computed"
            ).toBe("0.0300");
        });
    });
    
    describe("Price Range Data", () => {
        it("should extract correct price range for first market", () => {
            expect(firstMarket.priceRange.start,
                "Price range start should be correctly extracted"
            ).toBe("0.01");
            
            expect(firstMarket.priceRange.end,
                "Price range end should be correctly extracted"
            ).toBe("0.99");
        });
        
        it("should extract correct price range for second market", () => {
            expect(secondMarket.priceRange.start,
                "Price range start should be correctly extracted"
            ).toBe("0.01");
            
            expect(secondMarket.priceRange.end,
                "Price range end should be correctly extracted"
            ).toBe("0.99");
        });
    });
    
    describe("Multiple Markets Processing", () => {
        it("should process both markets from the response", () => {
            expect(processedMarkets.length,
                "Should process both markets"
            ).toBe(2);
        });
    });
});

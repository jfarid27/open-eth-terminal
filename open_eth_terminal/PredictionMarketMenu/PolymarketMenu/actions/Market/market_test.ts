import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { mockMarketData } from "./constants.ts";
import { processMarketSlugDataResponse, processMarketPriceHistory } from "./index.ts"

describe("Polymarket Market Data Transformer", () => {
    const { marketData, outcomeData } = processMarketSlugDataResponse(mockMarketData); 
    const outcomePoint = outcomeData[0];
    const outcomes = outcomePoint[1];
    
    describe("Outcome Data", () => {
        it("should return the correct outcome data", () => {
            expect(outcomePoint[0],
                "Outcome Question should be correctly identified."
            ).toBe(mockMarketData.question);
            expect(outcomes[0][0],
                "Outcome Yes should be correctly identified."
            ).toBe("Yes");
            expect(outcomes[0][1],
                "Outcome Yes price should be correctly identified."
            ).toBe("0.42");
            expect(outcomes[1][0],
                "Outcome No should be correctly identified."
            ).toBe("No");
            expect(outcomes[1][1],
                "Outcome No price should be correctly identified."
            ).toBe("0.58");
        });
    });
   
    describe("Market Data", () => {
        it("should return the correct market data", () => {
            
            expect(marketData[0],
                "Active should be correctly identified"
            ).toBe(mockMarketData.active);

            expect(marketData[1],
                "Liquidity should be correctly identified"
            ).toBe(mockMarketData.liquidityNum);

            expect(marketData[2],
                "Volume should be correctly identified"
            ).toBe(mockMarketData.volumeNum);
        
        });
    });
    
    describe("Price History Processing", () => {
        it("should process price history correctly with timestamp and price fields", () => {
            const mockPriceHistory = {
                history: [
                    { t: 1704067200, p: 0.42 },
                    { t: 1704153600, p: 0.45 },
                    { t: 1704240000, p: 0.43 }
                ]
            };
            
            const processed = processMarketPriceHistory(mockPriceHistory);
            
            expect(processed.length,
                "Should have correct number of price points"
            ).toBe(3);
            
            expect(processed[0].timestamp,
                "First timestamp should be correctly extracted"
            ).toBe(1704067200);
            
            expect(processed[0].price,
                "First price should be correctly extracted"
            ).toBe(0.42);
            
            expect(processed[1].timestamp,
                "Second timestamp should be correctly extracted"
            ).toBe(1704153600);
            
            expect(processed[1].price,
                "Second price should be correctly extracted"
            ).toBe(0.45);
        });
    });
    
});

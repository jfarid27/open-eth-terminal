import { afterEach, beforeEach, describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { mockMarketData } from "./constants.ts";
import { processMarketSlugDataResponse } from "./index.ts"

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
                "Title should be correctly identified"
            ).toBe(mockMarketData.active);

            expect(marketData[1],
                "Liquidity be correctly identified"
            ).toBe(mockMarketData.liquidityNum);

            expect(marketData[2],
                "Volume be correctly identified"
            ).toBe(mockMarketData.volumeNum);
        
        });
    });
    
    
});

import {
    ActionHandler, CommandResultType, CommandState, TerminalUserStateConfig,
    LogLevel
} from "./../../../../types.ts";
import terminalKit from "terminal-kit";
import PredictionMarketsData from "./../../model/index.ts";
const { terminal } = terminalKit;
import { inspectLogger } from "./../../../../utils/logging.ts";
import chalk from "chalk";
import { zip, pipe, props, map } from "ramda";

export const xPolymarketMarketData = props([
    "active",
    "liquidityNum",
    "volumeNum",
]);

/**
 * Maps the polymarket event data for outcomes and outcome prices to a string array.
 */
export const outcomePricesMapper = (r: string): string[] => {
    try {
        const parsed = JSON.parse(r);
        return parsed as string[];
    } catch (error) {
        return ["NA"];
    }
}

/**
 * Zips the polymarket event data for outcomes and outcome prices.
 */
export const zipEventOutcomePrices = (r: any) => {
    return zip(
        outcomePricesMapper(r.outcomes),
        outcomePricesMapper(r.outcomePrices)
    );
}

/**
 * Processes the outcome data for the given list of markets.
 * 
 * @param markets List of markets to process.
 * @returns Array of [question, outcomes] pairs.
 */
export const processOutcomeData = pipe(
    map((r:any) => {
        return [r.question, zipEventOutcomePrices(r)];
    }),
)

export const processMarketSlugDataResponse = pipe(
    (r: any) => ({
        marketData: xPolymarketMarketData(r) as string[],
        outcomeData: processOutcomeData([r]),
    }),
);

/**
 * Fetches market for the given market id.
 * @param st Terminal User State 
 * @param tag Polymarket Defined Market ID. 
 * @returns CommandState 
 */
export const predictionMarketViewHandler: ActionHandler = (st: TerminalUserStateConfig) => async (slug?: string): Promise<CommandState> => {
    const applicationLogging = inspectLogger(st);
    
    if (!slug) {
        console.log("No slug provided");
        return {
            result: { type: CommandResultType.Success },
            state: st,
        };
    }
    const response = await PredictionMarketsData.polyMarketData.market.getBySlug(slug);
    const { marketData, outcomeData } = processMarketSlugDataResponse(response);
    applicationLogging(LogLevel.Debug)(response);
    
    console.log(chalk.blue.bold("Market Data"))
    console.log(chalk.blue("Question: " + response.question))
    console.log(chalk.blue("Slug: " + response.slug))
    console.log(chalk.yellow("Description: " + response.description))
    
    terminal.table([
        ['Active', 'Liquidity', 'Volume'],
        marketData,
    ], {
        hasBorder: true,
        contentHasMarkup: true,
        borderChars: 'lightRounded',
        borderAttr: { color: 'green' },
        textAttr: { bgColor: 'default' },
        firstRowTextAttr: { bgColor: 'green' },
        width: 120,
        fit: true
    });

    for (const [question, outcomePrices] of outcomeData) {
        terminal.table([
            [question, ""],
            ['Outcome', 'Price'],
            ...outcomePrices,
        ], {
            hasBorder: true,
            contentHasMarkup: true,
            borderChars: 'lightRounded',
            borderAttr: { color: 'green' },
            textAttr: { bgColor: 'default' },
            firstRowTextAttr: { bgColor: 'blue' },
            width: 120,
            fit: true
        });
    }

    return {
        result: { type: CommandResultType.Success },
        state: st,
    };
}
import { project, pipe, set, filter, toLower, lensProp, map,
    lensPath, view, defaultTo, zip, tap, find,
    props,
    reduce
} from "ramda";
import terminalKit from "terminal-kit";
const { terminal } = terminalKit;
import {
    CommandResultType, CommandState,
    LogLevel
} from "./../../../../types.ts";
import { TerminalUserStateConfig } from "./../../../../types.ts";
import { ActionHandler } from "./../../../../types.ts";
import chalk from "chalk";
import { inspectLogger } from "./../../../../utils/logging.ts"
import PredictionMarketsData from "./../../model/index.ts";

/**
 * Pull relevant market data from the polymarket API response for given slug.
 */
const xPolymarketEventData = props([
    "slug",
    "active",
    "liquidity",
    "volume",
    "competitive"
]);

/**
 * Maps the polymarket event data for outcomes and outcome prices to a string array.
 */
const outcomePricesMapper = (r: string): string[] => {
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
const zipEventOutcomePrices = (r: any) => {
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


/**
 * Processes the event data for the given market by slug.
 */
export const processEventDataBySlug = pipe(
    (r: any) => ({
        response: r,
        marketData: xPolymarketEventData(r) as string[],
        outcomeData: processOutcomeData(r.markets),
    }),
);

/**
 * Fetches event for the given event slug. Note events have multiple markets.
 * @param st Terminal User State 
 * @param slug Polymarket Defined Event Slug. 
 * @returns CommandState 
 */
export const predictionEventViewHandler: ActionHandler = (st: TerminalUserStateConfig) => async (slug?: string): Promise<CommandState> => {
    const applicationLogging = inspectLogger(st);
    
    if (!slug) {
        console.log("No slug provided");
        return {
            result: { type: CommandResultType.Success },
            state: st,
        };
    }
    
    const response = await PredictionMarketsData.polyMarketData.event.getBySlug(slug);
    const { marketData, outcomeData } = processEventDataBySlug(response);
    applicationLogging(LogLevel.Debug)(response);
    
    console.log(chalk.blue.bold("Market Data"))
    console.log(chalk.blue("Title: ") + response.title)
    console.log(chalk.blue("Description: ") + response.description)

    terminal.table([
        ['Slug', 'Active', 'Liquidity', 'Volume', 'Competitive'],
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
    
    console.log(chalk.blue.bold("Outcome Data"))
    
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
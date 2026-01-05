/**
 * @file Polymarket Actions
 * @description ActionHandlers for fetching and displaying polymarket data.
 * @note ActionHandlers are functions that take a TerminalUserStateConfig and return a Promise<CommandState>
 * @see {@link ActionHandler}
 */

import { project, pipe, set, filter, toLower, lensProp, map,
    lensPath, view, defaultTo, zip, tap,
    props
} from "ramda";
import terminalKit from "terminal-kit";
const { terminal } = terminalKit;
import PredictionMarketsData from "./../model/index.ts";
import {CommandResultType, CommandState, PredictionMarketsType } from "./../../types.ts";
import { TerminalUserStateConfig } from "./../../types.ts";
import { ActionHandler } from "./../../types.ts";
import chalk from "chalk";

/**
 * Lens path for predictions markets data on the User State.
 */
const xPolymarketTagData = lensPath(["loadedContext", "predictionMarkets", "data"]);

/**
 * Lens path for prediction market type stored on the User State.
 */
const xPredictionMarketType = lensPath(["loadedContext", "predictionMarkets", "type"]);

/**
 * Lens path for polymarket prediction market properties returned by the polymarket API.
 */
const xPolymarketMarketsData = project(["slug", "question", "outcomes", "outcomePrices", "volume", "liquidity"])


/**
 * Formats the markets data for display in a terminal table.
 */
const formatMarketsDataForTable = pipe(
    map((r: any) => {
        
        const outcomes = JSON.parse(r.outcomes);
        const outcomePrices = JSON.parse(r.outcomePrices);
        const volume = r.volume;
        const liquidity = r.liquidity;
        const outcomesText = zip(outcomes, outcomePrices).map((o) => `${o[0]}: ${o[1]}`).join(", ");
        
        return [
            r.slug,
            r.question,
            `${outcomesText}\nVolume: ${volume}\nLiquidity: ${liquidity}`
        ]
    })
)

/**
 * Projects the tag properties from the polymarket API response.
 */
const getTagProps = project(["id", "label", "slug"]);

/**
 * Lens path for tag label returned by the polymarket API..
 */
const xLabel = lensProp<any>('label');  

/**
 * Returns a function that is truthy if the label of the tag includes the target string.
 */
const stringLabelIncludes = (target: string) => pipe(
    view(xLabel),
    defaultTo(""),
    toLower,
    (val) => val.includes(target.toLowerCase())
);

/**
 * Projects the tag properties from the polymarket API response.
 */
const processTags = pipe(
    getTagProps
);

/**
 * Filters the tags by the target string.
 */
const filterTags = (target: string) => pipe(
    processTags,
    filter(stringLabelIncludes(target))
);

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
 * Processes the outcome data for the given market.
 */
const processOutcomeData = pipe(
    filter((r:any) => !r.closed),
    map((r:any) => {
        return [r.question, zipEventOutcomePrices(r)];
    }),
)

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
 * Fetches event for the given event slug.
 * @param st Terminal User State 
 * @param slug Polymarket Defined Event Slug. 
 * @returns CommandState 
 */
export const predictionEventViewHandler: ActionHandler = (st: TerminalUserStateConfig) => async (slug?: string): Promise<CommandState> => {
    
    if (!slug) {
        console.log("No slug provided");
        return {
            result: { type: CommandResultType.Success },
            state: st,
        };
    }
    
    const response = await PredictionMarketsData.polyMarketData.event.getBySlug(slug);
    
    const xPolymarketMarketData = props([
        "slug",
        "active",
        "liquidity",
        "volume",
        "competitive"
    ]);
    
    const marketData = pipe(
        xPolymarketMarketData,
    )(response) as string[];
    
    const outcomeData = pipe(
        processOutcomeData,
    )(response.markets)
    
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

/**
 * Fetches market for the given market id.
 * @param st Terminal User State 
 * @param tag Polymarket Defined Market ID. 
 * @returns CommandState 
 */
export const predictionMarketViewHandler: ActionHandler = (st: TerminalUserStateConfig) => async (slug?: string): Promise<CommandState> => {
    
    if (!slug) {
        console.log("No slug provided");
        return {
            result: { type: CommandResultType.Success },
            state: st,
        };
    }
    
    const response = await PredictionMarketsData.polyMarketData.market.getBySlug(slug);
    
    const xPolymarketMarketData = props([
        "active",
        "liquidityNum",
        "volumeNum",
    ])
    
    const marketData = pipe(
        xPolymarketMarketData
    )(response) as string[];
    
    const outcomeData = pipe(
        processOutcomeData 
    )([response])
    
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

/**
 * Fetches markets linked to the given tag (default: all)
 * @param st Terminal User State 
 * @param tag Polymarket Defined Tag ID. 
 * @returns CommandState 
 */
export const predictionMarketsViewHandler: ActionHandler = (st: TerminalUserStateConfig) => async (tag?: string): Promise<CommandState> => {
    
    if (!tag) {
        console.log("No tag provided");
        return {
            result: { type: CommandResultType.Success },
            state: st,
        };
    }
    
    const markets = await PredictionMarketsData.polyMarketData.markets.getByTagId(tag);
    
    const marketsData = pipe(
        xPolymarketMarketsData,
        formatMarketsDataForTable
    )(markets);
    
    terminal.table([
        ['ID', 'Question', 'Information'],
        ...marketsData,
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
    
    return {
        result: { type: CommandResultType.Success },
        state: st,
    };
}

/**
 * Fetches the top active markets on polymarket by liquidity
 * @param st Terminal User State
 * @param n Number of markets to fetch
 * @returns CommandState
 */
export const polymarketMarketsTopFetchHandler: ActionHandler = (st: TerminalUserStateConfig) =>
    async (n?: string, term?: string) => {
    
        if (st.logLevel) {
            console.log("Fetching top markets");
        }
        
        const limit = n ? Number(n) : 10;
        const markets = await PredictionMarketsData.polyMarketData.markets.top(limit);
        
        let marketsData = pipe(
            xPolymarketMarketsData,
            formatMarketsDataForTable,
            filter((market: any) => term ? market[1].toLowerCase().includes(term.toLowerCase()) : true),
            map((market: any) => {
                return [market[1] + "\nSlug: " + market[0], market[2]];
            })
        )(markets);
        
        terminal.table([
            ['Question', 'Information'],
            ...marketsData,
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
        
        if (st.logLevel) {
            console.log(`${markets.length} markets fetched`);
        }
        
        return {
            result: { type: CommandResultType.Success },
            state: st,
        };
}

/**
 * Fetches the list of available tags on polymarket. Stores the tags in the terminal user state.
 * @param st Terminal User State
 * @param search Search term
 * @returns CommandState
 */
export const polymarketMarketsTagsFetchHandler: ActionHandler = (st: TerminalUserStateConfig) => async (search?: string) => {
    
    if (st.logLevel) {
        console.log("Fetching tags");
    }
    const tags = await PredictionMarketsData.polyMarketData.tags.get();
    const formattedTags = processTags(tags);
    
    if (st.logLevel) {
        console.log(`${tags.length} tags fetched`);
    }
    
    const newSt1 = set(xPolymarketTagData, formattedTags, st);
    const newSt2 = set(xPredictionMarketType, PredictionMarketsType.Polymarket, newSt1);
    
    console.log("Tags added to storage. Search with 'search <term>'")
    return {
        result: { type: CommandResultType.Success },
        state: newSt2,
    };
}

/**
 * Searches for tags on polymarket. If there is a cached list of tags, it will search those. 
 * @param st Terminal User State
 * @param search Search term
 * @returns CommandState
 */
export const polymarketMarketsTagsSearchHandler: ActionHandler = (st: TerminalUserStateConfig) => async (search?: string) => {
    
    if (!search) {
        console.log("No search term provided");
        return {
            result: { type: CommandResultType.Success },
            state: st,
        };
    }
    
    const tags = view(xPolymarketTagData, st);
    
    if (tags) {
        const filteredTags = filterTags(search)(tags);
        const tableFilteredObjects = filteredTags
            .map((tag: any) => [tag.label, tag.slug, tag.id]);

        terminal.table([
            ['Label', 'Slug', 'ID'],
            ...tableFilteredObjects,
        ], {
            hasBorder: true,
            contentHasMarkup: true,
            borderChars: 'lightRounded',
            borderAttr: { color: 'green' },
            textAttr: { bgColor: 'default' },
            firstRowTextAttr: { bgColor: 'green' },
            width: 60,
            fit: true
        });

        return {
            result: { type: CommandResultType.Success },
            state: st,
        };
    }
    
    console.log("No tags found");
    return {
        result: { type: CommandResultType.Success },
        state: st,
    };

}

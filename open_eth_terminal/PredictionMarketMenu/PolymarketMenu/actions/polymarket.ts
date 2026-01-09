/**
 * @file Polymarket Actions
 * @description ActionHandlers for fetching and displaying polymarket data.
 * @note ActionHandlers are functions that take a TerminalUserStateConfig and return a Promise<CommandState>
 * @see {@link ActionHandler}
 */

import { project, pipe, set, filter, toLower, lensProp, map,
    lensPath, view, defaultTo, zip, tap, find,
    props,
    reduce
} from "ramda";
import terminalKit from "terminal-kit";
const { terminal } = terminalKit;
import PredictionMarketsData from "./../model/index.ts";
import {CommandResultType, CommandState, PredictionMarketsType, LogLevel } from "./../../../types.ts";
import { TerminalUserStateConfig } from "./../../../types.ts";
import { ActionHandler } from "./../../../types.ts";
import chalk from "chalk";
import { inspectLogger } from "./../../../utils/logging.ts"
import { loadCSVPortfolio } from "./../../../utils/loaders.ts";
import { PolymarketPortfolio, PolymarketPosition, PortfolioAnalysisType } from "./types.ts";
import { LOG_LEVEL } from "../../../config.ts";
import { responseEncoding } from "axios";

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
 * Zips the polymarket event data for outcomes and outcome prices.
 */
const zipEventOutcomePrices = (r: any) => {
    return zip(
        outcomePricesMapper(r.outcomes),
        outcomePricesMapper(r.outcomePrices)
    );
}


const xPolymarketMarketData = props([
    "active",
    "liquidityNum",
    "volumeNum",
]);

/**
 * Processes the market data for the given market by slug.
 */
const processMarketDataBySlug = async (slug: string) => {
    
    const response = await PredictionMarketsData.polyMarketData.market.getBySlug(slug);
    const processResponse = pipe(
        (r: any) => ({
            response: r,
            marketData: xPolymarketMarketData(r) as string[],
            outcomeData: processOutcomeData([r]),
        }),
    );
    return processResponse(response);
};

/**
 * Fetches markets linked to the given tag (default: all)
 * @param st Terminal User State 
 * @param tag Polymarket Defined Tag ID. 
 * @returns CommandState 
 */
export const predictionMarketsViewHandler: ActionHandler = (st: TerminalUserStateConfig) => async (tag?: string): Promise<CommandState> => {
    const applicationLogging = inspectLogger(st); 

    if (!tag) {
        console.log("No tag provided");
        return {
            result: { type: CommandResultType.Success },
            state: st,
        };
    }
    
    const markets = await PredictionMarketsData.polyMarketData.markets.getByTagId(tag);
    
    applicationLogging(LogLevel.Debug)(markets);
    
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
        
        const applicationLogging = inspectLogger(st);
    
        if (st.logLevel) {
            console.log("Fetching top markets");
        }
        
        const limit = n ? Number(n) : 10;
        const markets = await PredictionMarketsData.polyMarketData.markets.top(limit);
        
        applicationLogging(LogLevel.Debug)(markets);
        
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
    
    const applicationLogging = inspectLogger(st);
    
    if (st.logLevel) {
        console.log("Fetching tags");
    }
    const tags = await PredictionMarketsData.polyMarketData.tags.get();
    
    applicationLogging(LogLevel.Debug)("Tags fetched");
    applicationLogging(LogLevel.Debug)(tags);
    
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
    
    const applicationLogging = inspectLogger(st); 
    
    if (!search) {
        console.log("No search term provided");
        return {
            result: { type: CommandResultType.Success },
            state: st,
        };
    }
    
    const tags = view(xPolymarketTagData, st);
    
    applicationLogging(LogLevel.Debug)("Stored Tags");
    applicationLogging(LogLevel.Debug)(tags);
    
    if (tags) {
        const filteredTags = filterTags(search)(tags);
        
        applicationLogging(LogLevel.Debug)("Filtered Tags");
        applicationLogging(LogLevel.Debug)(filteredTags);
        
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

const  formatPortfolioToPolymarketPortfolio = pipe(
    map((position: string[]): PolymarketPosition => {
        return {
            slug: position[0],
            outcome: position[1],
            amount: Number(position[2]),
        };
    }),
    (positions: PolymarketPosition[]) => {
        const polymarketPositions: PolymarketPortfolio = {
            positions: positions,
        }
        return polymarketPositions;
    }
)

export const portfolioAnalysisHandler: ActionHandler = (st: TerminalUserStateConfig) =>
    async (type?: string, filename?: string) => {
    
        const applicationLogging = inspectLogger(st); 
    
        if (!type || !filename) {
            console.log("No type or filename provided");
            return {
                result: { type: CommandResultType.Success },
                state: st,
            };
        }
        
        applicationLogging(LogLevel.Info)(`Loading portfolio at file ./portfolios/${filename}`);

        
        let portfolio: PolymarketPortfolio | undefined = undefined;
        try {
            const loaded_portfolio = await loadCSVPortfolio(filename);
            
            portfolio = formatPortfolioToPolymarketPortfolio(loaded_portfolio);
        } catch (err) {
            
            console.log("Error loading portfolio filename. Please check the filename and try again.")
            applicationLogging(LogLevel.Error)(err);
            return {
                result: { type: CommandResultType.Error },
                state: st,
            };
        }
        
        applicationLogging(LogLevel.Info)(portfolio);
        
        applicationLogging(LogLevel.Info)(`Fetching portfolio analysis for ${type} at file ./portfolios/${filename}`);
        
        if (type == PortfolioAnalysisType.Spot) {
            return portfolioAnalysisSpotHandler(st, portfolio);
        }
        
        
        return {
            result: { type: CommandResultType.Error},
            state: st,
        };
}

interface PositionPoint {
    outcome: string;
    price: number;
    amount: number;
    value: number;
}

interface PolymarketSpotPosition {
    slug: string,
    question: string,
    positionPoint: PositionPoint
}

const portfolioAnalysisSpotHandler = async (st: TerminalUserStateConfig, portfolio: PolymarketPortfolio) => {
    const applicationLogging = inspectLogger(st); 
    applicationLogging(LogLevel.Debug)(`Running Portfolio SpotHandler`);
    
    const portfolioDataPs = await pipe(
        map(async (position: PolymarketPosition): Promise<PolymarketSpotPosition> => {
            applicationLogging(LogLevel.Debug)("Processing MarketData for slug: " + position.slug);
            const { outcomeData, response } = await processMarketDataBySlug(position.slug);
            applicationLogging(LogLevel.Info)("Question: ");
            applicationLogging(LogLevel.Info)(response);
            applicationLogging(LogLevel.Debug)("Processed OutcomeData");
            applicationLogging(LogLevel.Debug)(outcomeData);
            const position_outcome = position.outcome;
            const outcomePrice = outcomeData[0].length > 1 && find((outcome: any[]) => outcome[0] === position_outcome)(outcomeData[0][1])
            
            if (!outcomePrice || outcomePrice.length < 2) {
                applicationLogging(LogLevel.Debug)(`Outcome ${position_outcome} not found for market ${position.slug}`);
                throw new Error(`Outcome ${position_outcome} not found for market ${position.slug}`); 

            }
            return {
                slug: position.slug,
                question: response.question,
                positionPoint: {
                    outcome: position.outcome,
                    amount: position.amount,
                    price: outcomePrice[1],
                    value: position.amount * outcomePrice[1],
                }
            };
        }),
    )(portfolio.positions);
    
    const portfolioData: PolymarketSpotPosition[] = await Promise.all(portfolioDataPs);
    const tablePortfolioData = map((r: PolymarketSpotPosition) => ([
        r.question,
        r.slug,
        r.positionPoint.amount.toString(),
        r.positionPoint.price.toString(),
        r.positionPoint.value.toString(),
    ]))(portfolioData);
    
    const totalValue = reduce((acc: number, r: PolymarketSpotPosition) => acc + r.positionPoint.value, 0)(portfolioData);
    
    applicationLogging(LogLevel.Debug)(portfolioData)

    terminal.table([
        ['Question', 'Slug', 'Amount', 'Price', 'Value'],
        ...tablePortfolioData
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
    
    console.log(chalk.blue(`Portfolio Total Value: ${totalValue}`));

    return {
        result: { type: CommandResultType.Success},
        state: st,
    };
    
}
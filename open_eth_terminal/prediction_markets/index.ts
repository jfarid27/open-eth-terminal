import terminalKit from "terminal-kit";
const { terminal } = terminalKit;
import { Menu, MenuOption, TerminalUserStateConfig, PredictionMarketsType } from "../types.ts";
import {CommandResultType, CommandState } from "../types.ts";
import { registerTerminalApplication } from "../utils/program_loader.ts";
import { menu_globals } from "../utils/menu_globals.ts";
import PredictionMarketsData from "./model/index.ts";
import { project, pipe, set, filter, toLower, lensProp, map, lensPath, view, defaultTo, zip } from "ramda";

const predictionMarketsViewHandler = (st: TerminalUserStateConfig) => async (tag?: string): Promise<CommandState> => {
    
    if (!tag) {
        console.log("No tag provided");
        return {
            result: { type: CommandResultType.Success },
            state: st,
        };
    }
    
    const markets = await PredictionMarketsData.polyMarketData.markets.getByTagId(tag);
    
    console.log(markets);
    
    return {
        result: { type: CommandResultType.Success },
        state: st,
    };
}

const getTagProps = project(["id", "label", "slug"]);
const xLabel = lensProp<any>('label');  

/*
 * Returns a function that is truthy if the label of the tag includes the target string.
 */
const stringLabelIncludes = (target: string) => pipe(
    view(xLabel),
    defaultTo(""),
    toLower,
    (val) => val.includes(target.toLowerCase())
);

const processTags = pipe(
    getTagProps
);

const filterTags = (target: string) => pipe(
    processTags,
    filter(stringLabelIncludes(target))
);

const xPolymarketTagData = lensPath(["loadedContext", "predictionMarkets", "data"]);
const xPredictionMarketType = lensPath(["loadedContext", "predictionMarkets", "type"]);

const xPolymarketMarketsData = project(["id", "question", "outcomes", "outcomePrices", "volume", "liquidity"])

const formatMarketsDataForTable = pipe(
    map((r: any) => {
        
        const outcomes = JSON.parse(r.outcomes);
        const outcomePrices = JSON.parse(r.outcomePrices);
        const volume = r.volume;
        const liquidity = r.liquidity;
        const outcomesText = zip(outcomes, outcomePrices).map((o) => `${o[0]}: ${o[1]}`).join(", ");
        
        return [
            r.id,
            r.question,
            `${outcomesText}\nVolume: ${volume}\nLiquidity: ${liquidity}`
        ]
    })
)

const polymarketMarketsTopFetchHandler = (st: TerminalUserStateConfig) => async (n?: string) => {
    
    if (st.logLevel) {
        console.log("Fetching top markets");
    }
    
    const limit = n ? Number(n) : 10;
    const markets = await PredictionMarketsData.polyMarketData.markets.top(limit);
    
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
    
    if (st.logLevel) {
        console.log(`${markets.length} markets fetched`);
    }
    
    return {
        result: { type: CommandResultType.Success },
        state: st,
    };
}

const polymarketMarketsTagsFetchHandler = (st: TerminalUserStateConfig) => async (search?: string) => {
    
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
    
    console.log("Market data added to storage. Search with 'search <term>'")
    return {
        result: { type: CommandResultType.Success },
        state: newSt2,
    };
}

const polymarketMarketsTagsSearchHandler = (st: TerminalUserStateConfig) => async (search?: string) => {
    
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

const predictionMarketsMenuOptions: MenuOption[] = [
    {
        name: "top",
        command: "top [limit]",
        description: "Fetch the top polymarket markets. If a limit is not provided, the top 10 markets by volume are returned.",
        action: polymarketMarketsTopFetchHandler,
    },
    {
        name: "markets",
        command: "markets [tag]",
        description: "Fetch markets for the given tag (default: all)",
        action: predictionMarketsViewHandler,
    },
    {
        name: "search",
        command: "search [symbol]",
        description: "Fetch available event and market tags useful for filtering.",
        action: polymarketMarketsTagsSearchHandler,
    },
    {
        name: "load",
        command: "load",
        description: "Fetch available event and market tags useful for filtering.",
        action: polymarketMarketsTagsFetchHandler,
    },

    ...menu_globals,
]

const predictionMarketsMenu: Menu = {
    name: "Prediction Markets Menu",
    description: "Prediction Markets Menu",
    messagePrompt: "Select an option:",
    options: predictionMarketsMenuOptions,
}


export const predictionMarketsTerminal = registerTerminalApplication(predictionMarketsMenu);
import terminalKit from "terminal-kit";
const { terminal } = terminalKit;
import { Menu, MenuOption, TerminalUserStateConfig, PredictionMarketsType } from "../types.ts";
import { ActionOptions, CommandResultType, CommandState } from "../types.ts";
import chalk from "chalk";
import { registerTerminalApplication } from "../utils/program_loader.ts";
import inquirer from "inquirer";
import { Command } from "commander";
import { menu_globals } from "../utils/menu_globals.ts";
import PolymarketData from "../../open_eth/prediction_markets/index.ts";
import { project, map, pipe, set, filter, toLower, lensProp, over, lensPath, view, defaultTo } from "ramda";

const predictionMarketsViewHandler = (st: TerminalUserStateConfig) => async (tag?: string): Promise<CommandState> => {
    
    if (!tag) {
        console.log("No tag provided");
        return {
            result: { type: CommandResultType.Success },
            state: st,
        };
    }
    
    const markets = await PolymarketData.markets.get(tag);
    
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

const polymarketMarketsTagsFetchHandler = (st: TerminalUserStateConfig) => async (search?: string) => {
    
    if (st.logLevel) {
        console.log("Fetching tags");
    }
    const tags = await PolymarketData.tags.get();
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
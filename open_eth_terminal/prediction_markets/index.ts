import { Menu, MenuOption } from "../types.ts";
import { registerTerminalApplication } from "../utils/program_loader.ts";
import { menu_globals } from "../utils/menu_globals.ts";
import {
    polymarketMarketsTopFetchHandler,
    polymarketMarketsTagsFetchHandler,
    polymarketMarketsTagsSearchHandler,
    predictionMarketsViewHandler,
 } from './actions/polymarket.ts';

/**
 *  Prediction Markets Menu Options.
 */
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

/**
 *  Prediction Markets Menu Definitions.
 */
const predictionMarketsMenu: Menu = {
    name: "Prediction Markets Menu",
    description: "Prediction Markets Menu",
    messagePrompt: "Select an option:",
    options: predictionMarketsMenuOptions,
}


export const predictionMarketsTerminal = registerTerminalApplication(predictionMarketsMenu);
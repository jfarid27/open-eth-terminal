import { Menu, MenuOption, TerminalUserStateConfig } from "../types.ts";
import { registerTerminalApplication } from "../utils/program_loader.ts";
import { menuGlobals } from "../utils/menu_globals.ts";
import {
    polymarketMarketsTopFetchHandler,
    polymarketMarketsTagsFetchHandler,
    polymarketMarketsTagsSearchHandler,
    predictionMarketsViewHandler,
    predictionMarketViewHandler,
    predictionEventViewHandler,
 } from './actions/polymarket.ts';

/**
 *  Prediction Markets Menu Options.
 */
const predictionMarketsMenuOptions = (state: TerminalUserStateConfig): MenuOption[] => [
    {
        name: "top",
        command: "top [limit] [term]",
        description: `Fetch the top polymarket markets.
        If a limit is not provided, the top 10 markets by volume are returned.
        If a term is provided, filters the top markets for that term.`,
        action: polymarketMarketsTopFetchHandler,
    },
    {
        name: "event",
        command: "event [slug]",
        description: "Fetch a specific event by slug.",
        action: predictionEventViewHandler,
    },
    {
        name: "market",
        command: "market [slug]",
        description: "Fetch a specific market by slug.",
        action: predictionMarketViewHandler,
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

    ...menuGlobals(state),
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

export default predictionMarketsTerminal;

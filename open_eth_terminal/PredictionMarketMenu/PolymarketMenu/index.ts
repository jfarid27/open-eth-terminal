import { Menu, MenuOption, TerminalUserStateConfig } from "./../../types.ts";
import { registerTerminalApplication } from "./../../utils/program_loader.ts";
import { menuGlobals } from "./../../utils/menu_globals.ts";
import {
    polymarketMarketsTopFetchHandler,
    polymarketMarketsTagsFetchHandler,
    polymarketMarketsTagsSearchHandler,
    predictionMarketsViewHandler,
    predictionMarketViewHandler,
    predictionEventViewHandler,
    portfolioAnalysisHandler,
 } from './actions/polymarket.ts';

/**
 *  Prediction Markets Menu Options.
 */
const polymarketMenuOptions = (state: TerminalUserStateConfig): MenuOption[] => [
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
        name: "portfolio analysis",
        command: "portfolio [type] [filename].csv",
        description: `Give spot or chart analysis of a portfolio of polymarket positions.
        
        type: spot | chart
        filename: filename of CSV portfolio file inside the top level './portfolios' directory
        
        See the readme in the './portfolios' directory for more information.
        `,
        action: portfolioAnalysisHandler,
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
const polymarketMenu: Menu = {
    name: "Polymarket Menu",
    description: "Polymarket Menu",
    messagePrompt: "Select an option:",
    options: polymarketMenuOptions,
}


export const polymarketTerminal = registerTerminalApplication(polymarketMenu);

export default polymarketTerminal;

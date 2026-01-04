import { registerTerminalApplication } from "../utils/program_loader.ts";
import { Menu, MenuOption, } from "../types.ts";
import { menu_globals } from "../utils/menu_globals.ts";
import { chartPriceHandler } from "./actions/alphavantage.ts";

const stocksMenuOptions: MenuOption[] = [
    {
        name: "chart",
        command: "chart [symbol]",
        description: "Fetch chart data for the given symbol",
        action: chartPriceHandler,
    },
    ...menu_globals,
]

const stocksMenu: Menu = {
    name: "Stocks Menu",
    description: "Stocks Menu",
    messagePrompt: "Select an option:",
    options: stocksMenuOptions,
}

export const stocksTerminal = registerTerminalApplication(stocksMenu);

export default stocksTerminal;

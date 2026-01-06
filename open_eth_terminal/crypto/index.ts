import { registerTerminalApplication } from "../utils/program_loader.ts";
import { Menu, MenuOption, } from "../types.ts";
import { menu_globals } from "../utils/menu_globals.ts";
import { spotPriceHandler, chartPriceHandler } from "./actions/spot.ts";

const cryptoMenuOptions: MenuOption[] = [
    {
        name: "price",
        command: "price [symbol]",
        description: "Fetch current price for the given symbol",
        action: spotPriceHandler,
    },
    {
        name: "chart",
        command: "chart [symbol]",
        description: "Fetch chart data for the given symbol",
        action: chartPriceHandler,
    },
    ...menu_globals,
]

const cryptoMenu: Menu = {
    name: "Crypto Menu",
    description: "Crypto Menu",
    messagePrompt: "Select an option:",
    options: cryptoMenuOptions,
}

export const cryptoTerminal = registerTerminalApplication(cryptoMenu);

export default cryptoTerminal;

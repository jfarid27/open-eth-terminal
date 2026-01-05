import { registerTerminalApplication } from "../utils/program_loader.ts";
import { Menu, MenuOption, } from "../types.ts";
import { menu_globals } from "../utils/menu_globals.ts";
import { spotPriceHandler } from "./actions/coingecko.ts";

const spotMenuOptions: MenuOption[] = [
    {
        name: "price",
        command: "price [symbol]",
        description: "Fetch current price for the given symbol",
        action: spotPriceHandler,
    },
    ...menu_globals,
]

const spotMenu: Menu = {
    name: "Spot Menu",
    description: "Spot Menu",
    messagePrompt: "Select an option:",
    options: spotMenuOptions,
}

export const spotTerminal = registerTerminalApplication(spotMenu);

export default spotTerminal;

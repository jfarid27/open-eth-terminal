import { Menu, MenuOption, TerminalUserStateConfig, CommandResultType } from "./../types.ts";
import { registerTerminalApplication } from "./../utils/program_loader.ts";
import { menuGlobals } from "./../utils/menu_globals.ts";
import polymarketTerminal from "./PolymarketMenu/index.ts";

/**
 *  Prediction Markets Menu Options.
 */
const predictionMarketsMenuOptions = (state: TerminalUserStateConfig): MenuOption[] => [
    {
        name: "polymarket",
        command: "polymarket",
        description: `Enter the polymarket menu`,
        action: (st: TerminalUserStateConfig) => async () => {
            const newState = await polymarketTerminal(st);
            return {
                result: { type: CommandResultType.Success },
                state: newState,
            };
        },
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

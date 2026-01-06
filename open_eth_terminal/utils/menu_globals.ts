import { ActionOptions, CommandResultType, TerminalUserStateConfig } from "../types.ts";

const back_menu = {
    name: "back",
    command: "back",
    description: "Go back to the main menu",
    action: (st: TerminalUserStateConfig) => async (ops?: ActionOptions) => {
        return {
            result: { type: CommandResultType.Back },
            state: st,
        };
    },
};

export const menu_top = [
    {
        name: "exit",
        command: "exit",
        description: "Exit the application",
        action: (st: TerminalUserStateConfig) => async (ops?: ActionOptions) => { 
            return {
                result: { type: CommandResultType.Exit },
                state: st,
            };
        },
    },
]

export const menu_globals = [...menu_top, back_menu];
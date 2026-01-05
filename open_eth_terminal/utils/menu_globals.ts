import { lensPath, set, view } from "ramda";
import { ActionOptions, CommandResultType, TerminalUserStateConfig } from "../types.ts";
import chalk from "chalk";

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
    {
        name: "keys",
        command: "keys [type] [value]",
        description: "Set or get the API keys",
        action: (st: TerminalUserStateConfig) => async (keyType: string, value?: string ) => { 
            
            if (!keyType) {
                const availableKeys = Object.keys(st.apiKeys);
                console.log(chalk.green(`Available API keys: ${availableKeys.join(", ")}`));
                return {
                    result: { type: CommandResultType.Success },
                    state: st,
                };
            }
            
            const keyLens = lensPath(['apiKeys', keyType]);
            if (keyType && !value) {
                const apiKey = view(keyLens, st);
                console.log(chalk.green(`API Key for ${keyType} is ${apiKey}`));
                return {
                    result: { type: CommandResultType.Success },
                    state: st,
                };
            }
            const newState = set(keyLens, value, st);
            console.log(chalk.green(`API Key for ${keyType} set to ${value}`));
            return {
                result: { type: CommandResultType.Success },
                state: newState,
            };
        },
    }
]

export const menu_globals = [...menu_top, back_menu];
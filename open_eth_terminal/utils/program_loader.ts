import { Command } from "commander";
import { MenuOption, CommandState, CommandResult } from "../types.ts";
import { TerminalUserStateConfig } from "../types.ts";

/**
 * Wrap a commander program into a resolvable promise from a menu option.
 * 
 * @param program The commander program to wrap.
 * @param menuOption The menu option to wrap.
 * @param state The terminal user state config.
 * @param ops The options for the program.
 * @returns A promise that resolves to the command state.
 */
export function loadProgram(program: Command, menuOption: MenuOption, state: TerminalUserStateConfig, ...ops: any) {
    return new Promise<CommandState>((resolve, reject) => {
        program
            .command(menuOption.command)
            .description(menuOption.description)
            .action((...args: any[]) => {
                menuOption.action(state)(...args)
                .then(resolve)
                .catch(reject);
            })
            
        if (ops.timeout || state?.actionTimeout) {
            setTimeout(() => {
                reject({
                    result: CommandResult.Timeout,
                    state: state,
                });
            }, ops?.timeout || state?.actionTimeout);
        }
    });
}
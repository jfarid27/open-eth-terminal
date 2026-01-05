import chalk from "chalk";
import terminalKit from "terminal-kit";
const { terminal } = terminalKit;
import { Command } from "commander";
import inquirer from "inquirer";
import { CommandState, CommandResultType, Menu, MenuOption, TerminalUserStateConfig } from "../types.ts";

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

                // Set the timeout only if the action callback is set
                if (ops?.timeout || state?.actionTimeout) {
                    setTimeout(() => {
                        console.log(chalk.red("Command timed out"));
                        reject({
                            result: { type: CommandResultType.Timeout },
                            state: state,
                        });
                    }, ops?.timeout || state?.actionTimeout);
                }
            })
            
    });
}

/*
 * Register a terminal application from a menu. Note the function is curried to allow
 * the terminal application runner to pass the menu registry and user state in separate calls.
 * 
 * @param menu The menu to register.
 * @returns A function that takes a terminal user state config and returns a promise that resolves to the terminal user state config.
 */
export const registerTerminalApplication = (menu: Menu) => {
    
    async function terminalApplication(st: TerminalUserStateConfig): Promise<TerminalUserStateConfig> {
        // Only show menu if not in script mode
        if (!st.scriptContext?.currentCommand) {
            console.log(chalk.blue(menu.name));
            const tableDescriptions = menu.options.map((option) => [option.name, option.command, option.description]);

            terminal.table([
                ['Name', 'Command', 'Description'],
                ...tableDescriptions,
            ], {
                hasBorder: true,
                contentHasMarkup: true,
                borderChars: 'lightRounded',
                borderAttr: { color: 'cyan' },
                textAttr: { bgColor: 'default' },
                firstRowTextAttr: { bgColor: 'cyan' },
                width: 60,
                fit: true
            });
        }
        console.log(chalk.blue(menu.name));
        
        try {
            let input = "";
            let isScriptExecution = false;

            if (st.scriptContext?.currentCommand) {
                input = st.scriptContext.currentCommand;
                console.log(chalk.yellow(`Executing script command: ${input}`));
                isScriptExecution = true;
            } else {
                const { command } = await inquirer.prompt([
                {
                    type: "input",
                    name: "command",
                    message: menu.name + " >",
                },
                ]);
                input = command?.trim();
            }

            if (!input) return terminalApplication(st);

            const program = new Command();
            program.exitOverride();
            program.configureOutput({
              writeErr: (str) => process.stdout.write(chalk.red(str)),
            });

            const resultPs = menu.options.map((option) => {
                // If we are executing a script, advance the command pointer
                if (isScriptExecution) {
                    const [nextCommand, ...rest] = st.scriptContext.tailCommands || [];
                    const nextScriptState = {
                        ...st,
                        scriptContext: {
                            ...st.scriptContext,
                            currentCommand: nextCommand,
                            tailCommands: rest
                        }
                    };
                    return loadProgram(program, option, nextScriptState);
                }
                return loadProgram(program, option, st);
            });

            const args = input.split(/\s+/);
            await program.parseAsync(args, { from: "user" });
            const result = await Promise.race(resultPs);

            if (result && result.result.type === CommandResultType.Back) {
                return result.state;
            }
            
            if (result && result.result.type === CommandResultType.Exit) {
                process.exit(0);
            }

            let nextState = result.state;
            
            
            return terminalApplication(nextState);

        } catch (err: any) {
            if (err.result?.type === CommandResultType.Timeout) {
                console.log(chalk.red("Command timed out"));
            }
            
            if (err.result?.type === CommandResultType.Error) {
                console.log(chalk.red("Command failed"));
            }
            
            // If in script execution, maybe we should stop or continue?
            // Usually scripts stop on error, but the prompt didn't specify.
            // We'll log and continue (which recurses).
            // But if we recurse with 'st', we might infinite loop on the same failing command if we don't advance!
            
            if (st.logLevel) {
                console.log(err);
            }
            console.log(chalk.red("Not a valid command"));
            
            // Fix for script loop on error:
            // If error occurred during script execution, we must advance or abort.
            // Let's abort script to prevent infinite error loops.
            if (st.scriptContext?.currentCommand) {
                console.log(chalk.red("Script execution aborted due to error."));
                const abortState = {
                    ...st,
                    scriptContext: {} // Clear script context
                };
                return terminalApplication(abortState);
            }

            return terminalApplication(st);
        }
        
    }
    
    return terminalApplication;
}
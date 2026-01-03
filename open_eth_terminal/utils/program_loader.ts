import chalk from "chalk";
import terminalKit from "terminal-kit";
const { terminal } = terminalKit;
import { Command } from "commander";
import inquirer from "inquirer";
import { CommandState, CommandResult, Menu, MenuOption, TerminalUserStateConfig } from "../types.ts";

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
                if (ops.timeout || state?.actionTimeout) {
                    setTimeout(() => {
                        console.log(chalk.red("Command timed out"));
                        reject({
                            result: CommandResult.Timeout,
                            state: state,
                        });
                    }, ops?.timeout || state?.actionTimeout);
                }
            })
            
    });
}

/*
 * Run a terminal application from a menu.
 * 
 * @param st The terminal user state config.
 * @param menu The menu to run.
 * @returns A promise that resolves to the terminal user state config.
 */
export const registerTerminalApplication = (menu: Menu) => {
    
    async function terminalApplication(st: TerminalUserStateConfig): Promise<TerminalUserStateConfig> {
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
        
        try {
            const { command } = await inquirer.prompt([
              {
                type: "input",
                name: "command",
                message: menu.name + " >",
              },
            ]);

            const input = command.trim();
            if (!input) return terminalApplication(st);

            const program = new Command();
            program.exitOverride();
            program.configureOutput({
              writeErr: (str) => process.stdout.write(chalk.red(str)),
            });

            const resultPs = menu.options.map((option) => {
                return loadProgram(program, option, st);
            });

            const args = input.split(/\s+/);
            await program.parseAsync(args, { from: "user" });
            const result = await Promise.race(resultPs);
            if (result && result.result === CommandResult.Back) {
                return result.state;
            }
            
            if (result && result.result === CommandResult.Exit) {
                process.exit(0);
            }

        } catch (err: any) {
            if (err.result === CommandResult.Timeout) {
                console.log(chalk.red("Command timed out"));
            }
            
            if (err.result === CommandResult.Error) {
                console.log(chalk.red("Command failed"));
            }
            
            if (st.debugMode) {
                console.log(err);
            }
            console.log(chalk.red("Not a valid command"));
            return terminalApplication(st);
        }
        
        return terminalApplication(st);

    }
    
    return terminalApplication;
}
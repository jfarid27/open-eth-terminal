import terminalKit from "terminal-kit";
const { terminal } = terminalKit;
import { Menu, MenuOption, TerminalUserStateConfig } from "../types.ts";
import { ActionOptions, CommandResult } from "../types.ts";
import chalk from "chalk";
import { loadProgram } from "../utils/program_loader.ts";
import inquirer from "inquirer";
import { Command } from "commander";

const predictionMarketsMenuOptions: MenuOption[] = [
    {
        name: "back",
        command: "back",
        description: "Go back to the main menu",
        action: (st: TerminalUserStateConfig) => async (ops?: ActionOptions) => {
            return {
                result: CommandResult.Back,
                state: st,
            };
        },
    },
    {
        name: "exit",
        command: "exit",
        description: "Exit the application",
        action: (st: TerminalUserStateConfig) => async (ops?: ActionOptions) => { 
            return {
                result: CommandResult.Exit,
                state: st,
            };
        },
    },
]

const predictionMarketsMenu: Menu = {
    name: "Prediction Markets Menu",
    description: "Prediction Markets Menu",
    messagePrompt: "Select an option:",
    options: predictionMarketsMenuOptions,
}


export async function predictionMarketsTerminal(st: TerminalUserStateConfig): Promise<TerminalUserStateConfig> {
    console.log(chalk.blue("Entered Prediction Markets Application"));
    const tableDescriptions = predictionMarketsMenu.options.map((option) => [option.name, option.description]);

    terminal.table([
        ['Command', 'Description'],
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
    
    const { command } = await inquirer.prompt([
      {
        type: "input",
        name: "command",
        message: "Prediction Markets >",
      },
    ]);

    const input = command.trim();
    if (!input) return predictionMarketsTerminal(st);

    const program = new Command();
    program.exitOverride();
    program.configureOutput({
      writeErr: (str) => process.stdout.write(chalk.red(str)),
    });
      

    const resultPs = predictionMarketsMenu.options.map((option) => {
        return loadProgram(program, option, st);
    });
    
    
    try {
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
    }

    return predictionMarketsTerminal(st);

}
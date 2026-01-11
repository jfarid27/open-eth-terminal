import chalk from "chalk";
import {
    TerminalUserStateConfig,
    CommandState, CommandResultType, LogLevel
} from "./../../../../../../open_eth_terminal/types.ts";
import { inspectLogger } from "./../../../../../../open_eth_terminal/utils/logging.ts";
import model from "./../model/index.ts";

/**
 * Mock handler for the mock action. 
 * @param st 
 * @returns 
 */
export const mockHandler = (st: TerminalUserStateConfig) => async (
    param1: string,
): Promise<CommandState> => {
    const applicationLogging = inspectLogger(st);

    if (!param1) {
        console.log(chalk.red("No param1 provided"));
        return {
            result: { type: CommandResultType.Error },
            state: st,
        };
    }
        
    applicationLogging(LogLevel.Debug)("Mock Param: " + param1);
    
    const result = await model.api.get(param1);
    
    console.log(chalk.green("Mock Result: "));
    console.log(chalk.blue(result));
    
    return {
        result: { type: CommandResultType.Success },
        state: st,
    };
}



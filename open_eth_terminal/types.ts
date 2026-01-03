
/**
 * The environment types.
 */
export enum EnvironmentType {
    Debug = "debug",
    Development = "development",
    Production = "production",
}
    
/**
 * Configuration for the API keys.
 */
export interface APIKeyConfig {
    coingecko?: string;
}

export interface TokenContext {
    symbol: string;
}

export interface LoadedContext {
    token?: TokenContext;
}

/**
 * Configuration for the terminal user state.
 */
export interface TerminalUserStateConfig {
    environment: EnvironmentType;
    debugMode: boolean;
    apiKeys: APIKeyConfig;
    loadedContext: LoadedContext;
    actionTimeout?: number;
}

export type ActionOptions = any;

/**
 * Abstract menu option for terminal state.
 */
export interface MenuOption {
    name: string;
    command: string;
    description: string;
    action: (st: TerminalUserStateConfig) => (...args: any[]) => Promise<CommandState>;
}

/**
 * Abstract menu for terminal state.
 */
export interface Menu {
    name: string;
    description: string;
    messagePrompt: string;
    options: MenuOption[];
}

export enum CommandResult {
    Success = "success",
    Error = "error",
    Back = "back",
    Exit = "exit",
    Timeout = "timeout",
}
    
export interface CommandState {
    result: CommandResult;
    state: TerminalUserStateConfig;
}


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

export enum PredictionMarketsType {
    Polymarket = "polymarket",
}

/**
 * Cached data for polymarket markets.
 */
export interface PolymarketMarketsData {
   tags?: { [key: string]: string } 
}

export interface PredictionMarketsContext {
    type: PredictionMarketsType,
    data: PolymarketMarketsData,
}

export interface LoadedContext {
    token?: TokenContext;
    predictionMarkets?: PredictionMarketsContext;
}

/**
 * Configuration for the terminal user state.
 */
export interface TerminalUserStateConfig {
    environment: EnvironmentType;
    logLevel: string | undefined;
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

export enum CommandResultType {
    Success = "success",
    Error = "error",
    Back = "back",
    Exit = "exit",
    Timeout = "timeout",
}
    
/**
 * Command result data, that allows passing string and the command's result information.
 */
export interface CommandResult {
    type: CommandResultType;
    message?: string;
}
    
/*
 * Returned command state that signals results of a command, and
 * the updated state.
 */
export interface CommandState {
    result: CommandResult;
    state: TerminalUserStateConfig;
}

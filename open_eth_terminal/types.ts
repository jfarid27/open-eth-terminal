
/**
 * The environment types.
 */
export enum EnvironmentType {
    Debug = "debug",
    Development = "development",
    Production = "production",
}

/**
 * List of available API key types.
 */
export enum APIKeyType {
    CoinGecko = "coingecko",
    Alphavantage = "alphavantage",
    BlockchainCom = "blockchaincom",
}

/**
 * List of available data sources.
 */
export enum DataSourceType {
    CoinGecko = 'coingecko',
    AlphaVantage = 'alphavantage',
    BlockchainCom = 'blockchaincom',
}
   
/**
 * Mapping of data source types to API key types.
 */
export interface DatasourceKeyMapping {
    [DataSourceType.CoinGecko]: APIKeyType.CoinGecko;
    [DataSourceType.AlphaVantage]: APIKeyType.Alphavantage;
    [DataSourceType.BlockchainCom]: APIKeyType.BlockchainCom;
}
    
/**
 * Configuration for the API keys.
 */
export type APIKeyConfig = {
    [key in APIKeyType]: string | undefined;
}

export interface CryptoContext {
    symbol?: string;
    datasource?: DataSourceType;
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
    crypto?: CryptoContext;
    predictionMarkets?: PredictionMarketsContext;
}

export interface ScriptContext {
    filename?: string;
    currentCommand?: string;
    tailCommands?: string[];
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
    scriptContext: ScriptContext;
}

export type ActionOptions = any;

export type ActionHandler = (st: TerminalUserStateConfig) => (...args: any[]) => Promise<CommandState>;

/**
 * Abstract menu option for terminal state.
 */
export interface MenuOption {
    name: string;
    command: string;
    description: string;
    action: ActionHandler;
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

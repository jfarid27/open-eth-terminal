
/**
 * The environment types.
 */
export enum EnvironmentType {
    Debug = "debug",
    Development = "development",
    Production = "production",
}

export enum APIKeyTypes {
    CoinGecko = "coingecko",
    Alphavantage = "alphavantage",
    Fred = "fred",
}
    
/**
 * Configuration for the API keys.
 */
export interface APIKeyConfig {
    [APIKeyTypes.CoinGecko]?: string;
    [APIKeyTypes.Alphavantage]?: string;
    [APIKeyTypes.Fred]?: string;
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

export enum ExchangeSymbolType {
    CoinGecko = 'coingecko',
    AlphaVantage = 'alphavantage',
}

export interface ExchangeSymbol {
    name: string;
    id: string;
    _type: ExchangeSymbolType;
}

/**
 * Generates an exchange symbol from the specified name, ID, and type. Useful for creating new exchange symbols.
 *
 * @param name Name of the symbol.
 * @param id ID of the symbol.
 * @param type Type of the symbol.
 */
export function generateExchangeSymbol(name: string, id: string, type: ExchangeSymbolType): ExchangeSymbol {
    switch (type) {
        case ExchangeSymbolType.CoinGecko:
            return {
                name,
                id,
                _type: ExchangeSymbolType.CoinGecko,
            };
        case ExchangeSymbolType.AlphaVantage:
            return {
                name,
                id,
                _type: ExchangeSymbolType.AlphaVantage,
            }
    }
}

/**
 * Available default exchange symbols from CoinGecko.
 */
const CoinGeckoSymbols: ExchangeSymbol[] = [
    generateExchangeSymbol("Bitcoin", "bitcoin", ExchangeSymbolType.CoinGecko),
    generateExchangeSymbol("Ethereum", "ethereum", ExchangeSymbolType.CoinGecko),
]

/**
 * Union of all available exchange symbols.
 */
export const ExchangeSymbols: ExchangeSymbol[] = [...CoinGeckoSymbols];
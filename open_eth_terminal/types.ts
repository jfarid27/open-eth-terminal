
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
}

export type ActionOptions = any;

/**
 * Abstract menu option for terminal state.
 */
export interface MenuOption {
    name: string;
    command: string;
    description: string;
    action: (st: TerminalUserStateConfig, ops?: ActionOptions) => Promise<TerminalUserStateConfig | void>;
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
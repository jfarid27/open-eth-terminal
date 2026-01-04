export enum ExchangeSymbolType {
    CoinGecko = 'coingecko',
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
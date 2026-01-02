export enum ExchangeSymbolType {
    CoinGecko = 'coingecko',
}

export interface ExchangeSymbol {
    name: string;
    id: string;
    _type: ExchangeSymbolType;
}
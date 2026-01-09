# Test Fixtures

This directory contains mock API response data for E2E tests.

## Files

- `coingecko_prices.json` - Mock cryptocurrency price data
- `polymarket_markets.json` - Mock prediction market data
- `alphavantage_quote.json` - Mock stock quote data

## Usage

These fixtures are used when `MOCK_API=true` environment variable is set.
The application should check for this variable and use fixture data instead
of making real API calls during testing.

## Adding New Fixtures

When adding new API integrations, create corresponding fixture files here
with representative mock data for testing.

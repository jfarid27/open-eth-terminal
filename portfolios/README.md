# /portfolios

This directory contains portfolio files.

## Polymarket

The general structure of a polymarket portfolio file is as follows:

```csv
<market-slug>,<outcome-option>,<amount>
```

### Formatting

Please remove headers lines from the file and use raw data.

### Data

Please remove all formatting from the file and use raw data. This means no
quotation marks, no newlines, no spaces, etc.

#### <market-slug>

The market slug is the slug of the market on polymarket.

#### <outcome-option>

The outcome option is the option of the market on polymarket.

This should be signalled with matching options on the market, but usually will be
"Yes" or "No" quotation exclusive.

#### <amount>

The amount is the amount of the market on polymarket.
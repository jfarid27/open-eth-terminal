# Open Eth Terminal Command Map

This document provides a visual tree of every terminal command and its associated submenu within the Open Eth Terminal application.

## Command Tree

- **`crypto`**: Fetch crypto prices from various sources
    - **`price [symbol]`**: Fetch current price for the given symbol
    - **`chart [symbol]`**: Fetch chart for the given symbol
    - **`set <settingtype> [value]`**: Set or get loading options (e.g., `datasource`, `symbol`)
    - *Global Options*: `exit`, `back`, `showconfig` (dev only)

- **`stocks`**: Fetch stock prices from various sources
    - **`chart [symbol]`**: Fetch chart data for the given symbol
    - **`spot [symbol]`**: Fetch spot prices for the given symbol
    - *Global Options*: `exit`, `back`, `showconfig` (dev only)

- **`news`**: Fetch news from various sources
    - **`reddit`**: Navigate to the reddit menu
        - **`subreddit [subreddit] [limit]`**: Fetch top posts from the given subreddit
        - **`search [query] [limit]`**: Search for posts from the given query
        - *Global Options*: `exit`, `back`, `showconfig` (dev only)
    - *Global Options*: `exit`, `back`, `showconfig` (dev only)

- **`predictions`**: Fetch prediction markets prices from various sources
    - **`polymarket`**: Enter the polymarket menu
        - **`top [limit] [term]`**: Fetch the top polymarket markets.
        - **`event [slug]`**: Fetch a specific event by slug.
        - **`portfolio [type] [filename].csv`**: Give spot or chart analysis of a portfolio of polymarket positions.
        - **`market <slug> [type]`**: Fetch a specific market by slug.
        - **`markets [tag]`**: Fetch markets for the given tag (default: all).
        - **`search [symbol]`**: Fetch available event and market tags useful for filtering.
        - **`user [address]`**: Fetch user positions for the given address.
        - **`load`**: Fetch available event and market tags useful for filtering.
        - *Global Options*: `exit`, `back`, `showconfig` (dev only)
    - **`kalshi`**: Enter the kalshi menu
        - **`event [ticker]`**: Fetch markets for a specific event by ticker.
        - *Global Options*: `exit`, `back`, `showconfig` (dev only)
    - *Global Options*: `exit`, `back`, `showconfig` (dev only)

- **`government`**: Fetch government economic data from various sources
    - **`fred [seriesId] [startDate] [endDate]`**: Fetch and chart FRED economic data series.
    - *Global Options*: `exit`, `back`, `showconfig` (dev only)

- **`script [filename]`**: Run a script from the scripts folder with a specified filename

- **`keys [type] [value]`**: Set or get the API keys

- **`exit`**: Exit the application

- **`back`**: Go back to the previous menu

- **`showconfig`**: Show the current configuration (Development only)

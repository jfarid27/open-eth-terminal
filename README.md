# Open Eth Terminal

A CLI Interface to Ethereum Financial Markets.

## Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up your environment variables:
    *   Create a `.env` file in the root directory.
    *   Add your CoinGecko API key (and other configurations as needed):
        ```env
        COINGECKO_API_KEY=your_api_key_here
        ENVIRONMENT=development # or production
        DEBUG=false
        ```

## Usage

To start the application, run:

```bash
npx tsx index.ts
```

## Commands

### Main Menu
-   **spot**: Enter the Spot Market Application to fetch token prices.
-   **exit**: Exit the application.

### Spot Market Application
Once inside the Spot Market application, you can use the following commands:

-   **price <SYMBOL>**: Fetch the current price for a specific symbol (e.g., `price bitcoin`, `price ethereum`).
-   **back**: Return to the Main Menu.
-   **exit**: Exit the application completely.

## License

This project is licensed under the LGPL-3.0-or-later. See the [LICENSE.md](LICENSE.md) file for details.

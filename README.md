# Open Eth Terminal

A CLI Interface to Ethereum Financial Markets.

## Installation

It is highly recommended to use Deno for this application. Node.js is supported but may have issues with some dependencies, and is generally insecure if a malicious actor gains access to your system.

### Deno

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    deno install -A --unstable --name=deno index.ts
    ```

### Node.js

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
    
### Environment Variables
Set up your environment variables:
    *   Create a `.env` file in the root directory.
    *   Add your CoinGecko API key (and other configurations as needed):
        ```env
        COINGECKO_API_KEY=your_api_key_here
        ENVIRONMENT=development # or production
        DEBUG=false
        ```

## Usage

### Deno
```bash
deno run start 
```

### Node.js
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


## Development

### System Design

This application is in general a functionally typed state machine CLI. The general design is that the application registers,
a menu function that takes a [UserState] and definitions for the [Menu], and returns an updated or new [UserState]. Because of
this, the menu functions may recursively call back into themselves or a previous menu function to simulate a stack of menus.

Since the UserState is always available, parameter options may always be updated and the menu in general has access to it. When developing
new menus, ideally one should only need to register it with appropriate menu options, and actions which can paint to the terminal, and
return a new or updated user state. See the [types.ts](types.ts) file for more information, or look at a menu implementation for
a motivation for how menu configuration and actions are structured.

### Development and Info Logging

The application has a debug mode that can be enabled by setting the `DEBUG` environment variable to `true`. This will enable
info logging to the console. The debug mode is also available in the application itself, and can be toggled by the user.

See the UserStateConfig type for more information.


## License

This project is licensed under the LGPL-3.0-or-later. See the [LICENSE.md](LICENSE.md) file for details.

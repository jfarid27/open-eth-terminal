import { registerTerminalApplication } from "../utils/program_loader.ts";
import { Menu, MenuOption, TerminalUserStateConfig } from "../types.ts";
import { menuGlobals } from "../utils/menu_globals.ts";
import { redditTopHandler } from "./actions/reddit.ts";

const newsMenuOptions = (state: TerminalUserStateConfig): MenuOption[] => [
    {
        name: "reddit",
        command: "reddit [subreddit] [limit]",
        description: "Fetch top posts from the given subreddit",
        action: redditTopHandler,
    },
    ...menuGlobals(state),
]

const newsMenu: Menu = {
    name: "News Menu",
    description: "Source news from various sources",
    messagePrompt: "Select an option:",
    options: newsMenuOptions,
}

export const newsTerminal = registerTerminalApplication(newsMenu);

export default newsTerminal;

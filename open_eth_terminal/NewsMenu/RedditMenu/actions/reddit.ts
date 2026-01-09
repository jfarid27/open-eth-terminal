import { CommandResultType, CommandState, TerminalUserStateConfig, LogLevel } from "./../../../types.ts";
import news from "../model/index.ts";
import { inspectLogger } from "./../../../utils/logging.ts";
import chalk from "chalk";
import { project, pipe, map, filter } from "ramda";

const MAX_TITLE_LENGTH = 65;
const MAX_AUTHOR_LENGTH = 25;

/**
 * Pluck relevant data from feed and transform it into something nice to display. 
 * @param {any} feed Feed to generate data from 
 * @returns {any} Generated data 
 */
const generateRedditDataFromFeed = pipe(
  project(["pubDate", "title", "link", "author"]),
  filter((r: any) => r.author),
  map((r: any) => {
    return {
      date: new Date(r.pubDate).toLocaleString(),
      author: r.author.replace("/u/", "").slice(0, MAX_AUTHOR_LENGTH),
      title: r.title.slice(0, MAX_TITLE_LENGTH),
      link: r.link
    }
  })
);

/**
 * Return top posts from the given search term
 * @param {TerminalUserStateConfig} st Terminal user state 
 * @param {string} query Query term to fetch posts from 
 * @param {number} limit Number of posts to fetch 
 * @returns {CommandState} 
 */
export const redditSearchTopHandler = (st: TerminalUserStateConfig)=>
    async (query: string, limit: number): Promise<CommandState> => {
        const applicationLogging = inspectLogger(st);

        let _query = query;
        if (!_query) {
            console.log(chalk.red("No query term supplied."))
            return {
                result: { type: CommandResultType.Error },
                state: st,
            };
        }
        
        try {
            const feed = await news.reddit.search(query, limit || 20);
            applicationLogging(LogLevel.Info)("Feed fetched successfully.")
            applicationLogging(LogLevel.Debug)(feed)
            
            const redditData = generateRedditDataFromFeed(feed.items);
            
            
            for (const item of redditData) {
                console.log(chalk.green(item.title))
                console.log(chalk.blue(item.date) + " | " + chalk.green(item.author))
                console.log(chalk.red(item.link) + "\n")
            }
            
            return {
                result: { type: CommandResultType.Success },
                state: st,
            };

        } catch (error) {
            console.log(chalk.red("An error occured fetching the feed."))
            
            if (st.logLevel) {
                console.log(error)
            }
            return {
                result: { type: CommandResultType.Error },
                state: st,
            };
        }
}

/**
 * Return top posts from the given subreddit
 * @param {TerminalUserStateConfig} st Terminal user state 
 * @param {string} subreddit Subreddit to fetch posts from 
 * @param {number} limit Number of posts to fetch 
 * @returns {CommandState} 
 */
export const redditTopHandler = (st: TerminalUserStateConfig)=>
    async (subreddit: string, limit: number): Promise<CommandState> => {

        let _subreddit = subreddit;
        if (!_subreddit) {
            _subreddit = "ethereum"
        }
        
        try {
            const feed = await news.reddit.get(_subreddit, limit || 20);
            
            const redditData = generateRedditDataFromFeed(feed.items);
            
            console.log(chalk.blue.bold(`Best posts from r/${_subreddit} \n`))
            
            for (const item of redditData) {
                console.log(chalk.green(item.title))
                console.log(chalk.blue(item.date) + " | " + chalk.green(item.author))
                console.log(chalk.red(item.link) + "\n")
            }
            
            return {
                result: { type: CommandResultType.Success },
                state: st,
            };

        } catch (error) {
            console.log(chalk.red("An error occured fetching the feed."))
            
            if (st.logLevel) {
                console.log(error)
            }
            return {
                result: { type: CommandResultType.Error },
                state: st,
            };
        }
}
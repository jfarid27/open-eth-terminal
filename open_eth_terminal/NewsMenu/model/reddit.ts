import Parser from "rss-parser";

/**
 * Fetch best posts from the given subreddit
 * @param subreddit Subreddit to fetch posts from
 * @param limit Number of posts to fetch
 * @returns Feed object
 */
export async function getRedditBest(subreddit: string, limit: number=20) {
    const url = `https://www.reddit.com/r/${subreddit}/hot/.rss?limit=${limit}`;
    const parser = new Parser();
    const feed = await parser.parseURL(url);
    return feed;
}

/**
 * Fetch top posts from the given query
 * @param query Query to fetch posts from
 * @param limit Number of posts to fetch
 * @returns Feed object
 */
export async function getRedditSearchTop(query: string, limit: number=20) {
    const url = `https://www.reddit.com/search/.rss?q=${query}&type=posts&sort=top&t=week&limit=${limit}`;
        
    const parser = new Parser();
    const feed = await parser.parseURL(url);
    return feed;
}
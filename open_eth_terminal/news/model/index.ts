import { getRedditBest } from "./reddit.ts";

export const reddit = {
    get: getRedditBest,
}


/**
 * News model
 */
export const news = {
    reddit
}

export default news;
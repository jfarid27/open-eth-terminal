import dotenv from "dotenv";
dotenv.config();

export const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;
export const ENVIRONMENT = process.env.ENVIRONMENT || "production";
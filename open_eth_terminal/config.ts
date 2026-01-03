import dotenv from "dotenv";
dotenv.config({ quiet: true });

import { EnvironmentType } from "./types.ts";

export const ENVIRONMENT = process.env.ENVIRONMENT === "development" ? EnvironmentType.Development : EnvironmentType.Production;
export const DEBUG: boolean = process.env.DEBUG === "true" || false;
export const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;
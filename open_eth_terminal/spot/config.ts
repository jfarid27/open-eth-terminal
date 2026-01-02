import dotenv from "dotenv";
dotenv.config({ quiet: true });

export enum EnvironmentType {
    Development = "development",
    Production = "production",
}

export const ENVIRONMENT = process.env.ENVIRONMENT === "development" ? EnvironmentType.Development : EnvironmentType.Production;
export const DEBUG = process.env.DEBUG || false;
/**
 * @file Loaders
 * @description Loader functions for loading data from files.
 * @note Loader functions are functions that take a TerminalUserStateConfig and return a Promise<T>
 * @see {@link Loader}
 */

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import process from "node:process";
import { defaultTo, map, pipe, split, trim } from "ramda";

/**
 * Splits a file string by lines, then by commas and trims whitespace.
 * 
 * @param file_content 
 * @returns List of a list of strings 
 */
const processCSV = pipe(
    split("\n"),
    map(
        pipe(
            split(","),
            map(trim),
            defaultTo(""),
        )
    ),
    defaultTo([]),
);

/**
 * Reads a CSV file from the portfolios directory.
 * 
 * Assumes all values are separated by commas.
 * @param filename 
 * @returns List of a list of strings 
 */
export const loadCSVPortfolio = async (filename: string) => {
    const file_path= join(process.cwd(), "portfolios", filename);
    const file_content = await readFile(file_path, "utf-8");
    return processCSV(file_content); 
}
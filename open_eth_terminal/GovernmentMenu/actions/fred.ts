import chalk from "chalk";
import government from "./../model/index.ts";
import { DataSourceType } from "./../../types.ts";
import {
    TerminalUserStateConfig,
    CommandState, CommandResultType, LogLevel
} from "./../../types.ts";
import { inspectLogger } from "./../../utils/logging.ts";
import { showLineChart, showMultiLineChart, TimeSeriesData } from "./../../components/charting.ts";
import { pipe, prop, map, sortBy } from "ramda";

/**
 * Process the FRED series data by transforming observations into
 * an array of objects with date, value, timestamp
 * @param data raw object data from FRED API 
 * @returns object array with date, value, timestamp
 */
const processFredData = pipe(
    prop("observations"),
    map((obs: any) => {
        return {
            date: obs.date,
            value: parseFloat(obs.value),
            timestamp: new Date(obs.date).getTime()
        };
    }),
    sortBy(prop("timestamp"))
);

export const fredHandler = (st: TerminalUserStateConfig) => async (
    seriesId: string,
    startDate: string,
    endDate: string
): Promise<CommandState> => {
    const applicationLogging = inspectLogger(st);
    const FRED_API_KEY = st.apiKeys.fred;
    
    if (!FRED_API_KEY) {
        console.log(chalk.red("No FRED API key found. Use 'keys fred <api_key>' to set it."));
        return {
            result: { type: CommandResultType.Error },
            state: st,
        };
    }

    if (!seriesId) {
        console.log(chalk.red("No series ID provided"));
        return {
            result: { type: CommandResultType.Error },
            state: st,
        };
    }

    if (!startDate || !endDate) {
        console.log(chalk.red("Both start date and end date are required (format: YYYY-MM-DD)"));
        return {
            result: { type: CommandResultType.Error },
            state: st,
        };
    }

    try {
        const seriesObj = {
            seriesId: seriesId,
            _type: DataSourceType.Fred as DataSourceType.Fred,
        };

        const result = await government.fred.get(seriesObj, startDate, endDate, FRED_API_KEY);
        
        applicationLogging(LogLevel.Debug)(result);

        const processed = processFredData(result) as Record<string, string | number>[];
        
        // Filter out non-numeric values (FRED sometimes returns "." for missing data)
        const validData = processed.filter(d => !isNaN(d.value as number));
        
        if (validData.length === 0) {
            console.log(chalk.yellow("No valid data found for the specified series and date range"));
            return {
                result: { type: CommandResultType.Error },
                state: st,
            };
        }

        await showLineChart(validData, "timestamp", "value", `FRED Series: ${seriesId}`);

        return {
            result: { type: CommandResultType.Success },
            state: st,
        };
    } catch (error) {
        applicationLogging(LogLevel.Error)(error);
        console.log(chalk.red("Error fetching FRED data. Please check your series ID and date range."));
        return {
            result: { type: CommandResultType.Error },
            state: st,
        };
    }
}

/**
 * Process FRED data for multi-line charts with Unix timestamp conversion
 */
const processFredDataForMultiChart = pipe(
    prop("observations"),
    map((obs: any) => {
        return {
            date: obs.date,
            value: parseFloat(obs.value),
            timestamp: Math.floor(new Date(obs.date).getTime() / 1000) // Convert to Unix seconds
        };
    }),
    sortBy(prop("timestamp"))
);

/**
 * Handler for fetching and charting multiple FRED series on one chart
 */
export const fredv2Handler = (st: TerminalUserStateConfig) => async (
    seriesIdsStr: string,
    startDate: string,
    endDate: string
): Promise<CommandState> => {
    const applicationLogging = inspectLogger(st);
    const FRED_API_KEY = st.apiKeys.fred;
    
    if (!FRED_API_KEY) {
        console.log(chalk.red("No FRED API key found. Use 'keys fred <api_key>' to set it."));
        return {
            result: { type: CommandResultType.Error },
            state: st,
        };
    }

    if (!seriesIdsStr) {
        console.log(chalk.red("No series IDs provided. Use comma-separated series IDs (e.g., 'GDP,GNPCA')"));
        return {
            result: { type: CommandResultType.Error },
            state: st,
        };
    }

    if (!startDate || !endDate) {
        console.log(chalk.red("Both start date and end date are required (format: YYYY-MM-DD)"));
        return {
            result: { type: CommandResultType.Error },
            state: st,
        };
    }

    try {
        // Parse comma-separated series IDs
        const seriesIds = seriesIdsStr.split(',').map(id => id.trim()).filter(id => id.length > 0);
        
        if (seriesIds.length === 0) {
            console.log(chalk.red("No valid series IDs found"));
            return {
                result: { type: CommandResultType.Error },
                state: st,
            };
        }

        console.log(chalk.blue(`Fetching ${seriesIds.length} FRED series...`));

        // Define colors for different series
        const colors = ['dodgerblue', 'orange', 'green', 'red', 'purple', 'yellow', 'cyan', 'magenta'];
        
        // Fetch all series in parallel
        const seriesPromises = seriesIds.map(async (seriesId, index) => {
            const seriesObj = {
                seriesId: seriesId,
                _type: DataSourceType.Fred as DataSourceType.Fred,
            };

            try {
                const result = await government.fred.get(seriesObj, startDate, endDate, FRED_API_KEY);
                const processed = processFredDataForMultiChart(result) as Record<string, string | number>[];
                
                // Filter out non-numeric values (FRED sometimes returns "." for missing data)
                const validData = processed.filter(d => !isNaN(d.value as number));
                
                return {
                    label: seriesId,
                    data: validData,
                    options: {
                        color: colors[index % colors.length]
                    }
                } as TimeSeriesData;
            } catch (error) {
                applicationLogging(LogLevel.Warning)(`Failed to fetch series ${seriesId}: ${error}`);
                console.log(chalk.yellow(`Warning: Could not fetch series ${seriesId}`));
                return null;
            }
        });

        const seriesResults = await Promise.all(seriesPromises);
        
        // Filter out failed series
        const validSeries = seriesResults.filter(s => s !== null) as TimeSeriesData[];
        
        if (validSeries.length === 0) {
            console.log(chalk.yellow("No valid data found for any of the specified series"));
            return {
                result: { type: CommandResultType.Error },
                state: st,
            };
        }

        // Check if any series have data
        const hasData = validSeries.some(s => s.data.length > 0);
        if (!hasData) {
            console.log(chalk.yellow("No data points found for the specified series and date range"));
            return {
                result: { type: CommandResultType.Error },
                state: st,
            };
        }

        console.log(chalk.green(`Successfully fetched ${validSeries.length} series`));

        await showMultiLineChart(
            validSeries,
            "timestamp",
            "value",
            "Date",
            "Value",
            `FRED Series Comparison: ${validSeries.map(s => s.label).join(', ')}`
        );

        return {
            result: { type: CommandResultType.Success },
            state: st,
        };
    } catch (error) {
        applicationLogging(LogLevel.Error)(error);
        console.log(chalk.red("Error fetching FRED data. Please check your series IDs and date range."));
        return {
            result: { type: CommandResultType.Error },
            state: st,
        };
    }
}


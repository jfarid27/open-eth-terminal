import chalk from "chalk";
import government from "./../model/index.ts";
import { DataSourceType } from "./../../types.ts";
import {
    TerminalUserStateConfig,
    CommandState, CommandResultType, LogLevel
} from "./../../types.ts";
import { inspectLogger } from "./../../utils/logging.ts";
import { showLineChart } from "./../../components/charting.ts";
import { pipe, prop, map, sortBy } from "ramda";

/**
 * Processed FRED observation data point
 */
interface ProcessedFredObservation {
    date: string;
    value: number;
    timestamp: number;
}

/**
 * Raw FRED API response structure
 */
interface FredApiResponse {
    observations: Array<{ date: string; value: string }>;
}

/**
 * Process the FRED series data by transforming observations into
 * an array of objects with date, value, timestamp
 * @param data raw object data from FRED API 
 * @returns object array with date, value, timestamp
 */
export const processFredData = (data: FredApiResponse): ProcessedFredObservation[] => {
    return pipe(
        prop("observations"),
        map((obs: any) => {
            return {
                date: obs.date,
                value: parseFloat(obs.value),
                timestamp: new Date(obs.date).getTime()
            };
        }),
        sortBy(prop("timestamp"))
    )(data) as ProcessedFredObservation[];
};

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

        // Fetch series metadata to get the title
        let seriesTitle = seriesId; // Default to series ID if metadata fetch fails
        try {
            const metadata = await government.fred.getMetadata(seriesObj, FRED_API_KEY);
            seriesTitle = metadata?.seriess?.[0]?.title || seriesId;
            applicationLogging(LogLevel.Debug)(`Series title: ${seriesTitle}`);
        } catch (metadataError) {
            applicationLogging(LogLevel.Warning)(`Failed to fetch series metadata: ${metadataError}`);
            console.log(chalk.yellow(`Warning: Using series ID as title`));
        }

        // Fetch series observations data
        const result = await government.fred.get(seriesObj, startDate, endDate, FRED_API_KEY);
        
        applicationLogging(LogLevel.Debug)(result);

        const processed = processFredData(result);
        
        // Filter out non-numeric values (FRED returns "." for missing data and other invalid values)
        const validData = processed.filter(d => {
            const val = d.value;
            return typeof val === 'number' && !isNaN(val) && isFinite(val);
        });
        
        if (validData.length === 0) {
            console.log(chalk.yellow("No valid data found for the specified series and date range"));
            return {
                result: { type: CommandResultType.Error },
                state: st,
            };
        }

        await showLineChart(validData, "timestamp", "value", seriesTitle);

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



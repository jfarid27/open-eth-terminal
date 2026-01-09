import { FredSeriesType } from "../types.ts";
import axios from "axios";

/**
 * Fetches the series data for a specified series ID from the FRED API.
 * 
 * @param series The series to fetch the data for.
 * @param startDate The start date for the series data (YYYY-MM-DD).
 * @param endDate The end date for the series data (YYYY-MM-DD).
 * @param FRED_API_KEY The FRED API key.
 * @returns The series data for the specified series.
 * @see https://fred.stlouisfed.org/docs/api/fred/
 */
export async function fetchFredSeries(
    series: FredSeriesType, 
    startDate: string, 
    endDate: string, 
    FRED_API_KEY: string
) {
    const response = await axios.get("https://api.stlouisfed.org/fred/series/observations", {
        params: {
            series_id: series.seriesId,
            api_key: FRED_API_KEY,
            file_type: "json",
            observation_start: startDate,
            observation_end: endDate,
        }
    });

    return response.data;
}

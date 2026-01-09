import { FredSeriesType } from "../types.ts";
import { fetchFredSeries } from "./fred.ts";

const government = {
    fred: {
        get: (series: FredSeriesType, startDate: string, endDate: string, FRED_API_KEY: string) => {
            return fetchFredSeries(series, startDate, endDate, FRED_API_KEY);
        }
    }
}

export default government;

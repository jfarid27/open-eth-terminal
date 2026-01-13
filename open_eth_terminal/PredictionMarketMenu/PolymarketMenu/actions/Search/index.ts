import {
    ActionHandler, CommandResultType, CommandState, TerminalUserStateConfig,
    LogLevel
} from "./../../../../types.ts";
import terminalKit from "terminal-kit";
import PredictionMarketsData from "./../../model/index.ts";
const { terminal } = terminalKit;
import { inspectLogger } from "./../../../../utils/logging.ts";
import { showLineChart, showMultiLineChart, TimeSeriesData } from "./../../../../components/charting.ts";
import chalk from "chalk";
import { flatten, pipe, project, map, prop, filter, forEach, chain } from "ramda";
import { processOutcomeData } from "./../../utils.ts";
import { eventMockData } from "../../../KalshiMenu/actions/Event/constants.ts";

const processEventsFromResponse = pipe(
    (r: any) => r.events,
    filter((r: any) => r.active && !r.closed),
    map((r: any) => ({
        tableRow:[
            r.title,
            r.slug,
            r.active,
            r.liquidity,
            r.volume,
            r.competitive,
        ],
        markets: processMarketsFromResponse(r.markets),
    })),
);
    
const processMarketsFromResponse = pipe(
    filter((r: any) => r.active && !r.closed),
    map((r: any) => ({
        tableRow: [
            r.question,
            r.slug,
            r.active,
            r.liquidity,
            r.volume,
            r.competitive,
        ],
        outcomeData: processOutcomeData([r]),
    })),
);

export const polymarketMarketsSearchHandler: ActionHandler = (st: TerminalUserStateConfig) => async (query?: string): Promise<CommandState> => {
    const applicationLogging = inspectLogger(st);
    if (!query) {
        return {
            result: { type: CommandResultType.Success },
            state: st,
        };
    }
    try {
        console.log(`Fetching markets for query: ${query}`);
        const response = await PredictionMarketsData.polyMarketData.search.get(query);
        
        const eventData = processEventsFromResponse(response);
        
        applicationLogging(LogLevel.Debug)(eventData);

        applicationLogging(LogLevel.Info)(`Found ${eventData.length} events`);
        
        console.log(eventData);
        
        for (const event of eventData) {
            terminal.table([
                ['Event', 'Slug', 'Active', 'Liquidity', 'Volume', 'Competitive'],
                event.tableRow,
            ], {
                hasBorder: true,
                contentHasMarkup: true,
                borderChars: 'lightRounded',
                borderAttr: { color: 'green' },
                textAttr: { bgColor: 'default' },
                firstRowTextAttr: { bgColor: 'green' },
                width: 120,
                fit: true
            });

            for (const market of event.markets) {
                terminal.table([
                    ['Question', 'Slug', 'Active', 'Liquidity', 'Volume'],
                    market.tableRow,
                ], {
                    hasBorder: true,
                    contentHasMarkup: true,
                    borderChars: 'lightRounded',
                    borderAttr: { color: 'green' },
                    textAttr: { bgColor: 'default' },
                    firstRowTextAttr: { bgColor: 'green' },
                    width: 120,
                    fit: true
                });
                
                for (const [question, outcomePrices] of market.outcomeData) {
                    terminal.table([
                        [question, ""],
                        ['Outcome', 'Price'],
                        ...outcomePrices,
                    ], {
                        hasBorder: true,
                        contentHasMarkup: true,
                        borderChars: 'lightRounded',
                        borderAttr: { color: 'green' },
                        textAttr: { bgColor: 'default' },
                        firstRowTextAttr: { bgColor: 'blue' },
                        width: 120,
                        fit: true
                    });
                }
            }
        }
        
        return {
            result: { type: CommandResultType.Success },
            state: st,
        };
    } catch (error) {
        applicationLogging(LogLevel.Debug)(error);
        applicationLogging(LogLevel.Info)("Failed to fetch markets for query: " + query);
        console.log("A network error occurred. Please try again.")
        return {
            result: { type: CommandResultType.Error, message: "Failed to fetch markets" },
            state: st,
        };
    }
}
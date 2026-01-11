import { fetchMockData } from "./mockApi.ts";

const mock = {
    api: {
        get: (param1: string ) => {
            return fetchMockData(param1);
        },
    }
}

export default mock;

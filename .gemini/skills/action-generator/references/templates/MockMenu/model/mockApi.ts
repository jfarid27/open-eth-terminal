/**
 * Mock data fetcher. This is where API calls would go.
 */
export async function fetchMockData(
    param1: string, 
) {
    return Promise.resolve("Mock Data: " + param1);
}

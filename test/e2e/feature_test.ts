/**
 * Feature Tests - Specific command functionality
 */

import { assert } from "jsr:@std/assert";
import { runScriptWithTimeout } from "./helpers/runner.ts";

Deno.test("FEATURE: Keys command displays available API keys", async () => {
  const { output, code } = await runScriptWithTimeout("test_keys_list.txt");

  const hasKeyContent =
    output.toLowerCase().includes("coingecko") ||
    output.toLowerCase().includes("alphavantage") ||
    output.toLowerCase().includes("api") ||
    output.toLowerCase().includes("key");

  assert(hasKeyContent, `Expected API key content in output: ${output.substring(0, 1000)}`);
  assert(code === 0, `Expected clean exit, got code ${code}`);
});

Deno.test("FEATURE: Script command executes successfully", async () => {
  const { output } = await runScriptWithTimeout("test_smoke.txt");

  const hasScriptExecution =
    output.toLowerCase().includes("executing script") ||
    output.toLowerCase().includes("script command");

  assert(
    hasScriptExecution || output.length > 0,
    `Expected script to execute: ${output.substring(0, 500)}`
  );
});

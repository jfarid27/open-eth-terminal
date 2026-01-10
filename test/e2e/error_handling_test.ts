/**
 * Error Handling Tests - Invalid input handling
 */

import { assert } from "jsr:@std/assert";
import { runScriptWithTimeout } from "./helpers/runner.ts";

Deno.test("ERROR: Invalid command shows error message", async () => {
  const { output } = await runScriptWithTimeout("test_invalid_cmd.txt");

  const hasErrorMessage =
    output.toLowerCase().includes("not a valid command") ||
    output.toLowerCase().includes("error") ||
    output.toLowerCase().includes("invalid") ||
    output.toLowerCase().includes("unknown");

  assert(hasErrorMessage, `Expected error message for invalid command: ${output.substring(0, 1000)}`);
});

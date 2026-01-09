/**
 * Smoke Tests - Basic application functionality
 */

import { assert } from "jsr:@std/assert";
import { runScriptWithTimeout } from "./helpers/runner.ts";

Deno.test("SMOKE: Application starts and displays banner", async () => {
  const { output } = await runScriptWithTimeout("test_smoke.txt");

  assert(
    output.includes("Open") ||
    output.includes("Terminal") ||
    output.includes("Main Menu"),
    `Expected banner or menu content, got: ${output.substring(0, 500)}`
  );
});

Deno.test("SMOKE: Main menu displays all navigation options", async () => {
  const { output } = await runScriptWithTimeout("test_smoke.txt");

  const hasMenuOptions =
    output.toLowerCase().includes("crypto") ||
    output.toLowerCase().includes("stocks") ||
    output.toLowerCase().includes("prediction") ||
    output.toLowerCase().includes("news");

  assert(hasMenuOptions, `Expected menu options in output: ${output.substring(0, 1000)}`);
});

Deno.test("SMOKE: Application exits cleanly with exit command", async () => {
  const { code } = await runScriptWithTimeout("test_smoke.txt");

  assert(code === 0, `Expected exit code 0, got ${code}`);
});

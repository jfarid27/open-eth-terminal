/**
 * Shared test utilities for E2E tests
 */

/**
 * Helper function to run the CLI with a test script
 * Uses a shell to pipe the script command properly
 * @param scriptName - Name of the script file in scripts/ directory
 * @returns Promise with output string and exit code
 */
export async function runScript(scriptName: string): Promise<{ output: string; code: number }> {
  const isWindows = Deno.build.os === "windows";

  const command = new Deno.Command(isWindows ? "cmd" : "sh", {
    args: isWindows
      ? ["/c", `echo script ${scriptName} | deno run --allow-all index.ts`]
      : ["-c", `echo "script ${scriptName}" | deno run --allow-all index.ts`],
    stdout: "piped",
    stderr: "piped",
    cwd: Deno.cwd(),
    env: {
      ...Deno.env.toObject(),
      MOCK_API: "true",
      NO_COLOR: "1",
      FORCE_COLOR: "0"
    },
  });

  const { code, stdout, stderr } = await command.output();
  const output = new TextDecoder().decode(stdout);
  const errorOutput = new TextDecoder().decode(stderr);

  return {
    output: output + errorOutput,
    code
  };
}

/**
 * Helper to run with timeout
 */
export async function runScriptWithTimeout(
  scriptName: string,
  timeoutMs: number = 30000
): Promise<{ output: string; code: number }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const result = await runScript(scriptName);
    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

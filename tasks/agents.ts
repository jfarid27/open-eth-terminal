import { copy } from "https://deno.land/std@0.224.0/fs/copy.ts";
import { join } from "https://deno.land/std@0.224.0/path/mod.ts";
import { exists } from "https://deno.land/std@0.224.0/fs/exists.ts";

const cwd = Deno.cwd();
const skillsDir = join(cwd, "skills");
const claudeTarget = join(cwd, ".claude", "skills");
const geminiTarget = join(cwd, ".gemini", "skills");

async function copySkills(targetDir: string) {
    try {
        console.log(`Copying skills to ${targetDir}...`);
        await copy(skillsDir, targetDir, { overwrite: true });
        console.log(`Successfully copied skills to ${targetDir}`);
    } catch (error) {
        console.error(`Failed to copy to ${targetDir}:`, error);
        throw error;
    }
}

async function main() {
    if (!(await exists(skillsDir))) {
        console.error("Skills directory not found at:", skillsDir);
        Deno.exit(1);
    }

    try {
        // Ensure parent directories exist
        await Deno.mkdir(join(cwd, ".claude"), { recursive: true });
        await Deno.mkdir(join(cwd, ".gemini"), { recursive: true });

        await copySkills(claudeTarget);
        await copySkills(geminiTarget);
    } catch (error) {
        console.error("Error in agents-copy task:", error);
        Deno.exit(1);
    }
}

if (import.meta.main) {
    main();
}

import * as Plot from "@observablehq/plot";
import { JSDOM } from "jsdom";
import open from "open";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { map, lensProp, set } from "ramda";

const HTML_BLOCK = (title: string, html: string) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { 
            font-family: system-ui, -apple-system, sans-serif;
            display: flex; 
            justify-content: center; 
            align-items: center; 
            min-height: 100vh; 
            margin: 0; 
            background: #fdfdfd;
        }
        svg {
            max-width: 90vw;
            max-height: 90vh;
            height: auto;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            border-radius: 0.5rem;
            background: white;
            padding: 2rem;
        }
    </style>
</head>
<body>
    ${html}
</body>
</html>`;


}

export function lineChart(data: any[], x: string, y: string) {
    return Plot.line(data, {x, y});
}

export async function showChart(data: Record<string, any>[], x: string, y: string, title: string = "Chart") {
    // specific setup for jsdom to match what Plot expects
    const jsdom = new JSDOM("");
    const document = jsdom.window.document;
    
    // We render the plot using the passing document
    const plot = Plot.plot({
        document: document,
        title,
        grid: true,
        x: { label: x, transform: (value: string) => new Date(value).toISOString().split("T")[0] },
        y: { label: y, transform: (value) => Number(value) },
        marks: [
            lineChart(data, x, y)
        ]
    });
    
    const html = HTML_BLOCK(title, plot.outerHTML);

    // Save to local tmp folder
    const projectRoot = process.cwd(); 
    const tmpDir = join(projectRoot, "tmp");
    const filePath = join(tmpDir, `chart-${Date.now()}.html`);
    
    await writeFile(filePath, html);
    console.log(`Saved output to ${filePath}.`);
    await open(filePath);
}
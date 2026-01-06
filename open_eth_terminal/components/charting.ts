import * as Plot from "@observablehq/plot";
import { JSDOM } from "npm:jsdom";
import { map, lensProp, set } from "ramda";
import * as d3 from "npm:d3";
import open from "npm:open";

/**
 * A reusable function to display an Observable Plot or SVG string
 * in the system's default viewer.
 */
export async function show(content: Element | string) {
  let svgString = "";
  if (typeof content === "string") {
    svgString = content;
  } else {
    let element = content;

    // If the element is a wrapper (e.g. figure), extract the svg
    if (element.tagName.toLowerCase() !== "svg") {
        const nested = element.querySelector("svg");
        if (nested) element = nested;
    }

    if (!element.getAttribute("xmlns")) {
      element.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns", "http://www.w3.org/2000/svg");
    }
    if (!element.getAttribute("xmlns:xlink")) {
      element.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
    }
    svgString = element.outerHTML;
  }

  try {
      const tempFile = await Deno.makeTempFile({ dir: "./tmp", suffix: ".svg" });
      
      await Deno.writeTextFile(tempFile, svgString);
      console.log(`Saved chart to: ${tempFile}`);
      await open(tempFile, { wait: false });
  } catch (err) {
      console.error(err);
  }
}

export function lineChart(data: any[], x: string, y: string) {
    return Plot.line(data, {
        x: (d) => new Date(d[x]),
        y: (d) => Number(d[y]),
        stroke: "dodgerblue"
    });
}

export async function showChart(data: Record<string, any>[], x: string, y: string, title: string = "Chart") {
    // specific setup for jsdom to match what Plot expects
    const jsdom = new JSDOM("");
    const document = jsdom.window.document;
    
    // We render the plot using the passing document
    const plot = Plot.plot({
        document: document,
        title,
        style: {
            background: "black",
            color: "white",
        },
        grid: true,
        x: { label: x, ticks: 5 },
        y: { label: y },
        marks: [
            lineChart(data, x, y)
        ]
    });
    
    await show(plot);
}
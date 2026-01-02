import inquirer from "inquirer";
import chalk from "chalk";
import { spotTerminal } from "./spot/index.ts";

import terminalKit from "terminal-kit";
const { terminal } = terminalKit;
import figlet from "figlet";

export async function terminalMain() {
  console.log(chalk.green(figlet.textSync("Open Eth Terminal", { horizontalLayout: 'full' })));

  while (true) {
    terminal.table([
        ['Option', 'Description'],
        ['spot', 'Fetch spot prices from various sources'],
        ['exit', 'Exit the application']
    ], {
        hasBorder: true,
        contentHasMarkup: true,
        borderChars: 'lightRounded',
        borderAttr: { color: 'blue' },
        textAttr: { bgColor: 'default' },
        firstRowTextAttr: { bgColor: 'blue' },
        width: 60,
        fit: true
    });

    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "Select an option:",
        choices: ["spot", "exit"],
      },
    ]);

    if (action === "exit") {
      process.exit(0);
    } else if (action === "spot") {
      await spotTerminal();
    }
  }
}

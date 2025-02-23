import chalk from "chalk"
import { readFileSync, writeFileSync } from "fs"
import prompts from "prompts"
import { getZone } from './getZone.js'
import { createConfig } from "./createConfig.js"
import { join } from "path";
import { fileURLToPath } from "url";

// Get the directory of the current script
const __filename = fileURLToPath(import.meta.url);
console.log(__filename)
const __dirname = __filename.replace(/(.*?charlesV2)([\\/].*)?$/, "$1"); // Regex to extract CHARLESV2 path

// Validate if CHARLESV2 was found
if (!__dirname.includes("charlesV2")) {
    console.error(chalk.red("ERROR: Could not locate the CHARLESV2 folder."));
    process.exit(1);
}

const configPath = join(__dirname, "resources", "charlesConfig.json");

function checkConfig() {
    try {
        if (!existsSync(configPath)) {
            throw new Error("Config file not found.");
        }
        return JSON.parse(readFileSync(configPath));
    } catch (e) {
        console.log(chalk.red("Config file not found or invalid."));
        return null;
    }
}

export async function configCharles() {
    await createConfig()
    if (checkConfig) {
        return await JSON.parse(readFileSync(configPath))
    } else {
        console.clear()
        console.log(chalk.dim("You don't seem to have set up Charles yet, let's do that now!"))
        console.log(chalk.cyanBright("You're going to be asked for the Zone Chat ID of your groups, you can find them in the Messenger Website " + chalk.dim("(EX https://www.messenger.com/t/" + chalk.cyanBright("2276304299063254") + chalk.dim("<-- ID)"))))
        const zoneArray = await getZone()
        let questions = []
        for (let i = 0; i < zoneArray.length; i++) {
            questions.push({
                type: 'text',
                name: zoneArray[i],
                message: `What is the Zone Chat ID for ${zoneArray[i]}?`
            });
        }
        const charlesConfig = await prompts(questions)
        writeFileSync('resources/charlesConfig.json', JSON.stringify(charlesConfig))
        return charlesConfig
    }
}

// NOT WORKING RIGHT NOW, MAYBE CRY LATER

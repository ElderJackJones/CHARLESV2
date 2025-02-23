import chalk from "chalk";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import prompts from "prompts";
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

const configPath = join(__dirname, "resources", "config.json");

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

export async function createConfig() {
    let config = checkConfig();
    if (config) {
        return config;
    }
    const questions = [
        {
            type: "text",
            name: "username",
            message: "What is your churchofjesuschrist.org username?",
        },
        {
            type: "password",
            name: "password",
            message: "What is your password?",
        },
        {
            type: "text",
            name: "botname",
            message: "What email is your bot registered under?",
        },
        {
            type: "password",
            name: "botpassword",
            message: "What is the password for that Facebook account?",
        },
        {
            type: "toggle",
            name: "save",
            message: "Would you like to save this information for future logins (recommended)?",
            initial: true,
            active: "yes",
            inactive: "no",
        },
    ];
    console.log(chalk.dim("Setting up Charles"));
    const response = await prompts(questions);
    console.log(JSON.stringify(response))
    if (response.save) {
        console.log('writing to ' + configPath)
        writeFileSync(configPath, JSON.stringify(response, null, 2));
        return response;
    } else {
        return response;
    }
}

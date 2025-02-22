import chalk from "chalk";
import prompts from "prompts";
import { configCharles } from "./configCharles.js";
import { sneakyChurch } from "./connectToChurch/sneakyChurch.js";
import { prettyStringZones } from "./prettyStringZones.js"
import ora from "ora";
import { createPayload } from "./createPayload.js";
import { readFileSync } from "fs";

async function main() {
    console.log(chalk.dim("Welcome to Charles, booting up..."));
    const charlesConfig = await configCharles();
    const config = await JSON.parse(readFileSync('resources/config.json'))
    let isbusy = false;

    async function menu() {
        if (isbusy) return;

        const questions = {
            type: "multiselect",
            name: "program",
            message: "What should we do today?",
            choices: [
                { title: "Send Charles message", value: "charles" },
                { title: "Report uncontacted referrals", value: "report" },
                { title: "Yeet outta here", value: "exit" },
            ],
            hint: "Press space to select, enter to commit",
            instructions: false
        };

        let response = await prompts(questions);
        console.log(response)
        if (response.program.includes("charles")) {
            isbusy = true;
            const spinner = ora("Running Charles").start();
            setTimeout(() => {
                spinner.succeed("Charles Sent!");
                isbusy = false;
            }, 5000);
        }

        if (response.program.includes("report")) {
            isbusy = true;
            let payload = await createPayload(await sneakyChurch(config.username, config.password));
            const prettyPayload = prettyStringZones(payload)
            console.log(prettyPayload);
            isbusy = false;
        }

        if (response.program.includes("exit")) {
            process.exit();
        }
    }

    while (true) {
        await menu();
    }
}

main();

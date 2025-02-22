import chalk from "chalk";
import prompts from "prompts";
import { configCharles } from "./configCharles.js";
import { sneakyChurch } from "./connectToChurch/sneakyChurch.js";
import { prettyStringZones } from "./prettyStringZones.js";
import { createConfig } from "./createConfig.js";
import { createPayload } from "./createPayload.js";

async function main() {
    console.clear()
    console.log(chalk.dim('Welcome to Charles, booting up...'))
    const charlesConfig = await configCharles()
    const config = await createConfig()
    
    async function menu() {
        const questions = {
            type: 'multiselect',
            name: 'program',
            message: 'What should we do today?',
            choices: [
                { title: 'Send Charles message', value: 'charles'},
                { title: 'Report uncontacted referrals', value: 'report'},
                {title: 'Change settings', value: 'settings'},
                { title: 'Yeet outta here', value: 'exit'}
            ],
            max: 1,
            instructions: false
        }
        return await prompts(questions)
    }

    let select;
    do {
        select = await menu();
        console.log(select);

        if (select.program?.includes('charles')) {
            // run charles
            // You can call the function that handles charles here, or leave it empty to simulate charles behavior
            console.log("Running Charles...");
        } else if (select.program?.includes('report')) {
            // report
            // You can call the function that handles reporting here, or leave it empty to simulate reporting behavior
            const data = await createPayload(await sneakyChurch(config.username, config.password))
            const zoneByZone = prettyStringZones(data)
            console.log(zoneByZone)
            console.log("\n")
        } else if (select.program?.includes('exit')) {
            console.log("Exiting...");
            break;
        }
    } while (select.program?.includes('charles') || select.program?.includes('report'));
}

main();

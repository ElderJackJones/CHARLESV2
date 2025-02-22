import chalk from "chalk"
import { readFileSync, writeFileSync } from "fs"
import prompts from "prompts"
import { getZone } from './getZone.js'
import { createConfig } from "./createConfig.js"

export async function configCharles() {
    await createConfig()
    let charlesConfig = undefined
    try {
        charlesConfig = readFileSync('resources/charlesConfig.json')
    } catch (e) {
        console.log("\n\n")
        console.log(chalk.dim("You don't seem to have set up your Zones yet, let's do that now!"))
        console.log(chalk.greenBright("You can find the Zone Chat ID in the messenger webpage (EX: ") + chalk.dim("https://www.messenger.com/t/") + chalk.greenBright("2276304299063254)"))
    }
    if (charlesConfig) {
        return charlesConfig
    } else {
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

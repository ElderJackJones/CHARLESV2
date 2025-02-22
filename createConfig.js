import chalk from "chalk"
import { readFileSync, writeFileSync } from "fs"
import prompts from "prompts"

function checkConfig() {
    let config = undefined
    try {
        config = JSON.parse(readFileSync('resources/config.json'))
        return config
    } catch (e) {
        console.log(e)
        return null
    }
}


export async function createConfig() {
    let config = checkConfig()
    if (config) {
        return config
    }
    const questions = [
        {
            type: 'text', 
            name: 'username',
            message: 'What is your churchofjesuschrist.org username?'
        },
        {
            type: 'password',
            name: 'password',
            message: 'What is your password?'
        },
        {
            type: 'text', 
            name: 'botname',
            message: 'What email is your bot registered under?'
        },
        {
            type: 'password',
            name: 'botpassword',
            message: 'What is the password for that Facebook account?'
        },
        {
            type: 'toggle',
            name: 'save',
            message: 'Would you like to save this information for future logins (recommended)?',
            initial: true,
            active: 'yes',
            inactive: 'no'
        }
    ]
    console.log(chalk.dim('Setting up Charles'))
    const response = await prompts(questions)
    if (response.save) {
        writeFileSync('resources/config.json', JSON.stringify(response))
        return response
    } else {
        return response
    }
}
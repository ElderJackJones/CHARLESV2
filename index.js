import { sneakyChurch } from "./connectToChurch/sneakyChurch.js";
import inquirer from 'inquirer'

inquirer
    .prompt(
        [{
            type: 'input',
            name: 'user',
            message: "What's your churchofjesuschrist.org username? "
        },
        {
            type: 'password',
            name: 'pass',
            message: "What's your churchofjesuschrist.org password? ",
            mask: "#"
        }]
    )
    .then(async (answers) => {
        console.log(answers)
        await sneakyChurch(answers.user, answers.pass)
    })
import { randomMessage } from "./randomMessage.js"

export async function prettyString(name, wholeShebang) {
    let fancifulString = ''
    const kindMessage = await randomMessage()
    fancifulString.concat(kindMessage + "\n\n")
    fancifulString.concat(`${name}\n`) 

    for (const [ area, people ] in wholeShebang.entries()) {
        fancifulString.concat(area, people)
    }
}

// CREATING AVERAGE CONTACT TIME FUNCTION... NEED TO FINISH THAT FIRST
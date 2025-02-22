import { writeFileSync } from "fs";

export async function getBearer(page) {
    let bearer = undefined
        try {
            bearer = readFileSync('resources/bearer.json').toString()
        } catch (e) {}
        
        if (!bearer) {
            const missionaryObj = await page.evaluate(async () => {
                const obj = await fetch('https://referralmanager.churchofjesuschrist.org/services/auth')
                const jsonobj = await obj.json()
                return jsonobj;
            });
            writeFileSync('resources/bearer.json', missionaryObj.token)
            bearer = missionaryObj.token 
        }
    return bearer
}
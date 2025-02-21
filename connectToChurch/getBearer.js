import { writeFileSync } from "fs";

export async function getBearer(page) {
    let bearer = undefined
        try {
            bearer = readFileSync('bearer.json').toString()
        } catch (e) {
            console.log('creating bearer file')
        }
        
        if (!bearer) {
            const missionaryObj = await page.evaluate(async () => {
                const obj = await fetch('https://referralmanager.churchofjesuschrist.org/services/auth')
                const jsonobj = await obj.json()
                return jsonobj;
            });
            console.log(JSON.stringify(missionaryObj))
            console.log('saving bearer')
            writeFileSync('bearer.json', missionaryObj.token)
            bearer = missionaryObj.token 
        }
    return bearer
}
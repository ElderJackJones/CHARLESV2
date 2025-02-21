import puppeteer from "puppeteer"
import { cookieHandler, saveCookies } from "./cookieHandler.js"
import { readFileSync, writeFileSync } from "fs"
import { jwtDecode } from "jwt-decode"

async function login(user, pass, page) {
    // Enter username
    await page.goto('https://referralmanager.churchofjesuschrist.org/')
    await page.type("input[name='identifier']", user)
    await page.click("input[type='submit']")

    // Enter password
    await page.waitForSelector("input[name='credentials.passcode']", {timeout: 10000})
    await page.type("input[name='credentials.passcode']", pass)
    await page.click("input[type='submit']")
    await page.waitForNavigation()
    // get cookies and save
    const cookies = await page.cookies()
    await saveCookies(cookies)

}

export async function sneakyChurch(user, pass) {
    // Launch browser and use cookies from previous session if possible.
    const browser = await puppeteer.launch({ headless:true })
    const page = await browser.newPage()
    const okayToSkipLogin = await cookieHandler(page)
    if (okayToSkipLogin) {
        await page.goto('https://referralmanager.churchofjesuschrist.org/')
        const isLoggedOut = await page.$("input[name='identifier']")
        if (isLoggedOut) {
            console.log('Session expired, logging in again...')
            await login(user, pass, page)
        }
    } else {
        await login(user, pass, page)
    }

    // Snag the bearer token *enters hacker mode*
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
    const decodedBearer = jwtDecode(bearer)
    console.log(decodedBearer)

    const list = await page.evaluate(async (decodedBearer, bearer) => {
        const peopleList = await fetch(`https://referralmanager.churchofjesuschrist.org/services/people/mission/${JSON.stringify(decodedBearer.missionId)}?includeDroppedPersons=true`, {
            method: 'GET',
            headers: {
                'Authorization' : `Bearer ${bearer}`
            }
        })
        const list = await peopleList.text()
        return list
    }, decodedBearer, bearer)

    console.log(list)
}

sneakyChurch('JackJones05', 'R0ochsaucedinner')
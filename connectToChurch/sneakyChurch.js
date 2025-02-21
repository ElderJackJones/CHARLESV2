import puppeteer from "puppeteer"
import { cookieHandler, saveCookies } from "./cookieHandler.js"
import { writeFileSync } from "fs"

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
    const browser = await puppeteer.launch({ headless:false })
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
    const missionaryObj = await page.evaluate(async () => {
        const obj = await fetch('https://referralmanager.churchofjesuschrist.org/services/auth')
        const jsonobj = await obj.json()
        return jsonobj
    })
    console.log(missionaryObj)
    writeFileSync('bearer.json', missionaryObj.token)
}

   
sneakyChurch("JackJones05", "R0ochsaucedinner")
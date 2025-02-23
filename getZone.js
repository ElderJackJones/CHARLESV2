import puppeteer from "puppeteer";
import { cookieHandler, saveCookies } from "./connectToChurch/cookieHandler.js";
import { createConfig } from "./createConfig.js";
import { getBearer } from "./connectToChurch/getBearer.js";
import { jwtDecode } from "jwt-decode";
import ora from "ora";

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

async function getPeopleList(page, bearer, decodedBearer) {
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
    return list
}

export async function getZone() {
    const spinner = ora('Getting zone info').start()
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    const config = await createConfig('resources/config.json')
    const user = config.username
    const pass = config.password

    const okayToSkipLogin = await cookieHandler(page)
        if (okayToSkipLogin) {
            await page.goto('https://referralmanager.churchofjesuschrist.org/')
            const isLoggedOut = await page.$("input[name='identifier']")
            if (isLoggedOut) {
                spinner.color = 'red'
                spinner.text = 'Session expired, logging in again'
                await login(user, pass, page)
            }
        } else {
            await login(user, pass, page)
        }
    
        const bearer = await getBearer(page)
        const decodedBearer = jwtDecode(bearer)

        spinner.color = 'yellow'
        spinner.text = 'Making it look pretty'

        const stuff = await JSON.parse(await getPeopleList(page, bearer, decodedBearer))
        const list = stuff.persons
    
        let zoneList = [];
        for (let i = 0; i < list.length; i++) {
            if (list[i].zoneName) {
                const trimmedZoneName = list[i].zoneName.trim();
            if (!zoneList.includes(trimmedZoneName)) {
                zoneList.push(trimmedZoneName);
            }
            }
        }
        await browser.close()
        spinner.succeed(' Zone information updated!')
        return zoneList
}

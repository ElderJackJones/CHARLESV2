import puppeteer from "puppeteer"
import { cookieHandler, saveCookies } from "./cookieHandler.js"
import { readFileSync, write, writeFileSync } from "fs"
import { jwtDecode } from "jwt-decode"
import { superParse } from "./superParse.js"
import { getBearer } from "./getBearer.js"
import { listToday } from "./listToday.js"
import ora from "ora"

function isMoreThanADayOld(timestamp) {
    const oneDay = 24 * 60 * 60 * 1000
    const now = Date.now()
    return now - timestamp > oneDay
}

export async function login(user, pass, page) {
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

// False == should not pull
async function toPullOrNotToPullThatIsTheQuestion() {
    try {
        let thiccList = readFileSync('people.json')
        let thiccJSON = await JSON.parse(thiccList)
        if (!isMoreThanADayOld(thiccJSON.processedTime)) {
            return false
        }
        else {
            return true
        }
    } catch (e) {
        return true
    }
}

export async function getPeopleList(page, bearer, decodedBearer) {
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

export async function sneakyChurch(user, pass) {
    console.clear()
    let spool = ora('Opening browser').start()
    // Launch browser and use cookies from previous session if possible.
    const browser = await puppeteer.launch({ headless:true })
    const page = await browser.newPage()
    spool.color = 'magenta'
    spool.text = "Doin' some black magic"
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
    spool.color = 'green'
    spool.text = 'Stealing your identity'
    // Snag the bearer token *enters hacker mode*
    const bearer = await getBearer(page)
    const decodedBearer = jwtDecode(bearer)
    let lossyList
    let todaysList

    // Get new list if we don't have one cached
    if (toPullOrNotToPullThatIsTheQuestion()) {
        spool.color = 'cyan'
        spool.text = 'Fetching referrals'
        const fullList = await getPeopleList(page, bearer, decodedBearer)
        const fullListObj = JSON.parse(fullList)
        lossyList = await superParse(fullListObj)
        todaysList = await listToday(lossyList)
        writeFileSync('people.json', JSON.stringify(
            { 'processedTime' : Date.now(),
            'persons' : {...todaysList}
            }
        ))
    } else {
        lossyList = await JSON.parse(readFileSync('people.json'))
        todaysList = await listToday(lossyList)
    }
    spool.succeed('Referrals retrieved')
    await browser.close()
    return todaysList
}

import { readFileSync, writeFileSync } from 'fs'

    // will return 'true' if you should skip ahead,
    // will return 'false' if you need to login

export async function facebookCookieHandler(page) {
    let cookies = undefined
    try {
        cookies = JSON.parse(readFileSync('./cookies.json'))
        if (cookies.find(cookie => cookie.name === "xs")) {
            await page.setCookie(...cookies)
            return true
        } else {
            return false
        }
    } catch (e) {
        return false
    }
}

export async function saveCookies(cookie) {
    try {
        writeFileSync('cookies.json', JSON.stringify(cookie, null, 2))
    } catch (e) {
        console.error('writing cookies failed: ' + e)
    }
}

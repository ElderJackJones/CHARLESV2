import { readFileSync, writeFileSync } from 'fs'

    // will return 'true' if you should skip ahead,
    // will return 'false' if you need to login

export async function cookieHandler(page) {
    let cookies = undefined
    try {
        cookies = JSON.parse(readFileSync('resoures/cookies.json'))
        if (cookies) {
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
        writeFileSync('resources/cookies.json', JSON.stringify(cookie, null, 2))
    } catch (e) {
        console.error('writing cookies failed: ' + e)
    }
}

import ora from 'ora';
import puppeteer from 'puppeteer';
import { createConfig } from '../createConfig.js';
import { facebookCookieHandler, saveCookies } from './facebookCookieHandler.js';

// Function to launch the browser
const launchBrowser = async (config) => {
    return await puppeteer.launch({
        headless: config.headless,
        args: [
            "--disable-infobars",
            "--no-sandbox",
            "--disable-application-cache",
            "--disable-gpu",
            "--disable-dev-shm-usage",
            "--start-maximized",
            "--disable-extensions",
            "--window-size=1920,1080",
            `--user-agent=${config.userAgent}`
        ]
    });
};

// Function to open a page and navigate to Messenger
const openMessenger = async (browser) => {
    const page = await browser.newPage();
    await facebookCookieHandler(page)
    await page.goto("https://messenger.com", { waitUntil: "networkidle2" });
    return page;
};

const enterDumbE2eePin = async (pin, page) => {
    await page.waitForSelector('#mw-numeric-code-input-prevent-composer-focus-steal', { timeout: 50000 });
    const stupidPinBox = await page.$('#mw-numeric-code-input-prevent-composer-focus-steal');
    if (stupidPinBox) {
        await stupidPinBox.type(pin, { delay: 100 });
    }    
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to close the browser
const closeBrowser = async (browser) => {
    if (browser) await browser.close();
};

// Main function using functional composition
const startMessengerBot = async (config) => {
    const browser = await launchBrowser(config);
    const page = await openMessenger(browser);

    return { browser, page };
};

const login = async (user, pass, page) => {
    const mail = await page.$("#email");
    const password = await page.$("#pass");
    const submit = await page.$("#loginbutton");
    await mail.focus()
    await mail.type(user)
    await delay(3000)
    await password.focus()
    await password.click({ clickCount: 3 }); // Selects all text
    await password.press('Backspace'); // Clears it
    await password.type(pass, { delay: 100 });
    await submit.click()

};

export async function sneakyFacebook() {
    const spool = ora('Doing some McDevilry').start();
    const userConfig = await createConfig();
    const config = {
        headless: false,
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    };

    const { browser, page } = await startMessengerBot(config);
    spool.color = 'green'
    spool.text = 'Spy Kids style sneaking'
    const isLoggedIn = await facebookCookieHandler(page)

    if (isLoggedIn) {
        await enterDumbE2eePin('123456', page)    
    } else {
        await login(userConfig.botname, userConfig.botpassword, page);
        await enterDumbE2eePin('123456', page)
        const cookies = await page.cookies()
        await saveCookies(cookies)
    }

    page.goto(`https://www.messenger.com/t/4046546628783327/`)
    

}

// Wait for Facebook unblocking
sneakyFacebook();

import puppeteer from "puppeteer"

export async function sneakyChurch() {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
}

   
sneakyChurch()
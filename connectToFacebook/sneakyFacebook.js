import puppeteer from 'puppeteer'

const browser = await puppeteer.launch()
const page = browser.newPage()


// I've got to wait until Facebook unblocks me
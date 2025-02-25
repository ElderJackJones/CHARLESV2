import chalk from "chalk";
import cliProgress from 'cli-progress'
import { averageFilter } from "./averageFilter.js";

function meanyFace(arr) {
    const validNumbers = arr.filter(item => item !== null && item !== undefined && !isNaN(item)); 
    if (validNumbers.length === 0) return "0 min"; // Avoid division by zero

    const mean = validNumbers.reduce((sum, item) => sum + item, 0) / validNumbers.length;
    
    return formatTime(mean);
}

function formatTime(minutes) {
    const days = Math.floor(minutes / 1440); // 1 day = 1440 minutes
    const hours = Math.floor((minutes % 1440) / 60); // Remaining hours
    const mins = Math.floor(minutes % 60); // Remaining minutes

    let result = [];
    if (days > 0) result.push(`${days} day${days > 1 ? 's' : ''}`);
    if (hours > 0) result.push(`${hours} hr${hours > 1 ? 's' : ''}`);
    if (mins > 0 || result.length === 0) result.push(`${mins} min${mins > 1 ? 's' : ''}`);

    return result.join(" / ");
}




async function processContactTime(timeline) {
    const reversedTimeline = [...timeline].reverse();

    let referralSent = null;
    let lastContact = null;

    for (const item of reversedTimeline) {
        switch (item.timelineItemType) {
            case "NEW_REFERRAL":
                referralSent = new Date(item.itemDate);
                lastContact = null; // Reset when a new referral is found
                break;
            case "CONTACT":
            case "TEACHING":
                if (!lastContact) {
                    lastContact = new Date(item.itemDate);
                }
                break;
            default:
                continue;
        }
    }

    if (referralSent && lastContact) {
        const duration = (lastContact - referralSent) / (1000 * 60); // Convert milliseconds to minutes
        return Math.floor(duration);
    }

    return null;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getContactTime(guid, page) {
    // await delay(500); // Wait .5 second between requests
    const response = await page.evaluate(async (guid) => {
        const url = `https://referralmanager.churchofjesuschrist.org/services/progress/timeline/${guid}`;
        const response = await fetch(url, {method: 'GET'} );
    
        if (response.status === 503) {
            console.warn(`503 error for ${guid}, retrying in 5 seconds...`);
            await delay(5000);
            return getContactTime(guid, page); // Retry the request
        }
    
        if (!response.ok) {
            throw new Error(`Fetch failed with status ${response.status}`);
        }

        return await response.json()
    
    }, guid)
    
    return await processContactTime(response)
}



export async function getAverage(wholeShebang, page) {
    const bar = new cliProgress.SingleBar({
        format: 'DigiStalking People |' + chalk.cyan('{bar}') + '| {percentage}% || {value}/{total} People || ETA: {eta_formatted}',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
    });

    let parsed = await averageFilter(wholeShebang)    
    let unprocessedContacts = {};

    bar.start(parsed.length, 0)
    for (const person of parsed) {
        if (!person.guid) {
            continue
        }
        const time = await getContactTime(person.guid, page);
        if (!unprocessedContacts[person.zoneName]) {
            unprocessedContacts[person.zoneName] = []
        }
        unprocessedContacts[person.zoneName].push(time)
        bar.increment()
    }

    let message = "-->Contact Time<--\n";
    delete unprocessedContacts[null];
    delete unprocessedContacts[undefined];
    delete unprocessedContacts[""];
    for (const zone in unprocessedContacts) {
        if (!zone) {
            continue;
        }
        let avg = meanyFace(unprocessedContacts[zone]);
        message += `↳ ${zone.trim()}: ${avg}\n`;
    }

    return message;

}

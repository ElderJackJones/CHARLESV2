import { existsSync, readFileSync, writeFileSync } from "fs";
import { configCharles } from './configCharles.js';

function isMoreThan12HoursOld(timestamp) {
    const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
    return (Date.now() - timestamp) > TWELVE_HOURS_MS;
}

export async function createPayload(list) {
    const FILE_NAME = 'payload.json';

    if (existsSync(FILE_NAME)) {
        try {
            const oldpay = JSON.parse(readFileSync(FILE_NAME, 'utf-8'));
            if (!isMoreThan12HoursOld(oldpay.stamp)) {
                return oldpay;
            }
        } catch (error) {
            console.error(`Error reading ${FILE_NAME}:`, error);
        }
    }

    let zoneList;
    try {
        zoneList = JSON.parse( await configCharles('./resources/charlesConfig.json'))
    } catch (error) {
        console.error("Error fetching zone data:", error);
        return null; // Return `null` or throw an error if needed
    }

    let payload = { stamp: Date.now(), payload: {} };
    const zones = Object.keys(zoneList);
    console.log("Extracted zones:", zones);
    
    for (let zone of zones) {
        payload.payload[zone] = list.filter(person => 
            person.zoneName?.trim().toLowerCase() === zone.toLowerCase()
        );
    }

        // Log unassigned members
        list.forEach(person => {
            if (!person.zoneName) {
                console.warn(`${person.name} couldn't be assigned to a zone!`);
            }
        });
        try {
            writeFileSync(FILE_NAME, JSON.stringify(payload, null, 2));
        } catch (error) {
            console.error(`Error writing ${FILE_NAME}:`, error);
        }
    
        return payload;
    }


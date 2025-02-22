import { existsSync, readFileSync } from "fs";
import ora from "ora";
import { getZone } from "../getZone.js";

export async function editPayload() {
    const spool = ora('Making it pretty').start();
    let payload;
    
    try {
        payload = JSON.parse(readFileSync('../payload.json', 'utf8'));
    } catch (err) {
        spool.fail('Failed to read payload.json');
        console.error(err);
        return;
    }

    let zoneObj;
    
    if (existsSync('../resources/charlesConfig.json')) {
        try {
            zoneObj = JSON.parse(readFileSync('../resources/charlesConfig.json', 'utf8'));
        } catch (err) {
            spool.fail('Failed to read charlesConfig.json');
            console.error(err);
            return;
        }
    } else {
        spool.warn('No zone data detected, generating new list...');
        zoneObj = await getZone();
    }

    const prettyList = {};

    for (const zone in zoneObj) {
        const areaMap = {};  // Will hold areaName as key, and people array as value
        
        for (const person of payload.payload[zone]) {
            if (zone.toLowerCase() === person.zoneName.toLowerCase()) {
                const areaName = person.areaName;
                // Initialize an array for the area if it doesn't exist yet
                if (!areaMap[areaName]) {
                    areaMap[areaName] = { people: [] };
                }
                // Add the person's name to the appropriate area
                areaMap[areaName].people.push(person.name);  // Assuming 'name' is the key for person names
            }
        }
        
        prettyList[zone] = areaMap;
    }
    spool.succeed('pretty')
    return prettyList
}

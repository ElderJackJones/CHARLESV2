export function superParse(data) {
    if (!data || !Array.isArray(data.persons)) {
        return [];
    }

    return data.persons
        .map(person => {
            try {
                return {
                    guid: person.personGuid,
                    name: person.lastName ? `${person.firstName} ${person.lastName}` : person.firstName,
                    referralStatus: person.referralStatusId,
                    personStatus: person.personStatusId,
                    missionId: person.missionId,
                    zoneId: person.zoneId ?? null,
                    zoneName: person.zoneName ?? null,
                    districtId: person.districtId ?? null,
                    areaName: person.areaName ?? null,
                    assignedDate: person.referralAssignedDate,
                };
            } catch (error) {
                console.warn("Unable to parse person:", person, error);
                return null;
            }
        })
        .filter(person => person !== null);
};
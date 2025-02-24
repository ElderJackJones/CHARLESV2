function isWithinTimeRange(dateString) {
    const givenDate = new Date(dateString);
    const now = new Date();

    // Calculate the time boundaries
    const fortyEightHoursAgo = new Date(now);
    fortyEightHoursAgo.setHours(now.getHours() - 2);

    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(now.getDate() - 14);

    // Check if the given date is within the range
    return givenDate >= fourteenDaysAgo && givenDate <= fortyEightHoursAgo;
}

function isGreenOrYellow(obj) {
    if (obj.personStatus === 1 || obj.personStatus === 2 || obj.personStatus === 3 || obj.personStatus === 4) {
        return true
    } else {
        return false
    }
}

function unattempted(obj) {
    return (obj.referralStatus === 10)
}

function unsuccessful(obj) {
    return (obj.referralStatus === 20)
}

export async function listToday(list) {
    // const todaysList = list.filter(obj => isWithinTimeRange(obj.assignedDate))
    // const todaysListWithoutGrey = todaysList.filter(obj => isGreenOrYellow(obj))
    // const listFinal = todaysListWithoutGrey.filter(obj => unattempted(obj))

    const listToday = list.filter(obj => unattempted(obj))
    return listToday
}
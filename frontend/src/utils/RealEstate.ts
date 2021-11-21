const OUTDATED_DAYS = 90;


export function calculateOutdatedTime(days: number = OUTDATED_DAYS) {
    const today = new Date()
    return Math.floor(new Date().setDate(today.getDate() - days) / 1000)
}

export function timestampToDate(timestamp: number) {
    return new Date(timestamp * 1000)
}

export function timestampToDateString(timestamp: number) {
    return timestampToDate(timestamp).toLocaleString()
}
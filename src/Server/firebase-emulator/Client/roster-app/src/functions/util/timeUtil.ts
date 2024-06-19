/**
 * Returns a time string in 12-hour numeric HH:MM AM/PM format.
 * @param time
 * @param is24hr If true, returns the string in 24-hour time format.
 * @returns
 */
export function getDisplayTime(time: Date, is24hr: boolean = false): string {
  return time.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: !is24hr,
  });
}

/**
 * Returns the time difference in minutes.
 * @param startTime
 * @param endTime
 * @param round If true, rounds to the nearest integer.
 * @returns
 */
export function getTimeDifferenceMinutes(startTime: Date, endTime: Date, round: boolean = false): number {
  const diff = endTime.getTime() - startTime.getTime();
  if(round) return Math.round(diff / 60000);
  else return diff / 60000;
}

/**
 * Returns the time difference in hours.
 * @param startTime 
 * @param endTime 
 * @param round If true, rounds to the nearest integer.
 * @returns 
 */
export function getTimeDifferenceHours(startTime: Date, endTime: Date, round: boolean = false): number {
  const diff = endTime.getTime() - startTime.getTime();
  if(round) return Math.round(diff / 1000);
  else return diff / 3600000;
}

/**
 * Returns a new date instance with its date section modified to be the target date.
 * @param date The date instance to modify.
 * @param targetDate The target date.
 * @returns
 */
export function modifyDateOnly(date: Date, targetDate: Date): Date {
  const tempdate = new Date(date);
  tempdate.setFullYear(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  return tempdate;
}

/**
 * Returns a new date instance with its time section modified to be the target time.
 * @param time The date instance to modify.
 * @param targetTime The target time.
 * @returns
 */
export function modifyTimeOnly(time: Date, targetTime: Date): Date {
  const tempTime = new Date(time);
  tempTime.setHours(targetTime.getHours(), targetTime.getMinutes(), targetTime.getSeconds());
  return tempTime;
}

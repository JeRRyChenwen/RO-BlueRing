import currency from "currency.js";
import { getTimeDifferenceHours, getTimeDifferenceMinutes } from "./timeUtil";

/**
 * Returns a currency instance in Australian dollars format.
 * @param value
 * @returns
 */
export const getAUDCurrency = (value: number | string): currency => {
  return currency(value, { symbol: "$", separator: ",", decimal: "." });
};

/**
 * Returns the value of a currency instance.
 * @param currency
 * @returns
 */
export const getCurrencyValue = (currency: currency): number => {
  return currency.value;
};

/**
 * Returns an estimated earning precise to the minute based on the hourly rate, start time, and end time.
 * @param rate Pay rate, hourly rate by default.
 * @param startTime Start time of the work shift.
 * @param endTime End time of the work shift.
 * @param frequency Pay rate unit. "Hour" or "Day", default is "Hour".
 * @param workingHours Standard number of working hours per day used for rate calculation if {@link frequency} is "Day". Default is 8.
 * @returns
 */
export const calculateEarning = (
  rate: currency,
  startTime: Date,
  endTime: Date,
  frequency: "Day" | "Hour" = "Hour",
  workingHours: number = 8
): currency => {
  // Calculate by hours / minutes depending on the rate frequency to maintain precision.
  switch (frequency) {
    case "Day": {
      const hourRate = rate.divide(workingHours);
      const hours: number = getTimeDifferenceHours(startTime, endTime);
      return hourRate.multiply(hours);
    }
    case "Hour": {
      const minuteRate = rate.divide(60);
      const minutes: number = getTimeDifferenceMinutes(startTime, endTime);
      return minuteRate.multiply(minutes);
    }
  }
};

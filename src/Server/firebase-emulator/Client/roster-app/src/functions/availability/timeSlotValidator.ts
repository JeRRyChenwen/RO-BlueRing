import { TimeSlot } from "@api/types/Availability";

export class TimeSlotErrors {
  time: string | null = null;

  hasErrors(): boolean {
    return this.time != null;
  }
}

/**
 * Checks whether adhoc data is valid. Throws errors if found invalid fields.
 * @param timeSlot The timeSlot to check.
 */
export function validateTimeSlot(timeSlot: TimeSlot): TimeSlotErrors {
  const errorMessages: TimeSlotErrors = new TimeSlotErrors();
  if (timeSlot.endTime.getTime() <= timeSlot.startTime.getTime()) {
    errorMessages.time = "The end time must be later than the start time.";
  }

  return errorMessages;
}

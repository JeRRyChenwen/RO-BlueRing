import { WorkShift } from "@api/types/WorkShift";

export const NOTE_MAX_LENGTH: number = 200;

export class WorkShiftErrors {
  time: string | null = null;
  note: string | null = null;

  hasErrors(): boolean {
    return this.time != null || this.note != null;
  }
}

/**
 * Checks whether work shift data is valid. Throws errors if found invalid fields.
 * @param workShift The work shift to check.
 */
export function validateWorkShift(workShift: WorkShift): WorkShiftErrors {
  const errorMessages: WorkShiftErrors = new WorkShiftErrors();
  if (workShift.endTime <= workShift.startTime) {
    errorMessages.time = "The end time must be later than the start time.";
  }
  if (workShift.note.length > NOTE_MAX_LENGTH) {
    errorMessages.note = "Notes has a character limit of " + NOTE_MAX_LENGTH + " characters.";
  }

  return errorMessages;
}

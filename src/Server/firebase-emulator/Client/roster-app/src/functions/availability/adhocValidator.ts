import { Adhoc } from "@api/types/Availability";

export const NOTE_MAX_LENGTH: number = 200;

export class AdhocErrors {
  time: string | null = null;
  note: string | null = null;

  hasErrors(): boolean {
    return this.time != null || this.note != null;
  }
}

/**
 * Checks whether adhoc data is valid. Throws errors if found invalid fields.
 * @param adhoc The adhoc to check.
 */
export function validateAdhoc(adhoc: Adhoc): AdhocErrors {
  const errorMessages: AdhocErrors = new AdhocErrors();
  if (adhoc.endTime <= adhoc.startTime) {
    errorMessages.time = "The end time must be later than the start time.";
  }
  if (adhoc.note && adhoc.note.length > NOTE_MAX_LENGTH) {
    errorMessages.note = `Note has a character limit of ${NOTE_MAX_LENGTH} characters.`;
  }

  return errorMessages;
}

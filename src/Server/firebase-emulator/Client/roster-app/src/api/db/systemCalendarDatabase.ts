import { WorkShift } from "@api/types/WorkShift";
import * as ExpoCalendar from "expo-calendar";
import { Platform } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

const CALENDAR_ID_KEY = "calendar-id";
// Time range to fetch calendar events from.
const PAST_MONTHS = 3;
const FUTURE_MONTHS = 6;

/**
 * Returns an array of calendar events.
 * @param userId
 * @returns
 */
export async function loadCalendarEvents(
  userId: string
): Promise<ExpoCalendar.Event[] | undefined> {
  try {
    const calendarId: string = await getOrCreateCalendar(userId);
    let startDate = new Date();
    let endDate = new Date();
    startDate.setMonth(startDate.getMonth() - PAST_MONTHS);
    endDate.setMonth(endDate.getMonth() + FUTURE_MONTHS);

    const events: ExpoCalendar.Event[] = await ExpoCalendar.getEventsAsync(
      [calendarId],
      startDate,
      endDate
    );
    return events;
  } catch (error: any) {
    console.error("Error loading calendar events: ", error);
  }
}

/**
 * Create or update a calendar event associated with a work work shift.
 * @param workShift
 * @param userId
 */
export async function saveCalendarEvent(workShift: WorkShift, userId: string): Promise<string> {
  try {
    const eventDetails: Partial<ExpoCalendar.Event> = calendarEventDetailsFromWorkShift(workShift);

    // If no associated calendar event, create one.
    if (workShift.eventId === "") {
      const calendarId: string = await getOrCreateCalendar(userId);
      const eventId = await ExpoCalendar.createEventAsync(calendarId, eventDetails);
      console.log("Created event: ", eventId);
      return eventId;
    }
    // Otherwise update the existing calendar event.
    else {
      await ExpoCalendar.updateEventAsync(workShift.eventId, eventDetails);
      console.log("Updated event: ", workShift.eventId);
      return workShift.eventId;
    }
  } catch (error: any) {
    console.error("Error saving calendar event associated with work shift: ", error);
    throw error;
  }
}

/**
 * Delete the calendar event associated with a work shift.
 * @param workShift 
 * @param userId This parameter is not used.
 * @returns 
 */
export async function deleteCalendarEvent(workShift: WorkShift, userId: string): Promise<void> {
  try {
    if (!workShift.eventId || workShift.eventId === "") return;
    await ExpoCalendar.deleteEventAsync(workShift.eventId);
    console.log("Deleted event: ", workShift.eventId);
  } catch (error: any) {
    console.warn("Error deleteing calendar event associated with work shift: ", error);
    throw new Error("Encountered an error while deleting calendar event associated with work shift.")
  }
}

/**
 * Get a calendar for the app from system calendar.
 * If no such calendar exists, creates one.
 * @param userId This parameter is not used.
 * @returns
 */
export async function getOrCreateCalendar(userId: string): Promise<string> {
  try {
    const calendarId = await AsyncStorage.getItem(CALENDAR_ID_KEY);
    console.log("Calendar ID loaded: ", calendarId);
    
    if(calendarId == null){
      const id = await createNewCalendar();
      return id;
    }

    let foundCalendarId = null;
    const calendars = await ExpoCalendar.getCalendarsAsync();
    calendars.forEach(element => {
      console.log("Calendar: ", element.id);
      if(element.id === calendarId){
        foundCalendarId = element.id;
      }
    });

    if (foundCalendarId != null) {
      console.log(`Found calendar ID: ${foundCalendarId}`);
      return foundCalendarId;
    }
    else{
      console.log("Did not find calendar with ID: ", calendarId);
      const id = await createNewCalendar();
      return id;
    }
  } catch (error: any) {
    console.error("Error getting or creating calendar: ", error);
    throw new Error("Encountered an error when accessing system calendar.");
  }
}

async function createNewCalendar(): Promise<string>{
  const defaultCalendarSource = await importCalendarSourceAsync();
  if(defaultCalendarSource == null) throw new Error("Cannot get default calendar source.");
  const newCalendarId: string = await ExpoCalendar.createCalendarAsync({ 
    title: "RosterApp Calendar",
    name: "RosterApp Calendar",
    color: "blue",
    entityType: ExpoCalendar.EntityTypes.EVENT,
    source: defaultCalendarSource,
    sourceId: defaultCalendarSource.id,
    ownerAccount: "personal",
    accessLevel: ExpoCalendar.CalendarAccessLevel.OWNER
  });
  console.log(`Your new calendar ID is: ${newCalendarId}`);
  await AsyncStorage.setItem(CALENDAR_ID_KEY, newCalendarId);
  console.log("Saved calendar ID: ", newCalendarId);
  return newCalendarId;
}

/**
 * Returns a partial calendar event instance based on the provided work shift.
 * @param workShift
 * @returns
 */
export function calendarEventDetailsFromWorkShift(
  workShift: WorkShift
): Partial<ExpoCalendar.Event> {
  const title: string = workShift.name ? "Work Shift: " + workShift.name : "Unnamed Work Shift";
  const eventData: Partial<ExpoCalendar.Event> = {
    title: title,
    startDate: workShift.startTime,
    endDate: workShift.endTime,
    notes: workShift.note,
  };
  return eventData;
}

async function importCalendarSourceAsync() {
  if(Platform.OS === 'ios'){
    const defaultCalendar = await ExpoCalendar.getDefaultCalendarAsync();
    if(defaultCalendar) return defaultCalendar.source;

    const sources = await ExpoCalendar.getSourcesAsync();
    sources.forEach((source) => console.log("Calendar source: ", source) );
    const mainSource = sources.find(source=>source.name === "iCloud") || sources[0];
    return mainSource;
  }
  else return {
    isLocalAccount: true,
    name: "RosterApp Calendar",
    type: ExpoCalendar.SourceType.LOCAL
  }
}

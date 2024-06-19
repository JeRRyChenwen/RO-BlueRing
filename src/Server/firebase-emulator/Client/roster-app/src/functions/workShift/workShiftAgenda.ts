import { WorkShift } from "@api/types/WorkShift";
import { AgendaEntry, AgendaSchedule } from "react-native-calendars";
import { MarkedDates } from "react-native-calendars/src/types";
import { format } from "date-fns";

/**
 * Data structure used to display work shift data in a React Native Calendars Agenda view.
 */
export interface WorkShiftEntry extends AgendaEntry {
  id: string;
  data: WorkShift;
  onTrigger?: (arg: WorkShiftEntry) => void;
  onDelete?: (arg: string) => void;
}

/**
 * Given a map of work shifts data, builds agenda entries and related data used for displaying on React Native Calendars Agenda view.
 * @param workShifts The work shifts map to convert.
 * @param onBuildAgendaSchedule The callback to execute when an agenda schedule instance is built.
 * @param onBuildMarkedDates The callback to execute when a marked dates instance is built.
 * @param onShowEntryDetails The callback to execute when requested to show details of an agenda entry.
 * @param onDeleteEntry The callback to execute when delete button is pressed on the agenda entry.
 */
export function setupAgendaCalendarData(
  workShifts: Map<string, WorkShift>,
  onBuildAgendaSchedule?: (arg: AgendaSchedule) => any,
  onBuildMarkedDates?: (arg: MarkedDates) => any,
  onShowEntryDetails: (arg: WorkShiftEntry) => void = () => {},
  onDeleteEntry: (arg: string) => void = () => {}
): void {
  const entries: WorkShiftEntry[] = Array.from(workShifts).map(([id, workShift]) => {
    return {
      id: id,
      name: id,
      data: workShift,
      height: 0,
      day: format(workShift.startTime, "yyyy-MM-dd"), // Extracts YYYY-MM-DD from the startTime date.
      onTrigger: (entry: WorkShiftEntry) => onShowEntryDetails(entry),
      onDelete: (id: string) => onDeleteEntry(id),
    };
  });

  // Fill agenda schedule and marked dates.
  const agendaSchedule = populateAgendaSchedule();
  const markedDates: MarkedDates = {};
  for (const entry of entries) {
    if (!agendaSchedule[entry.day]) continue;
    if (!markedDates[entry.day]) {
      markedDates[entry.day] = {
        dots: [],
        marked: true,
      };
    }
    agendaSchedule[entry.day].push(entry);
    markedDates[entry.day].dots?.push({
      key: entry.id,
      color: "green",
      selectedDotColor: "white",
    });
  }

  // Sort each day's entries by their start time.
  for (const day in agendaSchedule) {
    if (agendaSchedule[day].length === 0) continue;
    agendaSchedule[day].sort((a, b) => {
      a;
      return (
        new Date((a as WorkShiftEntry).data.startTime).getTime() -
        new Date((b as WorkShiftEntry).data.startTime).getTime()
      );
    });
  }

  if (onBuildAgendaSchedule) onBuildAgendaSchedule(agendaSchedule);
  if (onBuildMarkedDates) onBuildMarkedDates(markedDates);
}

const populateAgendaSchedule = (): AgendaSchedule => {
  const newAgendaSchedule: AgendaSchedule = {};
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 12);
  const tempDate = startDate;
  while (tempDate <= endDate) {
    const dateStr = tempDate.toISOString().split("T")[0];
    newAgendaSchedule[dateStr] = [];
    tempDate.setDate(tempDate.getDate() + 1);
  }
  return newAgendaSchedule;
};

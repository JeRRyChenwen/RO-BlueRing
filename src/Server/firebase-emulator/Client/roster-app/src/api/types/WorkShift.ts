import { DocumentData, DocumentSnapshot, SnapshotOptions, Timestamp } from "firebase/firestore";

export interface WorkShift {
  workplaceId: string;
  name: string;
  startTime: Date;
  endTime: Date;
  note: string;
  eventId: string;
}

/**
 * Converts {@link WorkShift} to and from Firestore document format.
 */
export const workShiftConverter = {
  toFirestore: (workShift: WorkShift) => {
    return {
      workplaceId: workShift.workplaceId,
      name: workShift.name,
      startTime: Timestamp.fromDate(workShift.startTime),
      endTime: Timestamp.fromDate(workShift.endTime),
      note: workShift.note,
      eventId: workShift.eventId,
    };
  },

  fromFirestore: (snapshot: DocumentSnapshot, options?: SnapshotOptions) => {
    if (!snapshot.exists()) return null;
    const data: DocumentData = snapshot.data(options);
    return {
      workplaceId: data.workplaceId,
      name: data.name,
      startTime: data.startTime.toDate(),
      endTime: data.endTime.toDate(),
      note: data.note,
      eventId: data.eventId,
    };
  },
};

import { DocumentData, DocumentSnapshot, SnapshotOptions, Timestamp } from "firebase/firestore";

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  day: string;
}

/**
 * Converts {@link TimeSlot} to and from Firestore document format.
 */
export const timeSlotConverter = {
  toFirestore: (timeSlot: TimeSlot) => {
    return {
      startTime: Timestamp.fromDate(timeSlot.startTime),
      endTime: Timestamp.fromDate(timeSlot.endTime),
      day: timeSlot.day,
    };
  },

  fromFirestore: (snapshot: DocumentSnapshot, options?: SnapshotOptions) => {
    if (!snapshot.exists()) return null;
    const data: DocumentData = snapshot.data(options);
    return {
      startTime: data.startTime.toDate(),
      endTime: data.endTime.toDate(),
      day: data.day,
    };
  },
};

export interface Adhoc {
  isAvailable: boolean;
  startTime: Date;
  endTime: Date;
  note: string;
}

/**
 * Converts {@link Adhoc} to and from Firestore document format.
 */
export const adhocConverter = {
  toFirestore: (adhoc: Adhoc) => {
    return {
      isAvailable: adhoc.isAvailable,
      startTime: Timestamp.fromDate(adhoc.startTime),
      endTime: Timestamp.fromDate(adhoc.endTime),
      note: adhoc.note,
    };
  },

  fromFirestore: (snapshot: DocumentSnapshot, options?: SnapshotOptions) => {
    if (!snapshot.exists()) return null;
    const data: DocumentData = snapshot.data(options);
    return {
      isAvailable: data.isAvailable,
      startTime: data.startTime.toDate(),
      endTime: data.endTime.toDate(),
      note: data.note,
    };
  },
};


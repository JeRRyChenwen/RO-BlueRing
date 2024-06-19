import { db } from "@services/firebaseConfig";
import {
  Unsubscribe,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { TimeSlot, timeSlotConverter } from "@api/types/Availability"; // Updated import

const accountsCollectionId: string = "Accounts";
const timeSlotsCollectionId: string = "TimeSlots"; // Updated collection ID

/**
 * Attaches a listener for time slots in the remote database.
 * @param userId User UID.
 * @param onChange A callback to be called every time a new QuerySnapshot is available.
 * @returns An unsubscribe function that can be called to cancel the snapshot listener.
 */
export function onTimeSlotsSnapshot(
  userId: string,
  onChange: (arg: Map<string, TimeSlot>) => void
): Unsubscribe {
  const collectionRef = collection(db, accountsCollectionId, userId, timeSlotsCollectionId);
  const unsubscribe = onSnapshot(
    collectionRef.withConverter(timeSlotConverter),
    (querySnapshot) => {
      const timeSlots: Map<string, TimeSlot> = querySnapshot.empty
        ? new Map()
        : new Map(querySnapshot.docs.map((doc) => [doc.id, doc.data()]));
      onChange(timeSlots);
    },
    (error) => {
      console.error("Error fetching TimeSlots from Firestore:", error);
      throw Error("Encountered an error when retrieving list of TimeSlots: " + error.message);
    }
  );
  return unsubscribe;
}

/**
 * Create a new time slot data document in remote database.
 * @param timeSlot The time slot data instance to save.
 * @param userId User UID.
 */
export async function createTimeSlot(timeSlot: TimeSlot, userId: string) {
  try {
    const collectionRef = collection(db, accountsCollectionId, userId, timeSlotsCollectionId);
    await addDoc(collectionRef.withConverter(timeSlotConverter), timeSlot);
  } catch (error) {
    console.error("Error creating TimeSlot in remote Firestore: ", error);
    throw new Error("Encountered an error when creating TimeSlot data.");
  }
}

/**
 * Save time slot data in remote database.
 * @param id The time slot document id.
 * @param timeSlot The time slot data instance to save.
 * @param userId User UID.
 */
export async function updateTimeSlot(
  id: string,
  timeSlot: TimeSlot,
  userId: string
): Promise<void> {
  try {
    const docRef = doc(db, accountsCollectionId, userId, timeSlotsCollectionId, id);
    const snapshot = await getDoc(docRef.withConverter(timeSlotConverter));

    if (snapshot.exists()) {
      await setDoc(docRef, timeSlot, { merge: true });
    } else {
      const collectionRef = collection(db, accountsCollectionId, userId, timeSlotsCollectionId);
      await addDoc(collectionRef.withConverter(timeSlotConverter), timeSlot);
    }
  } catch (error) {
    console.error("Error saving TimeSlot to remote Firestore: ", error);
    throw new Error("Encountered an error when updating TimeSlot data.");
  }
}

/**
 * Retrieve a time slot data instance from remote database.
 * @param id The time slot document id.
 * @param userId User UID.
 * @returns
 */
export async function getTimeSlot(id: string, userId: string): Promise<TimeSlot | null> {
  try {
    const docRef = doc(db, accountsCollectionId, userId, timeSlotsCollectionId, id);
    const snapshot = await getDoc(docRef.withConverter(timeSlotConverter));
    if (!snapshot.exists()) return null;
    else return snapshot.data();
  } catch (error: any) {
    console.error("Error getting time slot from remote Firestore: ", error);
    throw new Error("Encountered an error when retrieving time slot data.");
  }
}

/**
 * Retrieve all time slots of a user from remote database.
 * @param userId User UID.
 * @returns
 */
export async function getAllTimeSlots(userId: string): Promise<Map<string, TimeSlot>> {
  try {
    const collectionRef = collection(db, accountsCollectionId, userId, timeSlotsCollectionId);
    const querySnapshot = await getDocs(collectionRef.withConverter(timeSlotConverter));
    const timeSlots: Map<string, TimeSlot> = querySnapshot.empty
      ? new Map()
      : new Map(querySnapshot.docs.map((doc) => [doc.id, doc.data()]));
    return timeSlots;
  } catch (error: any) {
    console.error("Error getting time slots from remote Firestore: ", error);
    throw new Error("Encountered an error when retrieving all time slot data.");
  }
}

/**
 * Delete the specified time slot data from remote database.
 * @param id The time slot document id.
 * @param userId User UID.
 */
export async function deleteTimeSlot(id: string, userId: string): Promise<void> {
  try {
    const docRef = doc(db, accountsCollectionId, userId, timeSlotsCollectionId, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting time slot from remote Firestore: ", error);
    throw new Error("Encountered an error when deleting time slot data.");
  }
}

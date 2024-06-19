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
import { WorkShift, workShiftConverter } from "@api/types/WorkShift";
import { deleteCalendarEvent, saveCalendarEvent } from "./systemCalendarDatabase";

const accountsCollectionId: string = "Accounts";
const workShiftsCollectionId: string = "WorkShifts";

/**
 * Attaches a listener for workplaces in the remote database.
 * The listener can be cancelled by calling the function that is returned.
 * @param userId User UID.
 * @param onChange A callback to be called every time a new QuerySnapshot is available.
 * @returns An unsubscribe function that can be called to cancel the snapshot listener.
 */
export function onWorkShiftsSnapshot(
  userId: string,
  onChange: (arg: Map<string, WorkShift>) => void
): Unsubscribe {
  const collectionRef = collection(db, accountsCollectionId, userId, workShiftsCollectionId);
  const unsubscribe = onSnapshot(
    collectionRef.withConverter(workShiftConverter),
    (querySnapshot) => {
      const workShifts: Map<string, WorkShift> = querySnapshot.empty
        ? new Map()
        : new Map(querySnapshot.docs.map((doc) => [doc.id, doc.data()]));
      onChange(workShifts);
    },
    (error) => {
      console.error("Error fetching Work Shifts from Firestore:", error);
      throw Error("Encountered an error when retrieving list of Work Shifts: " + error.message);
    }
  );
  return unsubscribe;
}

/**
 * Create a new workplace data document in remote database.
 * @param workShift The workplace data instance to save.
 * @param userId User UID.
 * @param syncCalendarEvent If true, creates an event in the system calendar if available.
 */
export async function createWorkShift(workShift: WorkShift, userId: string, syncCalendarEvent: boolean = false) {
  try {
    if(syncCalendarEvent){
      const eventId = await saveCalendarEvent(workShift, userId);
      workShift.eventId = eventId;
    }
    const collectionRef = collection(db, accountsCollectionId, userId, workShiftsCollectionId);
    var id = doc(collectionRef).id;
    await addDoc(collectionRef.withConverter(workShiftConverter), workShift);
  } catch (error) {
    console.error("Error creating Workplace in remote Firestore: ", error);
    throw new Error("Encountered an error when creating Workplace data.");
  }
}

/**
 * Save workplace data in remote database.
 * @param id The workplace document id.
 * @param workShift The workplace data instance to save.
 * @param userId User UID.
 * @param syncCalendarEvent If true, creates or updates the event in the system calendar if available.
 */
export async function updateWorkShift(
  id: string,
  workShift: WorkShift,
  userId: string,
  syncCalendarEvent: boolean = false
): Promise<void> {
  try {
    if(syncCalendarEvent){
      const eventId = await saveCalendarEvent(workShift, userId);
      workShift.eventId = eventId;
    }

    const docRef = doc(db, accountsCollectionId, userId, workShiftsCollectionId, id);
    const snapshot = await getDoc(docRef.withConverter(workShiftConverter));

    if (snapshot.exists()) {
      await setDoc(docRef, workShift, { merge: true });
    } else {
      const collectionRef = collection(db, accountsCollectionId, userId, workShiftsCollectionId);
      await addDoc(collectionRef.withConverter(workShiftConverter), workShift);
    }
  } catch (error) {
    console.error("Error saving Workplace to remote Firestore: ", error);
    throw new Error("Encountered an error when updating Workplace data.");
  }
}

/**
 * Retrieve a workplace data instance from remote database.
 * @param id Name of the workplace.
 * @param userId User UID.
 * @returns
 */
export async function getWorkShift(id: string, userId: string): Promise<WorkShift | null> {
  try {
    const docRef = doc(db, accountsCollectionId, userId, workShiftsCollectionId, id);
    const snapshot = await getDoc(docRef.withConverter(workShiftConverter));
    if (!snapshot.exists()) return null;
    else return snapshot.data();
  } catch (error: any) {
    console.error("Error getting work shift from remote Firestore: ", error);
    throw new Error("Encountered an error when retrieving work shift data.");
  }
}

/**
 * Retrieve all work shifts of a user from remote database.
 * @param userId User UID.
 * @returns
 */
export async function getAllWorkShifts(userId: string): Promise<Map<string, WorkShift>> {
  try {
    const collectionRef = collection(db, accountsCollectionId, userId, workShiftsCollectionId);
    const querySnapshot = await getDocs(collectionRef.withConverter(workShiftConverter));
    const workplaces: Map<string, WorkShift> = querySnapshot.empty
      ? new Map()
      : new Map(querySnapshot.docs.map((doc) => [doc.id, doc.data()]));
    return workplaces;
  } catch (error: any) {
    console.error("Error getting work shifts from remote Firestore: ", error);
    throw new Error("Encountered an error when retrieving all work shift data.");
  }
}

/**
 * Delete the specified workplace data from remote database.
 * @param id Name of the workplace to delete.
 * @param userId User UID.
 */
export async function deleteWorkShift(id: string, userId: string): Promise<void> {
  try {
    // Delete any associated calendar event.
    try{
      const workShift = await getWorkShift(id, userId);
      if(workShift == null) throw new Error("Cannot find work shift.");
      await deleteCalendarEvent(workShift, userId);
    } catch(error:any){
      console.error(error);
    }
    // Delete work shift.
    const docRef = doc(db, accountsCollectionId, userId, workShiftsCollectionId, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting work shift from remote Firestore: ", error);
    throw new Error("Encountered an error when deleting work shift data.");
  }
}

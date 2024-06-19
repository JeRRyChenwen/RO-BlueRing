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
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { Workplace, workplaceConverter } from "@api/types/Workplace";

const accountsCollectionId: string = "Accounts";
const workplacesCollectionId: string = "Workplaces";

class DuplicateNameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DuplicateNameError";
  }
}

/**
 * Attaches a listener for workplaces in the remote database.
 * The listener can be cancelled by calling the function that is returned.
 * @param userId User UID.
 * @param onChange A callback to be called every time a new QuerySnapshot is available.
 * @returns An unsubscribe function that can be called to cancel the snapshot listener.
 */
export function onWorkplacesSnapshot(
  userId: string,
  onChange: (arg: Map<string, Workplace>) => void
): Unsubscribe {
  const collectionRef = collection(db, accountsCollectionId, userId, workplacesCollectionId);
  const unsubscribe = onSnapshot(
    collectionRef.withConverter(workplaceConverter),
    (querySnapshot) => {
      const workplaces: Map<string, Workplace> = querySnapshot.empty
        ? new Map()
        : new Map(querySnapshot.docs.map((doc) => [doc.id, doc.data()]));
      onChange(workplaces);
    },
    (error) => {
      console.error("Error fetching Workplaces from Firestore:", error);
      throw Error("Encountered an error when retrieving list of Workplaces: " + error.message);
    }
  );
  return unsubscribe;
}

/**
 * Create a new workplace data document in remote database.
 * @param workplace The workplace data instance to save.
 * @param userId User UID.
 */
export async function createWorkplace(workplace: Workplace, userId: string) {
  try {
    // Prevent duplicate workplace names.
    const hasDuplicateName: boolean = await checkDuplicateName(null, workplace.name, userId);
    if (hasDuplicateName) {
      throw new DuplicateNameError("A Workplace with the same name already exists!");
    }

    const collectionRef = collection(db, accountsCollectionId, userId, workplacesCollectionId);
    await addDoc(collectionRef.withConverter(workplaceConverter), workplace);
  } catch (error) {
    console.error("Error creating Workplace in remote Firestore: ", error);
    if (error instanceof DuplicateNameError) throw error;
    else throw new Error("Encountered an error when creating Workplace data.");
  }
}

/**
 * Save workplace data in remote database.
 * @param id The workplace document id.
 * @param workplace The workplace data instance to save.
 * @param userId User UID.
 */
export async function updateWorkplace(
  id: string,
  workplace: Workplace,
  userId: string
): Promise<void> {
  try {
    const docRef = doc(db, accountsCollectionId, userId, workplacesCollectionId, id);
    const snapshot = await getDoc(docRef.withConverter(workplaceConverter));

    if (snapshot.exists()) {
      // Prevent duplicate workplace names when updating existing workplace.
      // Note that the workplace id is provided.
      const hasDuplicateName: boolean = await checkDuplicateName(id, workplace.name, userId);
      if (hasDuplicateName) {
        throw new DuplicateNameError("A Workplace with the same name already exists!");
      }
      await setDoc(docRef.withConverter(workplaceConverter), workplace, { merge: true });
    } else {
      // Prevent duplicate workplace names when creating new workplace.
      const hasDuplicateName: boolean = await checkDuplicateName(null, workplace.name, userId);
      if (hasDuplicateName) {
        throw new DuplicateNameError("A Workplace with the same name already exists!");
      }
      const collectionRef = collection(db, accountsCollectionId, userId, workplacesCollectionId);
      await addDoc(collectionRef.withConverter(workplaceConverter), workplace);
    }
  } catch (error) {
    console.error("Error saving Workplace to remote Firestore: ", error);
    if (error instanceof DuplicateNameError) throw error;
    else throw new Error("Encountered an error when updating Workplace data.");
  }
}

/**
 * Retrieve a workplace data instance from remote database.
 * @param id Workplace document id.
 * @param userId User UID.
 * @returns
 */
export async function getWorkplace(id: string, userId: string): Promise<Workplace | null> {
  try {
    const docRef = doc(db, accountsCollectionId, userId, workplacesCollectionId, id);
    const snapshot = await getDoc(docRef.withConverter(workplaceConverter));
    if (!snapshot.exists()) return null;
    else return snapshot.data();
  } catch (error: any) {
    console.error("Error getting Workplace from remote Firestore: ", error);
    throw new Error("Encountered an error when retrieving Workplace data.");
  }
}

/**
 * Retrieve all workplaces of a user from remote database.
 * @param userId User UID.
 * @returns
 */
export async function getAllWorkplaces(userId: string): Promise<Map<string, Workplace>> {
  try {
    const collectionRef = collection(db, accountsCollectionId, userId, workplacesCollectionId);
    const querySnapshot = await getDocs(collectionRef.withConverter(workplaceConverter));
    const workplaces: Map<string, Workplace> = querySnapshot.empty
      ? new Map()
      : new Map(querySnapshot.docs.map((doc) => [doc.id, doc.data()]));
    return workplaces;
  } catch (error: any) {
    console.error("Error getting Workplaces from remote Firestore: ", error);
    throw new Error("Encountered an error when retrieving all Workplace data.");
  }
}

/**
 * Delete the specified workplace data from remote database.
 * @param id Workplace document id.
 * @param userId User UID.
 */
export async function deleteWorkplace(id: string, userId: string): Promise<void> {
  try {
    const docRef = doc(db, accountsCollectionId, userId, workplacesCollectionId, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting Workplace from remote Firestore: ", error);
    throw new Error("Encountered an error when deleting Workplace data.");
  }
}

/**
 * Returns true if a workplace with the same name already exists in remote database.
 * @param id Workplace document id. If null, assumes we are creating a new document.
 * @param name The workplace name to check.
 * @param userId User UID.
 * @returns
 */
async function checkDuplicateName(
  id: string | null,
  name: string,
  userId: string
): Promise<boolean> {
  try {
    const collectionRef = collection(db, accountsCollectionId, userId, workplacesCollectionId);
    const collectionQuery = query(collectionRef, where("name", "==", name));
    const querySnapshot = await getDocs(collectionQuery);
    // There are no Workplaces with the same name.
    if (querySnapshot.empty) return false;
    // There is one existing Workplace with the same name.
    else if (querySnapshot.size == 1) {
      // We're creating a new workplace, and it has the same name as the exising one.
      if (id == null) return true;
      // If an ID is provided and it matches, it's the Workplace we're updating so it doesn't count.
      else if (querySnapshot.docs[0].id == id) return false;
    }
    // There are more than one existing Workplaces with the same name.
    return true;
  } catch (error) {
    console.error("Error checking duplicate Workplace: ", error);
    throw new Error("Encountered an error when validating Workplace data.");
  }
}

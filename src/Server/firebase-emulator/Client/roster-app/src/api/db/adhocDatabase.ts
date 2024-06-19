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
import { Adhoc, adhocConverter } from "@api/types/Availability"; // Updated import

const accountsCollectionId: string = "Accounts";
const adhocsCollectionId: string = "Adhocs"; // Updated collection ID

/**
 * Attaches a listener for adhocs in the remote database.
 * @param userId User UID.
 * @param onChange A callback to be called every time a new QuerySnapshot is available.
 * @returns An unsubscribe function that can be called to cancel the snapshot listener.
 */
export function onAdhocsSnapshot(
  userId: string,
  onChange: (arg: Map<string, Adhoc>) => void
): Unsubscribe {
  const collectionRef = collection(db, accountsCollectionId, userId, adhocsCollectionId);
  const unsubscribe = onSnapshot(
    collectionRef.withConverter(adhocConverter),
    (querySnapshot) => {
      const adhocs: Map<string, Adhoc> = querySnapshot.empty
        ? new Map()
        : new Map(querySnapshot.docs.map((doc) => [doc.id, doc.data()]));
      onChange(adhocs);
    },
    (error) => {
      console.error("Error fetching Adhocs from Firestore:", error);
      throw Error("Encountered an error when retrieving list of Adhocs: " + error.message);
    }
  );
  return unsubscribe;
}

/**
 * Create a new adhoc data document in remote database.
 * @param adhoc The adhoc data instance to save.
 * @param userId User UID.
 */
export async function createAdhoc(adhoc: Adhoc, userId: string) {
  try {
    const collectionRef = collection(db, accountsCollectionId, userId, adhocsCollectionId);
    await addDoc(collectionRef.withConverter(adhocConverter), adhoc);
  } catch (error) {
    console.error("Error creating Adhoc in remote Firestore: ", error);
    throw new Error("Encountered an error when creating Adhoc data.");
  }
}

/**
 * Save adhoc data in remote database.
 * @param id The adhoc document id.
 * @param adhoc The adhoc data instance to save.
 * @param userId User UID.
 */
export async function updateAdhoc(
  id: string,
  adhoc: Adhoc,
  userId: string
): Promise<void> {
  try {
    const docRef = doc(db, accountsCollectionId, userId, adhocsCollectionId, id);
    const snapshot = await getDoc(docRef.withConverter(adhocConverter));

    if (snapshot.exists()) {
      await setDoc(docRef, adhoc, { merge: true });
    } else {
      const collectionRef = collection(db, accountsCollectionId, userId, adhocsCollectionId);
      await addDoc(collectionRef.withConverter(adhocConverter), adhoc);
    }
  } catch (error) {
    console.error("Error saving Adhoc to remote Firestore: ", error);
    throw new Error("Encountered an error when updating Adhoc data.");
  }
}

/**
 * Retrieve an adhoc data instance from remote database.
 * @param id The adhoc document id.
 * @param userId User UID.
 * @returns
 */
export async function getAdhoc(id: string, userId: string): Promise<Adhoc | null> {
  try {
    const docRef = doc(db, accountsCollectionId, userId, adhocsCollectionId, id);
    const snapshot = await getDoc(docRef.withConverter(adhocConverter));
    if (!snapshot.exists()) return null;
    else return snapshot.data();
  } catch (error: any) {
    console.error("Error getting adhoc from remote Firestore: ", error);
    throw new Error("Encountered an error when retrieving adhoc data.");
  }
}

/**
 * Retrieve all adhocs of a user from remote database.
 * @param userId User UID.
 * @returns
 */
export async function getAllAdhocs(userId: string): Promise<Map<string, Adhoc>> {
  try {
    const collectionRef = collection(db, accountsCollectionId, userId, adhocsCollectionId);
    const querySnapshot = await getDocs(collectionRef.withConverter(adhocConverter));
    const adhocs: Map<string, Adhoc> = querySnapshot.empty
      ? new Map()
      : new Map(querySnapshot.docs.map((doc) => [doc.id, doc.data()]));
    return adhocs;
  } catch (error: any) {
    console.error("Error getting adhocs from remote Firestore: ", error);
    throw new Error("Encountered an error when retrieving all adhoc data.");
  }
}

/**
 * Delete the specified adhoc data from remote database.
 * @param id The adhoc document id.
 * @param userId User UID.
 */
export async function deleteAdhoc(id: string, userId: string): Promise<void> {
  try {
    const docRef = doc(db, accountsCollectionId, userId, adhocsCollectionId, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting adhoc from remote Firestore: ", error);
    throw new Error("Encountered an error when deleting adhoc data.");
  }
}

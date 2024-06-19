import { db } from "@services/firebaseConfig";
import { DocumentReference, doc, getDoc, setDoc } from "firebase/firestore";
import { Account, accountConverter } from "@api/types/Account";

const accountsCollectionId: string = "Accounts";

/**
 * Save account data to remote database.
 * @param account The account data instance to save.
 * @returns
 */
export async function saveAccount(account: Account): Promise<void> {
  try {
    const docRef = doc(db, accountsCollectionId, account.userId);
    await setDoc(docRef.withConverter(accountConverter), account, { merge: true });
  } catch (error) {
    console.error("Error saving Account to remote Firestore: ", error);
    throw new Error("Encountered an error when saving Account data.");
  }
}

/**
 * Retrieve account data from remote database.
 * @param userId Unique user identifier, same as User UID from Firebase Authentication.
 * @returns
 */
export async function getAccount(userId: string): Promise<Account | null> {
  try {
    const docRef: DocumentReference = doc(db, accountsCollectionId, userId);
    const snapshot = await getDoc(docRef.withConverter(accountConverter));
    if (!snapshot.exists()) return null;
    return snapshot.data();
  } catch (error) {
    console.error("Error getting Account from remote Firestore: ", error);
    throw new Error("Encountered an error when retrieving Account data.");
  }
}

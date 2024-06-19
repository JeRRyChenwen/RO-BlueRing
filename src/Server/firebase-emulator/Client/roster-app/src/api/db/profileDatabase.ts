import { db } from "@services/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Profile, profileConverter } from "@api/types/Profile";

const accountsCollectionId: string = "Accounts";
const profilesCollectionId: string = "Profiles";
const defaultProfileId: string = "Default";

/**
 * Save profile data to remote database.
 * @param profile The profile data instance to save.
 * @returns
 */
export async function saveProfile(profile: Profile): Promise<void> {
  try {
    // Update existing profile document or create a profile document with pre-defined ID.
    const docRef = doc(
      db,
      accountsCollectionId,
      profile.userId,
      profilesCollectionId,
      defaultProfileId
    );
    await setDoc(docRef.withConverter(profileConverter), profile, { merge: true });
  } catch (error) {
    console.error("Error saving Profile to remote Firestore: ", error);
    throw new Error("Encountered an error when saving Profile data.");
  }
}

/**
 * Retrieve profile data from remote database.
 * @param userId Unique user identifier, same as User UID from Firebase Authentication.
 * @returns
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    const docRef = doc(db, accountsCollectionId, userId, profilesCollectionId, defaultProfileId);
    const snapshot = await getDoc(docRef.withConverter(profileConverter));
    if (!snapshot.exists()) return null;
    return snapshot.data();
  } catch (error) {
    console.error("Error getting Profile from remote Firestore: ", error);
    throw new Error("Encountered an error when retrieving Profile data.");
  }
}

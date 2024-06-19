import { db } from "@services/firebaseConfig";
import { DocumentData, DocumentSnapshot, SnapshotOptions, doc } from "firebase/firestore";

/**
 * User account data.
 */
export interface Account {
  userId: string;
  username: string | null;
  email: string | null;
}

/**
 * Converts {@link Account} to and from Firestore document format.
 */
export const accountConverter = {
  toFirestore: (user: Account) => {
    return {
      username: user.username,
      email: user.email,
    };
  },

  fromFirestore: (snapshot: DocumentSnapshot, options?: SnapshotOptions) => {
    if (!snapshot.exists()) return null;
    const data: DocumentData = snapshot.data(options);
    return {
      userId: snapshot.id,
      username: data.username,
      email: data.email,
    };
  },
};

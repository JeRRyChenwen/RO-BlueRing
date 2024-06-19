import { DocumentData, DocumentSnapshot, SnapshotOptions, doc } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";

/**
 * User profile data.
 */
export interface Profile {
  userId: string;
  firstName: string;
  lastName: string;
  gender: "Male" | "Female" | "Other" | "Prefer not to say";
  birthday: Date;
  contactPhone: string;
  contactEmail: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postcode: string;
}

/**
 * Converts {@link Profile} to and from Firestore document format.
 */
export const profileConverter = {
  toFirestore: (profile: Profile) => {
    return {
      userId: profile.userId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      gender: profile.gender,
      birthday: Timestamp.fromDate(profile.birthday),
      contactPhone: profile.contactPhone,
      contactEmail: profile.contactEmail,
      addressLine1: profile.addressLine1,
      addressLine2: profile.addressLine2,
      city: profile.city,
      state: profile.state,
      postcode: profile.postcode,
    };
  },

  fromFirestore: (snapshot: DocumentSnapshot, options?: SnapshotOptions) => {
    if (!snapshot.exists()) return null;
    const data: DocumentData = snapshot.data(options);
    return {
      userId: data.userId,
      firstName: data.firstName,
      lastName: data.lastName,
      gender: data.gender,
      birthday: data.birthday.toDate(),
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      city: data.city,
      state: data.state,
      postcode: data.postcode,
    };
  },
};

import { DocumentData, DocumentSnapshot, SnapshotOptions } from "firebase/firestore";
import currency from "currency.js";
import { getAUDCurrency } from "@functions/util/currencyUtil";

export interface Workplace {
  name: string;
  abn: string;
  address: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  frequency: "Day" | "Hour";
  standardRate: currency;
  overtimeRate: currency;
}

/**
 * Converts {@link Workplace} to and from Firestore document format.
 */
export const workplaceConverter = {
  toFirestore: (workplace: Workplace) => {
    return {
      name: workplace.name,
      abn: workplace.abn,
      address: workplace.address,
      contactName: workplace.contactName,
      contactPhone: workplace.contactPhone,
      contactEmail: workplace.contactEmail,
      frequency: workplace.frequency,
      standardRate: workplace.standardRate.value,
      overtimeRate: workplace.overtimeRate.value,
    };
  },

  fromFirestore: (snapshot: DocumentSnapshot, options?: SnapshotOptions) => {
    if (!snapshot.exists()) return null;
    const data: DocumentData = snapshot.data(options);
    return {
      name: data.name,
      abn: data.abn,
      address: data.address,
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail,
      frequency: data.frequency,
      standardRate: getAUDCurrency(data.standardRate),
      overtimeRate: getAUDCurrency(data.overtimeRate),
    };
  },
};

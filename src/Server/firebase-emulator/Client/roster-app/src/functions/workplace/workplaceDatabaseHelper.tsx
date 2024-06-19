// firestoreService.ts
import { db } from "@services/firebaseConfig";
import { collection, doc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { getAuth} from 'firebase/auth';

const auth = getAuth();
let uid = "annonymous";
// Set up an observer to listen for changes in the user's sign-in state
auth.onAuthStateChanged(user => {
  if (user) {
    console.log("User is signed in with UID: " + user.uid);
    uid = user.uid;
  } else {
    console.log("User is signed out");
    uid = "annonymous";
  }
});

export const saveData = async (id: string | undefined, data: any) => {
  const collectionId = "User";
  const docId = uid;
  const detailCollection = collection(db, collectionId, docId, "Workplace");

  if (id) {
    const detailDocRef = doc(detailCollection, id);
    await updateDoc(detailDocRef, data);
  } else {
    const allDocs = await getDocs(detailCollection);
    const docCount = allDocs.size;
    const newDocName = "workplace" + (docCount + 1);
    const detailDocRef = doc(detailCollection, newDocName);
    await setDoc(detailDocRef, data);
  }
};

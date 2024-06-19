import Constants from "expo-constants";
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import {
  initializeFirestore,
  connectFirestoreEmulator,
} from "firebase/firestore";

// Define firebase config.
const config = {
  apiKey: "AIzaSyCCUKIqE-CvRQy6-EQUqUO68IbZCaHdehQ",
  authDomain: "roster-app-2023.firebaseapp.com",
  databaseURL: "https://roster-app-2023.firebaseio.com",
  projectId: "roster-app-2023",
  storageBucket: "roster-app-2023.appspot.com",
  messagingSenderId: "253674141233",
  appId: "1:253674141233:web:aa946bdc9c397c0cd70710",
  measurementId: "G-8WTBH9TMMJ",
};

const firebaseApp = initializeApp(config);

export const auth = getAuth(firebaseApp);
export const db = initializeFirestore(firebaseApp, {
  experimentalAutoDetectLongPolling: true,
});

// Use emulator for development.
// if (__DEV__) {
//   console.log("Using Firebase Local Emulator.");
//   const origin =
//     Constants.expoGoConfig.debuggerHost.split(":").shift() || "localhost";
//   console.log("Origin: " + origin);
//   connectAuthEmulator(auth, `http://${origin}:9099/`);
//   connectFirestoreEmulator(db, origin, 8080);
// }

// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase

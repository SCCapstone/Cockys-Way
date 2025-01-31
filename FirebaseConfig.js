// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";

import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Import api key from .env
import { FIREBASE_API_KEY } from "@env";
console.log(FIREBASE_API_KEY);
const firebaseAPIKey = FIREBASE_API_KEY;

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: firebaseAPIKey,
  authDomain: "cockys-way.firebaseapp.com",
  projectId: "cockys-way",
  storageBucket: "cockys-way.firebasestorage.app",
  messagingSenderId: "442624456122",
  appId: "1:442624456122:web:ae63c2f49cef8465505983",
};

// Initialize Firebase
let FIREBASE_APP;
let FIREBASE_AUTH;
let FIRESTORE_DB;

console.log(FIREBASE_API_KEY)

if (!getApps().length) {
  FIREBASE_APP = initializeApp(firebaseConfig);
  FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
  FIRESTORE_DB = getFirestore(FIREBASE_APP);
} else {
  FIREBASE_APP = getApp();
  FIREBASE_AUTH = getAuth(FIREBASE_APP);
  FIRESTORE_DB = getFirestore(FIREBASE_APP);
}

export { FIREBASE_APP, FIREBASE_AUTH, FIRESTORE_DB };

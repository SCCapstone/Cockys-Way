import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Initialize Firebase with your config
const firebaseConfig = {

    apiKey: "AIzaSyCrpMYZVQU0LCp-9B7sJrqptoSNpDzPCTk",
  
    authDomain: "fir-cyberneticmedic-f43cb.firebaseapp.com",
  
    databaseURL: "https://fir-cyberneticmedic-f43cb-default-rtdb.firebaseio.com",
  
    projectId: "fir-cyberneticmedic-f43cb",
  
    storageBucket: "fir-cyberneticmedic-f43cb.appspot.com",
  
    messagingSenderId: "836822441408",
  
    appId: "1:836822441408:web:64c5ab9889f5fa3429bc25",
  
    measurementId: "G-QVVK5XLHZ9"
  
  };
  


export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIRESTORE_DB = getFirestore(FIREBASE_APP);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
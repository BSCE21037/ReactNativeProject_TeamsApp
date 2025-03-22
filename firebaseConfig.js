// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyADWP32G1Jsen2KvKRzfkT6S4YY3Axy7m4",
  authDomain: "teamsapp-f1843.firebaseapp.com",
  projectId: "teamsapp-f1843",
  storageBucket: "teamsapp-f1843.firebasestorage.app",
  messagingSenderId: "767932722295",
  appId: "1:767932722295:web:fe10f759e22f679acd6a72",
  measurementId: "G-QZVTPDP5FC"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const WEB_CLIENT_ID = "558712774898-nute4p6vg3l8l8gltfi1nv8b1eo9o6kh.apps.googleusercontent.com";

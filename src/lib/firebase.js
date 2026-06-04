import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB1KrrOiLWdAoiZ7PvnUH8c-GT-KaJ5ecc",
  authDomain: "shramsaathi-090126.firebaseapp.com",
  projectId: "shramsaathi-090126",
  storageBucket: "shramsaathi-090126.firebasestorage.app",
  messagingSenderId: "1088293132290",
  appId: "1:1088293132290:web:ec31b980f5f22f468eef1b"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, doc, Firestore, getDocs, getFirestore, query, serverTimestamp, where, writeBatch } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDOsvD5qrDTGqOvG8HGBhR8qnPwrmXT9W8",
  authDomain: "seco-9b368.firebaseapp.com",
  projectId: "seco-9b368",
  storageBucket: "seco-9b368.appspot.com",
  messagingSenderId: "331979530251",
  appId: "1:331979530251:web:5e0c99e7dc29044b96670e"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Get Firestore, Storage, and Auth
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
const firestore=Firestore;

// Export instances
export { addDoc, auth, collection, db, doc, firestore, getAuth, getDocs, query, serverTimestamp, storage, where, writeBatch };


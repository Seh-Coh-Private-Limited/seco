// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';


const firebaseConfig = {
    apiKey: "AIzaSyDOsvD5qrDTGqOvG8HGBhR8qnPwrmXT9W8",
    authDomain: "seco-9b368.firebaseapp.com",
    projectId: "seco-9b368",
    storageBucket: "seco-9b368.appspot.com",
    messagingSenderId: "331979530251",
    appId: "1:331979530251:web:5e0c99e7dc29044b96670e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db,storage };

// firebaseService.js
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase'; // Firebase initialization

export const publishResponses = async (answers) => {
  try {
    const docRef = await addDoc(collection(db, 'startups    '), answers);
    console.log('Response written with ID:', docRef.id);
    return docRef.id; // Return the response ID for reference
  } catch (error) {
    console.error('Error adding document: ', error);
    return null;
  }
};

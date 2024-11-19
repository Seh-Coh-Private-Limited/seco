// fetchProgram.js
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust path based on your project structure

export const ffetchProgramById = async (programId) => {
  try {
    const programsCollection = collection(db, 'programmes');

    // Create a query to filter based on the `id` field
    const q = query(programsCollection, where('id', '==', programId));

    const programsSnapshot = await getDocs(q);
    const programsList = programsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return programsList.length > 0 ? programsList[0] : null; // Return the first matching program or null
  } catch (error) {
    console.error('Error fetching program by id:', error);
    return null; // Return null if fetch fails
  }
};

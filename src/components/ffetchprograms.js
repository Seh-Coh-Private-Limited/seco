import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust path based on your project structure

export const fetchPrograms = async () => {
  try {
    const programsCollection = collection(db, 'programmes');
    const programsQuery = query(programsCollection, where('programStatus', 'not-in', ['draft', 'ddraft']));
    const programsSnapshot = await getDocs(programsQuery);
    const programsList = programsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return programsList;
  } catch (error) {
    console.error('Error fetching programs:', error);
    return []; // Return an empty array if the fetch fails
  }
};


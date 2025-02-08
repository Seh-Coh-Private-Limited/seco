import { db } from '../firebase'; // Adjust the import path
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc } from 'firebase/firestore';

const FFormResponses = ({ programId, userId, isTabActive }) => {
  const [formResponses, setFormResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (isTabActive && !hasLoaded) {
      const fetchFormResponses = async () => {
        try {
          setLoading(true);

          // Step 1: Find the document where id === programId
          const programmesRef = collection(db, 'programmes');
          const programmesQuery = query(programmesRef, where('id', '==', programId));
          const programmesSnapshot = await getDocs(programmesQuery);

          if (programmesSnapshot.empty) {
            throw new Error('Program not found.');
          }

          // Assuming 'id' is unique, take the first matching document
          const programmeDoc = programmesSnapshot.docs[0];
          const programmeDocId = programmeDoc.id; // Firestore document ID

          // Step 2: Fetch formResponses subcollection inside the found programme document
          const formResponsesRef = collection(db, 'programmes', programmeDocId, 'formResponses');
          const formResponsesQuery = query(formResponsesRef, where('uid', '==', userId));
          const formResponsesSnapshot = await getDocs(formResponsesQuery);

          const responses = formResponsesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }));

          setFormResponses(responses);
          setHasLoaded(true);
        } catch (err) {
          setError(err.message || 'Failed to fetch form responses');
          console.error('Error fetching form responses:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchFormResponses();
    }
  }, [programId, userId, isTabActive, hasLoaded]);

  if (!isTabActive) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        {error}
      </div>
    );
  }

  if (formResponses.length === 0) {
    return (
      <div className="p-4">
        No form responses found for this program.
      </div>
    );
  }

  return (
    <div className="p-4">
      {formResponses.map((response) => (
        <div key={response.id} className="mb-4 border p-4 rounded">
          <h3 className="font-bold mb-2">Response ID: {response.id}</h3>
          <div>
            {Object.entries(response)
              .filter(([key]) => !['id', 'uid'].includes(key))
              .map(([key, value]) => (
                <div key={key} className="mb-2">
                  <span className="font-medium">{key}: </span>
                  <span>{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FFormResponses;

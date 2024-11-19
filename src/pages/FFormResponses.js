import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Adjust the import path
import { 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { 
  File, 
  ClipboardList, 
  Clock, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp,
  Award
} from 'lucide-react';

const Logo = () => (
  <div className="flex items-center mb-6">
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      className="w-12 h-12 mr-3"
    >
      <circle cx="50" cy="50" r="45" fill="#3B82F6" />
      <path 
        d="M30 50 L45 65 L70 35" 
        stroke="white" 
        strokeWidth="6" 
        fill="none" 
        strokeLinecap="round"
      />
    </svg>
    <h1 className="text-2xl font-bold text-gray-800">Form Responses</h1>
  </div>
);

const FFormResponses = ({ programId, userId }) => {
  const [formResponses, setFormResponses] = useState([]);
  const [programDetails, setProgramDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedResponse, setExpandedResponse] = useState(null);

  useEffect(() => {
    const fetchFormResponses = async () => {
      try {
        // Reset state
        setLoading(true);
        setError(null);

        // Query the `programmes` collection to find the program with the matching `id` field
        const programmesRef = collection(db, 'programmes');
        const programmeQuery = query(programmesRef, where('id', '==', programId));
        const programmeSnapshot = await getDocs(programmeQuery);

        if (!programmeSnapshot.empty) {
          const programmeDoc = programmeSnapshot.docs[0]; // Assuming `id` is unique
          const programData = programmeDoc.data();

          // Save program details
          setProgramDetails({
            title: programData.title,
            endDate: programData.endDate,
            id: programId,
          });

          // Query the `formResponses` subcollection within the found program document
          const formResponsesRef = collection(
            db,
            'programmes',
            programmeDoc.id,
            'formResponses'
          );

          const formResponsesQuery = query(formResponsesRef, where('uid', '==', userId));
          const formResponsesSnapshot = await getDocs(formResponsesQuery);

          const responses = formResponsesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setFormResponses(responses);
        } else {
          setError('Program not found');
        }
      } catch (err) {
        console.error('Error fetching form responses:', err);
        setError('Failed to fetch form responses');
      } finally {
        setLoading(false);
      }
    };

    if (programId && userId) {
      fetchFormResponses();
    }
  }, [programId, userId]);

  // Determine status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Extract score fields
  const getScoreFields = (response) => {
    return Object.entries(response)
      .filter(([key]) => key.endsWith('Score') && key !== 'uid')
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});
  };

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading responses...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex flex-col justify-center items-center p-4">
        <div className="bg-white shadow-md rounded-lg p-6 max-w-md w-full">
          <div className="flex items-center mb-4">
            <AlertCircle className="text-red-500 mr-3 w-10 h-10" />
            <h2 className="text-xl font-semibold text-red-700">Error</h2>
          </div>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  // Render if no responses found
  if (formResponses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
        <div className="bg-white shadow-md rounded-lg p-6 max-w-md w-full text-center">
          <ClipboardList className="mx-auto w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-600">No form responses found for this program.</p>
        </div>
      </div>
    );
  }

  // Render responses
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <Logo />

        {programDetails && (
          <div className="mb-6 bg-blue-50 p-4 rounded-md">
            <div className="flex items-center mb-2">
              <File className="mr-3 text-blue-600" />
              <h2 className="text-xl font-semibold text-blue-800">
                {programDetails.title}
              </h2>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="mr-3 text-gray-500" />
              <p>
                Program ID: {programDetails.id}
                {programDetails.endDate &&
                  ` | End Date: ${new Date(
                    programDetails.endDate.seconds * 1000
                  ).toLocaleDateString()}`}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {formResponses.map((response, index) => {
            const scoreFields = getScoreFields(response);
            const isExpanded = expandedResponse === index;

            return (
              <div
                key={response.id}
                className={`
                  bg-white shadow rounded-lg overflow-hidden
                  border-l-4 ${isExpanded ? 'border-blue-500' : 'border-gray-200'}
                `}
              >
                {/* Status and Expand Section */}
                <div 
                  className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedResponse(isExpanded ? null : index)}
                >
                  <div className="flex items-center">
                    <h3 className="text-lg font-medium flex items-center">
                      Response {index + 1}
                    </h3>

                    {/* Status Chip */}
                    {response.status && (
                      <div className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(response.status)}`}>
                        {response.status}
                      </div>
                    )}
                  </div>

                  {/* Expand/Collapse Toggle */}
                  {(Object.keys(scoreFields).length > 0 || Object.keys(response).length > 2) && (
                    <div className="flex items-center">
                      {isExpanded ? <ChevronUp className="text-gray-500" /> : <ChevronDown className="text-gray-500" />}
                    </div>
                  )}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="p-4 bg-gray-50 border-t">
                    {/* Scores Section */}
                    {Object.keys(scoreFields).length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center mb-3">
                          <Award className="mr-3 text-blue-600" />
                          <h4 className="text-lg font-semibold text-blue-800">Scores</h4>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          {Object.entries(scoreFields).map(([key, value]) => (
                            <div 
                              key={key} 
                              className="bg-white p-3 rounded-lg shadow-sm"
                            >
                              <div className="text-sm font-medium text-gray-600 mb-1">
                                {key.replace('Score', '').charAt(0).toUpperCase() + 
                                 key.replace('Score', '').slice(1)}
                              </div>
                              <div className="text-xl font-bold text-blue-800">
                                {value}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Additional Fields */}
                    <div>
                      {Object.entries(response)
                        .filter(([key]) => 
                          key !== 'uid' && 
                          !key.endsWith('Score') && 
                          key !== 'status'
                        )
                        .map(([key, value]) => (
                          <div key={key} className="mb-3 pb-3 border-b last:border-b-0">
                            <span className="block text-gray-600 font-semibold mb-1">
                              {key.charAt(0).toUpperCase() + key.slice(1)}
                            </span>
                            <span className="text-gray-800">
                              {typeof value === 'object' 
                                ? JSON.stringify(value, null, 2) 
                                : value}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FFormResponses;
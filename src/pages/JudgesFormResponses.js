import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faGripVertical ,faPenToSquare,faTimes} from '@fortawesome/free-solid-svg-icons';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db,doc,updateDoc ,getDoc } from '../firebase';
import { Building2, Info, MapPin, Mail, Image, User, Phone, Share2,Link,MessageCircle } from 'lucide-react';

const JudgesFormResponses = ({ programId, loading = false }) => {
  const [responses, setResponses] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [columns, setColumns] = useState([]);
  const [companyFilter, setCompanyFilter] = useState('');
  const [columnWidths, setColumnWidths] = useState({});
  const [isResizing, setIsResizing] = useState(false);
  const [judges, setJudges] = useState([]);
  const [saveButtonText, setSaveButtonText] = useState('Save Scores');
  const [selectedItems, setSelectedItems] = useState([]); // Added missing state
  const [programDocId, setProgramDocId] = useState(null); // Add this new state
  const [activeTab, setActiveTab] = useState('companyInfo');
  const [remarks, setRemarks] = useState({});
    const [scores, setScores] = useState({
    'Team':0,
    'Market Potential': 0,
    'Competition':0,
    'Differentiation':0,
    'Metrics':0,
    'Exit Potential':0,
    
  });
  const [selectedJudges, setSelectedJudges] = useState({});
  const [currentJudgeId, setCurrentJudgeId] = useState(null);

  const [visibleRemarks, setVisibleRemarks] = useState({});

  const toggleRemarkVisibility = (category) => {
    setVisibleRemarks(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  const resizingRef = useRef(null);
  const startXRef = useRef(null);
  const columnRef = useRef(null);
  const initialWidthRef = useRef(null);
  const tableRef = useRef(null);
  const containerRef = useRef(null);
  
  // Fixed fields that we want to display in the table
  const fixedFields = [
    'companyName',
    'email',
    'mobile',
    'category',
    'website',
   
  ];
  

// Handle judge assignment
const handleJudgeAssignment = async (responseId, judgeId, action) => {
  try {
    if (!programId) {
      console.error('Program ID not available');
      return;
    }

    // Get program document
    const programQuery = query(
      collection(db, 'programmes'),
      where('id', '==', programId)
    );
    const programSnapshot = await getDocs(programQuery);

    if (programSnapshot.empty) {
      console.error('No program found with the provided ID');
      return;
    }

    const programDoc = programSnapshot.docs[0];
    const responseRef = doc(db, 'programmes', programDoc.id, 'formResponses', responseId);
    const responseDoc = await getDoc(responseRef);

    if (!responseDoc.exists()) {
      console.error('Response document not found');
      return;
    }

    // Get current assigned judges array
    const currentJudges = responseDoc.data().startupData?.assignedJudges || [];

    let updatedJudges;
    if (action === 'add') {
      // Add new judge if not already assigned
      updatedJudges = [...new Set([...currentJudges, judgeId])];
    } else if (action === 'remove') {
      // Remove judge
      updatedJudges = currentJudges.filter(id => id !== judgeId);
    }

    // Update the response document with new judges array
    await updateDoc(responseRef, {
      'startupData.assignedJudges': updatedJudges
    });

    // Handle judge updates in both collections
    if (action === 'add') {
      // Update in programme's judges collection
      const programJudgeRef = doc(db, 'programmes', programDoc.id, 'judges', judgeId);
      const programJudgeDoc = await getDoc(programJudgeRef);

      if (programJudgeDoc.exists()) {
        const currentProgramApplicants = programJudgeDoc.data().applicants || [];
        if (!currentProgramApplicants.includes(responseId)) {
          await updateDoc(programJudgeRef, {
            applicants: [...currentProgramApplicants, responseId]
          });
        }
      }

      // Update in main judges collection
      const mainJudgeRef = doc(db, 'judges', judgeId);
      const mainJudgeDoc = await getDoc(mainJudgeRef);

      if (mainJudgeDoc.exists()) {
        const currentMainApplicants = mainJudgeDoc.data().applicants || [];
        if (!currentMainApplicants.includes(responseId)) {
          await updateDoc(mainJudgeRef, {
            applicants: [...currentMainApplicants, responseId]
          });
        }
      }
    } else if (action === 'remove') {
      // Remove from programme's judges collection
      const programJudgeRef = doc(db, 'programmes', programDoc.id, 'judges', judgeId);
      const programJudgeDoc = await getDoc(programJudgeRef);

      if (programJudgeDoc.exists()) {
        const currentProgramApplicants = programJudgeDoc.data().applicants || [];
        const updatedProgramApplicants = currentProgramApplicants.filter(id => id !== responseId);
        await updateDoc(programJudgeRef, {
          applicants: updatedProgramApplicants
        });
      }

      // Remove from main judges collection
      const mainJudgeRef = doc(db, 'judges', judgeId);
      const mainJudgeDoc = await getDoc(mainJudgeRef);

      if (mainJudgeDoc.exists()) {
        const currentMainApplicants = mainJudgeDoc.data().applicants || [];
        const updatedMainApplicants = currentMainApplicants.filter(id => id !== responseId);
        await updateDoc(mainJudgeRef, {
          applicants: updatedMainApplicants
        });
      }
    }

    // Update local state
    setResponses(prev => prev.map(response => {
      if (response.id === responseId) {
        return {
          ...response,
          startupData: {
            ...response.startupData,
            assignedJudges: updatedJudges
          }
        };
      }
      return response;
    }));

  } catch (error) {
    console.error('Error managing judge assignments:', error);
  }
};




const handleSaveScores = async () => {
  try {
    if (!programId || !selectedRow || !currentJudgeId) return;

    // Set button text to "Saving"
    setSaveButtonText('Saving');

    const programQuery = query(collection(db, 'programmes'), where('id', '==', programId));
    const programSnapshot = await getDocs(programQuery);
    if (programSnapshot.empty) return;
    const programDocId = programSnapshot.docs[0].id;

    const responseRef = doc(db, 'programmes', programDocId, 'formResponses', selectedRow.id);
    
    // Update Firestore
    await updateDoc(responseRef, {
      [`startupData.judgeScores.${currentJudgeId}`]: scores,
      [`startupData.judgeRemarks.${currentJudgeId}`]: remarks
    });

    // Update local state
    setResponses(prev => prev.map(response => 
      response.id === selectedRow.id ? {
        ...response,
        startupData: {
          ...response.startupData,
          judgeScores: {
            ...response.startupData.judgeScores,
            [currentJudgeId]: scores
          },
          judgeRemarks: {
            ...response.startupData.judgeRemarks,
            [currentJudgeId]: remarks
          }
        }
      } : response
    ));

    // Set button text to "Saved" after successful save
    setSaveButtonText('Saved');

    // Reset back to "Save Scores" after 2 seconds
    setTimeout(() => {
      setSaveButtonText('Save Scores');
    }, 2000);

  } catch (error) {
    console.error('Error saving scores:', error);
    // Reset to "Save Scores" on error
    setSaveButtonText('Save Scores');
  }
};

// Handle status change
const handleStatusChange = async (responseId, newStatus) => {
  try {
    if (!programId) {
      console.error('Program ID not available');
      return;
    }

    console.log('Updating status:', {
      programId,
      responseId,
      newStatus
    });

    // First, query for the program document
    const programQuery = query(
      collection(db, 'programmes'),
      where('id', '==', programId)
    );
    const programSnapshot = await getDocs(programQuery);

    if (programSnapshot.empty) {
      console.error('No program found with the provided ID');
      return;
    }

    const programDoc = programSnapshot.docs[0];
    const responseRef = doc(db, 'programmes', programDoc.id, 'formResponses', responseId);

    await updateDoc(responseRef, {
      'startupData.status': newStatus
    });

    // Update local state
    setResponses(prev => prev.map(response => {
      if (response.id === responseId) {
        return {
          ...response,
          startupData: {
            ...response.startupData,
            status: newStatus
          }
        };
      }
      return response;
    }));
  } catch (error) {
    console.error('Error updating status:', error);
  }
};
  const defaultColumnWidth = 200;

  const handleScoreChange = (category, score) => {
    setScores(prev => ({
      ...prev,
      [category]: score
    }));
  };
  
  const handleRemarkChange = (category, value) => {
    setRemarks(prev => ({
      ...prev,
      [category]: value
    }));
  };
  // Initialize column widths only for fixed fields
  const initializeColumnsAndWidths = () => {
    const initialWidths = {};

    // Add fixed fields
    fixedFields.forEach(field => {
      initialWidths[field] = defaultColumnWidth;
    });

    // Add status and actions columns
    initialWidths['status'] = defaultColumnWidth;
    initialWidths['actions'] = defaultColumnWidth;

    setColumnWidths(initialWidths);
    setColumns(fixedFields);
  };

  useEffect(() => {
    if (selectedRow && currentJudgeId) {
      const judgeScores = selectedRow.startupData?.judgeScores?.[currentJudgeId] || {
        'Team': 0,
        'Market Potential': 0,
        'Competition': 0,
        'Differentiation': 0,
        'Metrics': 0,
        'Exit Potential': 0,
      };
      
      const judgeRemarks = selectedRow.startupData?.judgeRemarks?.[currentJudgeId] || {};
  
      setScores(judgeScores);
      setRemarks(judgeRemarks);
    }
  }, [selectedRow, currentJudgeId]);

  const handleResizeStart = (e, column) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    startXRef.current = e.clientX;
    columnRef.current = column;
    initialWidthRef.current = columnWidths[column];
    
    document.body.classList.add('cursor-col-resize', 'select-none');
  };

  const handleResizeMove = (e) => {
    if (!isResizing || !columnRef.current) return;

    requestAnimationFrame(() => {
      const diffX = e.clientX - startXRef.current;
      const newWidth = Math.max(100, initialWidthRef.current + diffX);
      
      const containerWidth = containerRef.current?.offsetWidth || 1200;
      const maxWidth = Math.min(containerWidth * 0.8, 800);
      
      setColumnWidths(prev => ({
        ...prev,
        [columnRef.current]: Math.min(newWidth, maxWidth)
      }));
    });
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    columnRef.current = null;
    startXRef.current = null;
    initialWidthRef.current = null;
    
    document.body.classList.remove('cursor-col-resize', 'select-none');
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizing) {
        handleResizeMove(e);
      }
    };

    const handleMouseUp = () => {
      if (isResizing) {
        handleResizeEnd();
      }
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('selectstart', (e) => e.preventDefault());
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('selectstart', (e) => e.preventDefault());
    };
  }, [isResizing]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .resize-handle {
        position: absolute;
        right: -5px;
        top: 0;
        bottom: 0;
        width: 10px;
        cursor: col-resize;
        user-select: none;
        z-index: 1;
      }
      .resize-handle:hover,
      .resize-handle.active {
        background: rgba(0, 0, 0, 0.1);
      }
      .col-resizing * {
        cursor: col-resize !important;
        user-select: none !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleDetailedResponse = (row) => {
    setSelectedRow(row);
    setShowModal(true);
  };

  const formatValue = (item, field) => {
    if (!item.startupData) return '-';
  
    switch (field) {
      case 'mobile':
        // Access mobile from contacts array
        return item.startupData.contacts?.[0]?.mobile || '-';
        
      case 'website':
        // Access website from social map
        return item.startupData.social?.website || '-';
        
      default:
        // For all other fields, return the direct value from startupData
        return item.startupData[field] || '-';
    }
  };
  // const formatValue = (item, field) => {
  //   // Access startupData fields directly
  //   if (item.startupData && field in item.startupData) {
  //     return item.startupData[field] || '-';
  //   }
  //   return '-';
  // };

  const getDisplayName = (field) => {
    const displayNames = {
      companyName: 'Company Name',
      founderName: 'Founder Name',
      email: 'Email',
      mobile: 'Mobile',
      category: 'Category',
      about: 'About',
      address: 'Address',
      website: 'Website',
      socialMedia: 'Social Media'
    };
    return displayNames[field] || field;
  };

  useEffect(() => {
    const fetchResponses = async () => {
        if (!programId) {
          console.log("No programId provided");
          return;
        }
        
        try {
          setIsLoading(true);
          const user = auth.currentUser;
          if (!user) {
            console.log("No authenticated user");
            return;
          }
       
          // Find the judge document
          const judgesQuery = query(
            collection(db, 'judges'),
            where('email', '==', user.email)
          );
          const judgeSnapshot = await getDocs(judgesQuery);
       
          if (judgeSnapshot.empty) {
            console.log("No judge found for the current user");
            setResponses([]);
            return;
          }
       
          const judgeDoc = judgeSnapshot.docs[0];
          const judgeId = judgeDoc.id;
          setCurrentJudgeId(judgeId);
          const judgesProgramId = judgeDoc.data().programId;
       
          // Verify programme match
          const programmeQuery = query(
            collection(db, 'programmes'),
            where('id', '==', judgesProgramId)
          );
          const programmeSnapshot = await getDocs(programmeQuery);
       
          if (programmeSnapshot.empty) {
            console.error('No programme found for the judge');
            setResponses([]);
            return;
          }
       
          const programmeDoc = programmeSnapshot.docs[0];
       
          // Fetch form responses
          const formResponsesRef = collection(db, 'programmes', programmeDoc.id, 'formResponses');
          const querySnapshot = await getDocs(formResponsesRef);
       
          const fetchedResponses = querySnapshot.docs
            .filter(doc => {
              const startupData = doc.data().startupData || {};
              const assignedJudges = startupData.assignedJudges || [];
              return assignedJudges.includes(judgeId);
            })
            .map(doc => ({
              id: doc.id,
              responses: doc.data().responses || [],
              startupData: doc.data().startupData || {},
              submittedAt: doc.data().submittedAt,
            }));
       
          console.log("Filtered responses:", fetchedResponses);
          setResponses(fetchedResponses);
          initializeColumnsAndWidths();
       
        } catch (error) {
          console.error('Error fetching responses:', error);
          setResponses([]);
        } finally {
          setIsLoading(false);
        }
       };
    fetchResponses();
  }, [programId]);

  const filteredData = responses.filter((item) => {
    if (!companyFilter) return true;
    return item.startupData?.companyName?.toLowerCase().includes(companyFilter.toLowerCase());
  });

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Add missing handler for checkbox changes
  const handleCheckboxChange = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  // // Add missing handler for status changes
  // const handleStatusChange = async (responseId, newStatus) => {
  //   try {
  //     const responseRef = doc(db, 'programmes', programId, 'formResponses', responseId);
  //     await updateDoc(responseRef, {
  //       'startupData.status': newStatus
  //     });

  //     // Update local state
  //     setResponses(prev => prev.map(response => {
  //       if (response.id === responseId) {
  //         return {
  //           ...response,
  //           startupData: {
  //             ...response.startupData,
  //             status: newStatus
  //           }
  //         };
  //       }
  //       return response;
  //     }));
  //   } catch (error) {
  //     console.error('Error updating status:', error);
  //   }
  // };
// Modify the table row rendering to include judge assignment
const renderTableRow = (item) => (
  <tr key={item.id} className="hover:bg-gray-50">
    <td className="px-4 py-2 border border-gray-300 rounded-lg bg-white">
      <input
        type="checkbox"
        checked={selectedItems.includes(item.id)} // Add state management for selected items
        onChange={() => handleCheckboxChange(item.id)}
      />
    </td>
    {columns.map((column) => (
      <td
        key={column}
        className="px-4 py-2 border border-gray-300 rounded-lg overflow-hidden text-ellipsis"
        style={{
          width: columnWidths[column],
          maxWidth: columnWidths[column],
        }}
      >
        {column === 'assignedJudge' ? (
            <div className="flex flex-col space-y-2">
              {/* Display assigned judges with remove button */}
              <div className="flex flex-wrap gap-2">
                {(item.startupData?.assignedJudges || []).map(judgeId => {
                  const judge = judges.find(j => j.id === judgeId);
                  return judge ? (
                    <div key={judgeId} className="flex items-center bg-blue-100 px-2 py-1 rounded">
                      <span className="text-sm">{judge.name}</span>
                      <button
                        onClick={() => handleJudgeAssignment(item.id, judgeId, 'remove')}
                        className="ml-2 text-gray-500 hover:text-red-500"
                      >
                        <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                      </button>
                    </div>
                  ) : null;
                })}
              </div>
              
              {/* 
               dropdown */}
              <div className="flex items-center">
                <select
                  className="w-full px-2 py-1 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      handleJudgeAssignment(item.id, e.target.value, 'add');
                      e.target.value = ''; // Reset select after adding
                    }
                  }}
                >
                  <option value="">Add Judge</option>
                  {judges
                    .filter(judge => !(item.startupData?.assignedJudges || []).includes(judge.id))
                    .map((judge) => (
                      <option key={judge.id} value={judge.id}>
                        {judge.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="truncate">
            {formatValue(item, column)}
          </div>
          )}
      </td>
    ))}
    <td
      className="px-4 py-2 border border-gray-300 rounded-lg"
      style={{ width: columnWidths['status'] }}
    >
      <select
        value={item.startupData?.status || 'Pending'}
        onChange={(e) => handleStatusChange(item.id, e.target.value)}
        className="px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="Pending">Pending</option>
        <option value="Accepted">Accepted</option>
        <option value="Rejected">Rejected</option>
      </select>
    </td>
    <td
      className="px-4 py-2 border border-gray-300 rounded-lg"
      style={{ width: columnWidths['actions'] }}
    >
      <button
        onClick={() => handleDetailedResponse(item)}
        className="text-gray-600 hover:text-gray-800"
      >
        &#8230;
      </button>
    </td>
  </tr>
);
const handleBulkStatusChange = async (newStatus) => {
  if (!newStatus || selectedItems.length === 0 || !programId) {
    console.error('Missing required parameters for bulk status change');
    return;
  }

  try {
    // First, query for the program document
    const programQuery = query(
      collection(db, 'programmes'),
      where('id', '==', programId)
    );
    const programSnapshot = await getDocs(programQuery);

    if (programSnapshot.empty) {
      console.error('No program found with the provided ID');
      return;
    }

    const programDoc = programSnapshot.docs[0];

    // Process each selected response
    for (const responseId of selectedItems) {
      const responseRef = doc(db, 'programmes', programDoc.id, 'formResponses', responseId);
      
      // Update the status
      await updateDoc(responseRef, {
        'startupData.status': newStatus
      });

      // Update local state
      setResponses(prev => prev.map(response => {
        if (response.id === responseId) {
          return {
            ...response,
            startupData: {
              ...response.startupData,
              status: newStatus
            }
          };
        }
        return response;
      }));
    }
  } catch (error) {
    console.error('Error in bulk status change:', error);
  }
};

const getIcon = (key) => {
  const icons = {
    companyName: <Building2 size={16} className="text-white" />,
    bio: <Info size={16} className="text-white" />,
    cityState: <MapPin size={16} className="text-white" />,
    email: <Mail size={16} className="text-white" />,
    logoUrl: <Image size={16} className="text-white" />,
    contacts: <User size={16} className="text-white" />,
    social: <Share2 size={16} className="text-white" />
  };
  return icons[key] || <Info size={16} className="text-white" />;
};
  return (
    <div className="container mx-auto  py-6 my-8">
      <div className="flex justify-end mb-4">
        <input
          type="text"
          placeholder="Filter by company name..."
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
        />
        <div className="flex space-x-2">
    <select
      className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      onChange={(e) => handleBulkStatusChange(e.target.value)}
    >
      <option value="">Change Status</option>
      <option value="Pending">Pending</option>
      <option value="Accepted">Accepted</option>
      <option value="Rejected">Rejected</option>
    </select>
  </div>
      </div>


      <div className="overflow-x-auto rounded-xl border-l-4 border-[#F99F31]">
        <div className="min-w-[1200px]" ref={tableRef}>
          <table className="w-full border border-gray-300 rounded-lg">
            <thead>
              <tr>
              <th className="sticky top-0 bg-white px-4 py-2 text-left border border-gray-300 rounded-lg w-[50px]">
  <input
    type="checkbox"
    checked={selectedItems.length === filteredData.length}
    onChange={(e) => {
      if (e.target.checked) {
        setSelectedItems(filteredData.map(item => item.id));
      } else {
        setSelectedItems([]);
      }
    }}
  />
</th>
                {columns.map((column) => (
                  <th 
                    key={column}
                    className="sticky top-0 bg-white px-4 py-2 text-left border border-gray-300 rounded-lg relative group"
                    style={{ width: columnWidths[column] }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate pr-6">{getDisplayName(column)}</span>
                      <div
                        className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-gray-300 opacity-0 group-hover:opacity-100"
                        onMouseDown={(e) => handleResizeStart(e, column)}
                      >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 -translate-x-1/2">
                          <FontAwesomeIcon icon={faGripVertical} className="text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </th>
                ))}
                <th 
                  className="sticky top-0 bg-white px-4 py-2 text-left border border-gray-300 rounded-lg relative group"
                  style={{ width: columnWidths['status'] }}
                >
                  <div className="flex items-center justify-between">
                    <span>Status</span>
                    <div
                      className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-gray-300 opacity-0 group-hover:opacity-100"
                      onMouseDown={(e) => handleResizeStart(e, 'status')}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 -translate-x-1/2">
                        <FontAwesomeIcon icon={faGripVertical} className="text-gray-400" />
                      </div>
                    </div>
                  </div>
                </th>
                <th 
                  className="sticky top-0 bg-white px-4 py-2 text-left border border-gray-300 rounded-lg relative group"
                  style={{ width: columnWidths['actions'] }}
                >
                  <div className="flex items-center justify-between">
                    <span>Actions</span>
                    <div
                      className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-gray-300 opacity-0 group-hover:opacity-100"
                      onMouseDown={(e) => handleResizeStart(e, 'actions')}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 -translate-x-1/2">
                        <FontAwesomeIcon icon={faGripVertical} className="text-gray-400" />
                      </div>
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(item => renderTableRow(item))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && selectedRow && (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
    <div className="w-full max-w-6xl bg-white rounded-lg shadow-lg p-8 relative flex overflow-hidden max-h-[90vh]">
      {/* Close Button */}
      <button
        onClick={() => {
          setShowModal(false);
          setSelectedRow(null);
        }}
        className="absolute top-4 right-4 text-black px-4 py-2 rounded-full"
      >
        <FontAwesomeIcon icon={faClose} />
      </button>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Buttons */}
       

        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Content with Tabs */}
          <div className="w-2/3 flex flex-col overflow-auto">
            {/* Tabs */}
            <div className="flex max-w-4xl border-b   rounded-3xl">
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'companyInfo' 
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('companyInfo')}
              >
                Company Info
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'formResponses' 
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('formResponses')}
              >
                Form Responses
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-4 overflow-auto">
              {activeTab === 'companyInfo' ? (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Company Information</h3>
                  <>
  {/* Main startup data */}
  {Object.entries({
    companyName: selectedRow.startupData?.companyName || 'Not Available',
    bio: selectedRow.startupData?.bio || 'Not Available',
    cityState: selectedRow.startupData?.cityState || 'Not Available',
    email: selectedRow.startupData?.email || 'Not Available',
    logoUrl: selectedRow.startupData?.logoUrl || null
  }).map(([key, value]) => (
    <div key={key} className="flex items-start space-x-3 mb-4">
      <div className="bg-blue-500 p-2 rounded">
        {getIcon(key)}
      </div>
      <div className="flex-1">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="font-medium text-gray-800">{getDisplayName(key)}</div>
          {key === 'logoUrl' ? (
            value ? (
              <img src={value} alt="Logo" className="h-24 w-24 object-contain mt-2" />
            ) : (
              <div className="text-gray-400 mt-2">No logo available</div>
            )
          ) : (
            <div className={`${value === 'Not Available' ? 'text-gray-400' : 'text-gray-600'}`}>
              {value}
            </div>
          )}
        </div>
      </div>
    </div>
  ))}

  {/* Contacts section */}
  <div className="flex items-start space-x-3 mb-4">
    <div className="bg-blue-500 p-2 rounded">
      {getIcon('contacts')}
    </div>
    <div className="flex-1">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="font-medium text-gray-800">Contact Details</div>
        <div className="space-y-2 mt-2">
          {Object.entries({
            designation: selectedRow.startupData?.contacts?.[0]?.designation || 'Not Available',
            email: selectedRow.startupData?.contacts?.[0]?.email || 'Not Available',
            firstName: selectedRow.startupData?.contacts?.[0]?.firstName || 'Not Available',
            lastName: selectedRow.startupData?.contacts?.[0]?.lastName || 'Not Available',
            mobile: selectedRow.startupData?.contacts?.[0]?.mobile || 'Not Available'
          }).map(([key, value]) => (
            <div key={key} className={`${value === 'Not Available' ? 'text-gray-400' : 'text-gray-600'}`}>
              <span className="font-medium">{getDisplayName(key)}: </span>
              {value}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>

  {/* Social media section */}
  <div className="flex items-start space-x-3 mb-4">
    <div className="bg-blue-500 p-2 rounded">
      {getIcon('social')}
    </div>
    <div className="flex-1">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="font-medium text-gray-800">Social Media</div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {Object.entries({
            instagram: selectedRow.startupData?.social?.instagram || null,
            linkedin: selectedRow.startupData?.social?.linkedin || null,
            tiktok: selectedRow.startupData?.social?.tiktok || null,
            twitter: selectedRow.startupData?.social?.twitter || null,
            website: selectedRow.startupData?.social?.website || null,
            youtube: selectedRow.startupData?.social?.youtube || null
          }).map(([key, value]) => (
            <div key={key}>
              {value ? (
                <a 
                  href={
                    key === 'website' 
                      ? value 
                      : `https://${key}.com/${key === 'tiktok' ? '@' : ''}${value}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  {getDisplayName(key)}
                </a>
              ) : (
                <span className="text-gray-400">{getDisplayName(key)}: Not Available</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
</>
                </div>
              ) : (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Form Responses</h3>
                  {selectedRow.responses?.slice(1).map((response, index) => (
  <div key={index} className="flex items-start space-x-3 mb-4">
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded shadow-md">
      {response.answer.includes('https://') ? (
        <Link className="w-5 h-5 text-white" />
      ) : (
        <MessageCircle className="w-5 h-5 text-white" />
      )}
    </div>
    <div className="flex-1">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="font-medium text-gray-800">{response.question}</div>
        <div className="text-gray-600">
          {response.answer.includes('https://') ? (
            <div className="mt-2">
              <div 
                className="border rounded p-4 cursor-resize-v"
                style={{ 
                  height: '300px',
                  overflow: 'auto',
                  resize: 'vertical'
                }}
              >
                <iframe 
                  src={response.answer}
                  className="w-full h-full border-0"
                  title="URL Preview"
                />
              </div>
            </div>
          ) : (
            response.answer
          )}
        </div>
      </div>
    </div>
  </div>
))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Fixed Scoring */}
          <div className="w-1/3 border-l p-4 flex flex-col">
  <div className="space-y-6 sticky top-0 overflow-auto">
    <div className="space-y-4">
      {Object.keys(scores).map((category) => (
        <div key={category} className="space-y-1">
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium">{category}</div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Rationale</span>
              <button
                onClick={() => toggleRemarkVisibility(category)}
                className="text-blue-600 hover:text-blue-800 text-sm px-2 rounded-full hover:bg-gray-100 w-6 h-6 flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faPenToSquare} />
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((point) => (
              <button
                key={point}
                onClick={() => handleScoreChange(category, point)}
                className={`w-8 h-8 rounded ${
                  scores[category] >= point
                    ? 'bg-yellow-400 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {point}
              </button>
            ))}
          </div>
          {visibleRemarks[category] && (
            <div className="mt-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Remarks for {category}
              </label>
              <textarea
                value={remarks[category] || ''}
                onChange={(e) => handleRemarkChange(category, e.target.value)}
                className="w-full p-2 border rounded-md text-sm h-16 resize-none"
                placeholder={`Add remarks for ${category}...`}
              />
            </div>
          )}
        </div>
      ))}
     <button 
        className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        onClick={handleSaveScores}
      >
        {saveButtonText}
      </button>
    </div>
  </div>
</div>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default JudgesFormResponses;
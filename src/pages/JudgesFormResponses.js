import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faGripVertical, faPenToSquare, faTimes } from '@fortawesome/free-solid-svg-icons';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db, doc, updateDoc, getDoc } from '../firebase';
import { Building2, Info, MapPin, Mail, Image, User, Phone, Share2, Link, MessageCircle } from 'lucide-react';

const JudgesFormResponses = ({ programId, loading = false, email ,name}) => {
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
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeTab, setActiveTab] = useState('companyInfo');
  const [remarks, setRemarks] = useState({});
  const [scores, setScores] = useState({
    'Team': 0,
    'Market Potential': 0,
    'Competition': 0,
    'Differentiation': 0,
    'Metrics': 0,
    'Exit Potential': 0,
  });
  const [selectedJudges, setSelectedJudges] = useState({});
  const [currentJudgeId, setCurrentJudgeId] = useState(null);
  const [visibleRemarks, setVisibleRemarks] = useState({});
  const [judgeName, setJudgeName] = useState('');
  const [programName, setProgramName] = useState('');

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

  const fixedFields = ['startupName'];

  const calculateAvgScore = (startupData) => {
    const judgeScores = startupData?.judgeScores || {};
    const allScores = Object.values(judgeScores).flatMap(scores => 
      Object.values(scores).filter(score => typeof score === 'number')
    );
    
    if (allScores.length === 0) return 'N/A';
    const avg = allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
    return avg.toFixed(1);
  };

  const handleJudgeAssignment = async (responseId, judgeId, action) => {
    try {
      if (!programId) {
        console.error('Program ID not available');
        return;
      }

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

      const currentJudges = responseDoc.data().startupData?.assignedJudges || [];
      let updatedJudges;
      if (action === 'add') {
        updatedJudges = [...new Set([...currentJudges, judgeId])];
      } else if (action === 'remove') {
        updatedJudges = currentJudges.filter(id => id !== judgeId);
      }

      await updateDoc(responseRef, {
        'startupData.assignedJudges': updatedJudges
      });

      if (action === 'add') {
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
        const programJudgeRef = doc(db, 'programmes', programDoc.id, 'judges', judgeId);
        const programJudgeDoc = await getDoc(programJudgeRef);

        if (programJudgeDoc.exists()) {
          const currentProgramApplicants = programJudgeDoc.data().applicants || [];
          const updatedProgramApplicants = currentProgramApplicants.filter(id => id !== responseId);
          await updateDoc(programJudgeRef, {
            applicants: updatedProgramApplicants
          });
        }

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

      setSaveButtonText('Saving');

      const programQuery = query(collection(db, 'programmes'), where('id', '==', programId));
      const programSnapshot = await getDocs(programQuery);
      if (programSnapshot.empty) return;
      const programDocId = programSnapshot.docs[0].id;

      const responseRef = doc(db, 'programmes', programDocId, 'formResponses', selectedRow.id);
      
      await updateDoc(responseRef, {
        [`startupData.judgeScores.${currentJudgeId}`]: scores,
        [`startupData.judgeRemarks.${currentJudgeId}`]: remarks
      });

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

      setSaveButtonText('Saved');
      setTimeout(() => {
        setSaveButtonText('Save Scores');
      }, 2000);

    } catch (error) {
      console.error('Error saving scores:', error);
      setSaveButtonText('Save Scores');
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

  const initializeColumnsAndWidths = () => {
    const initialWidths = {
      startupName: 630,
      avgScore: 150,
      actions: 100
    };

    setColumnWidths(initialWidths);
    setColumns(['startupName', 'avgScore']);
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
    return item.startupData[field] || '-';
  };

  const getDisplayName = (field) => {
    const displayNames = {
      startupName: 'Startup Name',
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
    const fetchJudgeAndProgramDetails = async () => {
      try {
        const judgesQuery = query(
          collection(db, 'judges'),
          where('email', '==', email)
        );
        const judgeSnapshot = await getDocs(judgesQuery);
        
        if (!judgeSnapshot.empty) {
          const judgeDoc = judgeSnapshot.docs[0];
          setJudgeName(`${judgeDoc.data().firstName || ''} ${judgeDoc.data().lastName || ''}`.trim());
          setCurrentJudgeId(judgeDoc.id);

          const judgesProgramId = judgeDoc.data().programId;
          const programmeQuery = query(
            collection(db, 'programmes'),
            where('id', '==', judgesProgramId)
          );
          const programmeSnapshot = await getDocs(programmeQuery);
          
          if (!programmeSnapshot.empty) {
            setProgramName(programmeSnapshot.docs[0].data().name || 'Unnamed Program');
          }
        }
      } catch (error) {
        console.error('Error fetching judge/program details:', error);
      }
    };

    fetchJudgeAndProgramDetails();
  }, [email]);

  useEffect(() => {
    const fetchResponses = async () => {
      if (!programId) {
        console.log("No programId provided");
        return;
      }
      
      try {
        setIsLoading(true);
        const judgesQuery = query(
          collection(db, 'judges'),
          where('email', '==', email)
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
     
        const programmeQuery = query(
          collection(db, 'programmes'),
          where('id', '==', programId)
        );
        const programmeSnapshot = await getDocs(programmeQuery);
     
        if (programmeSnapshot.empty) {
          console.error('No programme found for the judge');
          setResponses([]);
          return;
        }
     
        const programmeDoc = programmeSnapshot.docs[0];
     
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

  const handleCheckboxChange = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const renderTableRow = (item) => (
    <tr key={item.id} className="hover:bg-gray-50">
      <td className="px-4 py-2 border border-gray-300 rounded-lg bg-white w-[30px]">
        <input
          type="checkbox"
          checked={selectedItems.includes(item.id)}
          onChange={() => handleCheckboxChange(item.id)}
        />
      </td>
      <td
        className="px-4 py-2 border border-gray-300 rounded-lg overflow-hidden text-ellipsis"
        style={{
          width: columnWidths['startupName'],
          maxWidth: columnWidths['startupName'],
        }}
      >
        {item.startupData?.companyName || '-'}
      </td>
      <td
        className="px-4 py-2 border border-gray-300 rounded-lg"
        style={{
          width: columnWidths['avgScore'],
          maxWidth: columnWidths['avgScore'],
        }}
      >
        {calculateAvgScore(item.startupData)}
      </td>
      <td
        className="px-4 py-2 border border-gray-300 rounded-lg"
        style={{ width: columnWidths['actions'] }}
      >
        <button
          onClick={() => handleDetailedResponse(item)}
          className="text-gray-600 hover:text-gray-800"
        >
          …
        </button>
      </td>
    </tr>
  );

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
    <div className="container mx-auto py-6 my-8">
      {/* <div className="mb-8 bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
        <h2 className="text-2xl font-bold text-gray-800">
          Hello {name || 'Judge'},
        </h2>
        <p className="mt-2 text-gray-600">
          You have been invited to the judging panel of{' '}
          <span className="font-semibold text-blue-600">{programName || 'this program'}</span>.
        </p>
        <p className="mt-1 text-gray-600">
          Below you'll find the list of startup applications assigned to you for review and scoring.
          Please evaluate each submission carefully and provide your scores and remarks.
        </p>
      </div> */}

      <div className="flex justify-end mb-4">
        <input
          type="text"
          placeholder="Filter by startup name..."
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-xl border-l-4 border-[#F99F31]">
        <div ref={tableRef}>
          <table className="w-full border border-gray-300 rounded-lg">
            <thead>
              <tr>
                <th className="sticky top-0 bg-white px-4 py-2 text-left border border-gray-300 rounded-lg w-[20px]">
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
                <th 
                  className="sticky top-0 bg-white px-4 py-2 text-left border border-gray-300 rounded-lg relative group"
                  style={{ width: columnWidths['startupName'] }}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate pr-6">Startup Name</span>
                    <div
                      className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-gray-300 opacity-0 group-hover:opacity-100"
                      onMouseDown={(e) => handleResizeStart(e, 'startupName')}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 -translate-x-1/2">
                        <FontAwesomeIcon icon={faGripVertical} className="text-gray-400" />
                      </div>
                    </div>
                  </div>
                </th>
                <th 
                  className="sticky top-0 bg-white px-4 py-2 text-left border border-gray-300 rounded-lg relative group"
                  style={{ width: columnWidths['avgScore'] }}
                >
                  <div className="flex items-center justify-between">
                    <span>Avg Score</span>
                    <div
                      className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-gray-300 opacity-0 group-hover:opacity-100"
                      onMouseDown={(e) => handleResizeStart(e, 'avgScore')}
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
            <button
              onClick={() => {
                setShowModal(false);
                setSelectedRow(null);
              }}
              className="absolute top-4 right-4 text-black px-4 py-2 rounded-full"
            >
              <FontAwesomeIcon icon={faClose} />
            </button>

            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex flex-1 overflow-hidden">
                <div className="w-2/3 flex flex-col overflow-auto">
                  <div className="flex max-w-4xl border-b rounded-3xl">
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

                  <div className="p-4 overflow-auto">
                    {activeTab === 'companyInfo' ? (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-4">Company Information</h3>
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
                      </div>
                    ) : (
                      <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4">Form Responses</h3>
                      {selectedRow.responses?.map((response, index) => (
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
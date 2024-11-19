import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faGripVertical } from '@fortawesome/free-solid-svg-icons';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase';

const FormResponses = ({ programId, loading = false }) => {
  const [responses, setResponses] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [columns, setColumns] = useState([]);
  const [companyFilter, setCompanyFilter] = useState('');
  const [columnWidths, setColumnWidths] = useState({});
  const [isResizing, setIsResizing] = useState(false);
  const [scores, setScores] = useState({
    'Business Model': 0,
    'Market Potential': 0,
    'Team Capability': 0,
    'Innovation': 0,
    'Scalability': 0
  });

  const resizingRef = useRef(null);
  const startXRef = useRef(null);
  const columnRef = useRef(null);
  const initialWidthRef = useRef(null);
  const tableRef = useRef(null);
  const containerRef = useRef(null);
  
  // Fixed fields that we want to display in the table
  const fixedFields = [
    'companyName',
    'founderName',
    'email',
    'mobile',
    'category',
    'website'
  ];

  const defaultColumnWidth = 200;

  const handleScoreChange = (category, score) => {
    setScores(prev => ({
      ...prev,
      [category]: score
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
    if (selectedRow) {
      setScores(selectedRow.scores || {
        'Business Model': 0,
        'Market Potential': 0,
        'Team Capability': 0,
        'Innovation': 0,
        'Scalability': 0
      });
    }
  }, [selectedRow]);

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

  const formatValue = (value) => {
    if (!value) return '-';
    
    if (typeof value === 'object') {
      if ('seconds' in value && 'nanoseconds' in value) {
        return new Date(value.seconds * 1000).toLocaleString();
      }
      if ('question' in value && 'answer' in value) {
        return value.answer;
      }
    }
    return value;
  };

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
      if (!programId) return;
      
      try {
        setIsLoading(true);
        const user = auth.currentUser;
        if (!user) return;

        const programmeQuery = query(
          collection(db, 'programmes'),
          where('id', '==', programId)
        );

        const programmeSnapshot = await getDocs(programmeQuery);

        if (programmeSnapshot.empty) {
          console.error('No programme found with the provided programId');
          return;
        }

        const programmeDoc = programmeSnapshot.docs[0];
        const formResponsesRef = collection(db, 'programmes', programmeDoc.id, 'formResponses');
        const querySnapshot = await getDocs(formResponsesRef);

        const fetchedResponses = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setResponses(fetchedResponses);
        initializeColumnsAndWidths();

      } catch (error) {
        console.error('Error fetching responses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResponses();
  }, [programId]);

  const filteredData = responses.filter((item) => {
    if (!companyFilter) return true;
    const companyName = item.companyName?.answer || formatValue(item.companyName);
    return companyName?.toLowerCase().includes(companyFilter.toLowerCase());
  });

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-6 my-8">
      <div className="flex items-center mb-4">
        <input
          type="text"
          placeholder="Filter by company name..."
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-xl border-l-4 border-[#F99F31]">
        <div className="min-w-[1200px]" ref={tableRef}>
          <table className="w-full border border-gray-300 rounded-lg">
            <thead>
              <tr>
                <th className="sticky top-0 bg-white px-4 py-2 text-left border border-gray-300 rounded-lg w-[50px]">
                  <input type="checkbox" />
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
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border border-gray-300 rounded-lg bg-white">
                    <input type="checkbox" />
                  </td>
                  {columns.map(column => (
                    <td 
                      key={column} 
                      className="px-4 py-2 border border-gray-300 rounded-lg overflow-hidden text-ellipsis"
                      style={{ 
                        width: columnWidths[column],
                        maxWidth: columnWidths[column] 
                      }}
                    >
                      <div className="truncate">
                        {formatValue(item[column])}
                      </div>
                    </td>
                  ))}
                  <td 
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                    style={{ width: columnWidths['status'] }}
                  >
                    <select className="px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && selectedRow && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="w-full max-w-6xl bg-white rounded-lg shadow-lg p-8 relative overflow-auto max-h-[90vh]">
            <button
              onClick={() => {
                setShowModal(false);
                setSelectedRow(null);
              }}
              className="absolute top-4 right-4 text-black px-4 py-2 rounded-full"
            >
              <FontAwesomeIcon icon={faClose} />
            </button>

            <div className="border-b">
              <div className="flex items-center p-4 gap-4">
                <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md flex items-center">
                  <span className="mr-2">📧</span>New email
                </button>
                <button className="border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-md flex items-center">
                  <span className="mr-2">➕</span>
                  Add activity
                </button>
                <button className="border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-md flex items-center">
                  <span className="mr-2">🔍</span>
                  Filter
                </button>
              </div>
            </div>

            <div className="flex">
              {/* Left Panel - Form Responses */}
              <div className="w-2/3 h-2/3 p-4 border-r">
                <div className="text-sm text-gray-500 mb-4">Program ID: {programId}</div>
                
                {/* All Fixed Fields (including those not shown in table) */}
                {[
                  'companyName',
                  'founderName',
                  'email',
                  'mobile',
                  'category',
                  'about',
                  'address',
                  'website',
                  'socialMedia'
                ].map((field, index) => (
                  selectedRow[field] && (
                    <div key={index} className="flex items-start space-x-3 mb-4">
                      <div className="bg-blue-500 p-2 rounded">
                        <span className="text-white">#</span>
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="mb-2">
                            <div className="font-medium text-gray-800">{getDisplayName(field)}</div>
                            <div className="text-gray-600">{formatValue(selectedRow[field])}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                ))}
                
                {/* Question Fields */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
                  {Object.entries(selectedRow)
                    .filter(([key, value]) => key.startsWith('question') && value?.question)
                    .map(([key, value], index) => (
                      <div key={index} className="flex items-start space-x-3 mb-4">
                        <div className="bg-blue-500 p-2 rounded">
                          <span className="text-white">#</span>
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="mb-2">
                              <div className="font-medium text-gray-800">{value.question}</div>
                              <div className="text-gray-600">{value.answer}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Right Panel - Scoring */}
              <div className="w-1/3 p-4">
                <div className="space-y-6">
                  <div>
                    <div className="text-sm font-medium mb-2">Service</div>
                    <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md inline-block">
                      Market Access
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-2">Status</div>
                    <div className="bg-green-500 text-white px-3 py-1 rounded-md inline-block">
                      Closed
                    </div>
                  </div>

                  <div className="space-y-4">
                    {Object.keys(scores).map((category) => (
                      <div key={category} className="space-y-1">
                        <div className="text-sm font-medium">{category}</div>
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
                      </div>
                    ))}

                    {/* Average Score Display */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium mb-2">Average Score</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {(Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length).toFixed(1)}
                      </div>
                    </div>

                    {/* Save Score Button */}
                    <button 
                      className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                      onClick={() => {
                        // Here you would implement the logic to save scores
                        console.log('Saving scores:', scores);
                      }}
                    >
                      Save Scores
                    </button>
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

export default FormResponses;

import {
  faBook,
  faBuilding,
  faCamera,
  faChevronRight,
  faCog,
  faCommentDots,
  faFile,
  faHome,
  faLightbulb,
  faMagic,
  faMap,
  faPlus,
  faQuestion,
  faQuestionCircle,
  faRocket,
  faSignOutAlt,
  faTrashAlt,
  faGripVertical,
  faShareAlt,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import ProgramInsights from '../components/ProgramInsights';
import { getAuth, signOut } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, getDocs, getFirestore, query, updateDoc, where,deleteDoc,setDoc,serverTimestamp } from 'firebase/firestore';
import { Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState,useCallback ,useRef} from 'react';
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import './Dashboard.css';
import FormBuilder from './FormBuilder';
import FormResponses from './FormResponses';
import { Autocomplete, useLoadScript } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import SettingsForm from '../components/SettingsForm';
import IncubatorSettingsForm from '../components/IncubatorSettings';
import JudgesFormResponses from './JudgesFormResponses';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import emailjs from '@emailjs/browser';
import FProgramDetailPage from '../components/Reviewsection';
import FProgramEditPage from '../components/EditProgram';

const generatedId = Math.floor(Math.random() * 1_000_000_000);


const FounderDashboard = () => {
  const [companyDetails, setCompanyDetails] = useState(null);
  const [logoError, setLogoError] = useState(false);
  const [programmes, setProgrammes] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [formResponses, setFormResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
const [isSendingEmails, setIsSendingEmails] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [activeProgramTab, setActiveProgramTab] = useState('insights');
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [error, setError] = useState(null);
  const [judgingProgrammes, setJudgingProgrammes] = useState([]); // New state for judging programmes
  const [isJudge, setIsJudge] = useState(false); // Track if user is a judge
  const [isJudgingProgramSelected, setIsJudgingProgramSelected] = useState(false);
  const [userStatus, setUserStatus] = useState(null);
  const [programid, setprogramid] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [newCategory, setNewCategory] = useState('');
  const [eventData, setEventData] = useState({
    name: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    categories: [], // Array to store selected categories
  location: '', // Field for location/venue
    description: '',
    Eligibility: '',
    Incentives: '',
    isPublic: true,
    calendar: 'Google Calendar',
    customFields: [],
    image: null,
  });
  const FormBuilderOptions = ({ onOptionSelect, onBack,programId,currentStep, setCurrentStep,setShowCreateEvent ,onFormLaunchSuccess, eventData   }) => {
    const auth = getAuth();
    const user = auth.currentUser;
    return (
      <div className="mx-auto pt-4">
        {/* Directly render the FormBuilder */}
        <FormBuilder programId={programId} userId={user.uid} currentStep={currentStep}
          setCurrentStep={setCurrentStep}  setShowCreateEvent={setShowCreateEvent}    onFormLaunchSuccess={onFormLaunchSuccess} eventData={eventData} // Pass fetchProgrammes as a prop
  />
  
        {/* <div className="flex justify-start mt-6">
          <button
            onClick={onBack}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            Back
          </button>
        </div> */}
      </div>
    );
  };
  
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();
 
  
  
  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
 
  
  // Modified loadAllData function
  
// Pass reloadCompanyDetails to SettingsForm
const renderSettingsForm = () => (
  <IncubatorSettingsForm onProfileUpdate={reloadCompanyDetails} />
);

const fetchCompanyDetails = useCallback(async (user) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      setCompanyDetails({
        name: userData.companyName || 'Company Name',
        logoUrl: userData.logoUrl || userData.companyLogo || null
      });
    }
  } catch (error) {
    console.error('Error fetching company details:', error);
    setError('Failed to load company details');
    setCompanyDetails({ name: 'Company Name', logoUrl: null });
  }
}, [db]);

  const reloadCompanyDetails = useCallback(async () => {
    const user = auth.currentUser;
    if (user) {
      await fetchCompanyDetails(user);
    }
  }, [auth, fetchCompanyDetails]);
  const handleStatusChange = async (programId, newStatus) => {
    try {
      setLoading(true);
      const db = getFirestore();
  
      // Find the program document
      const programsQuery = query(
        collection(db, 'programmes'),
        where('id', '==', programId)
      );
      const querySnapshot = await getDocs(programsQuery);
  
      if (!querySnapshot.empty) {
        const programDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, 'programmes', programDoc.id), {
          programStatus: newStatus,
          updatedAt: serverTimestamp(),
        });
  
        // Update local state
        setProgrammes((prevProgrammes) =>
          prevProgrammes.map((program) =>
            program.id === programId
              ? { ...program, programStatus: newStatus }
              : program
          )
        );
  
        if (selectedProgram?.id === programId) {
          setSelectedProgram((prev) => ({
            ...prev,
            programStatus: newStatus,
          }));
        }
  
        // Show different toast messages based on the status
        if (newStatus === 'ddraft') {
          createToast({
            title: "Success",
            description: "Program is now inactive"
          });
        } else {
          createToast({
            title: "Success",
            description: "Program is live now"
          });
        }
      }
    } catch (error) {
      console.error('Error updating program status:', error);
      createToast({
        title: "Error",
        description: "Failed to update program status"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Function to fetch programmes
  // Check if user is a judge and fetch judging programmes
  const checkJudgeStatusAndFetchProgrammes = useCallback(async (user) => {
    try {
      const judgesQuery = query(
        collection(db, 'judges'),
        where('email', '==', user.email)
      );
      const judgesSnapshot = await getDocs(judgesQuery);

      if (!judgesSnapshot.empty) {
        setIsJudge(true);
        const judgeData = judgesSnapshot.docs[0].data();
        const programId = judgeData.programId;

        const programmesQuery = query(
          collection(db, 'programmes'),
          where('id', '==', programId)
        );
        const programmesSnapshot = await getDocs(programmesQuery);

        const fetchedJudgingProgrammes = programmesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setJudgingProgrammes(fetchedJudgingProgrammes);
      } else {
        setIsJudge(false);
        setJudgingProgrammes([]);
      }
    } catch (error) {
      console.error('Error checking judge status or fetching judging programmes:', error);
      setError('Failed to check judge status or load judging programmes');
    }
  }, [db]);
 // Inside FounderDashboard component
 const fetchProgrammes = useCallback(async (user) => {
  try {
    setLoading(true);
    console.log('Fetching programmes for user:', user.uid);

    const programmesQuery = await getDocs(
      query(
        collection(db, 'programmes'),
        where('uid', '==', user.uid),
        where('programStatus', 'in', ['completed', 'draft', 'ddraft', 'active'])
      )
    );

    console.log('Programmes query snapshot:', programmesQuery);

    const fetchedProgrammes = programmesQuery.docs.length > 0
      ? programmesQuery.docs.map((doc) => {
          const data = doc.data();
          return {
            id: data.id || doc.id,
            docId: doc.id,
            name: data.name,
            programStatus: data.programStatus,
            endDate: data.endDate, // Add endDate here
          };
        })
      : [];

    console.log('Fetched programmes:', fetchedProgrammes);

    const statsPromises = fetchedProgrammes.map(async (program) => {
      console.log('Fetching responses for program with docId:', program.docId);
      const responsesQuery = await getDocs(
        collection(db, 'programmes', program.docId, 'formResponses')
      );
      console.log('Responses query size for', program.docId, ':', responsesQuery.size);
      return {
        id: program.id,
        name: program.name || 'Untitled Program',
        programStatus: program.programStatus,
        applicationCount: responsesQuery.size,
        endDate: program.endDate, // Include endDate in the returned stats
      };
    });

    const programStats = await Promise.all(statsPromises);
    console.log('Program stats:', programStats);
    setProgrammes(programStats);
  } catch (error) {
    console.error('Error fetching programmes:', error);
    setProgrammes([]);
  } finally {
    setLoading(false);
  }
}, [db]);
  
  // Add reload function to handle manual reloads


  // Inside FounderDashboard component
useEffect(() => {
  const fetchData = async () => {
    const user = auth.currentUser;
    if (user) {
      await fetchProgrammes(user);
      await checkJudgeStatusAndFetchProgrammes(user);
    }
  };
  fetchData();
}, [auth, fetchProgrammes]); // Add fetchProgrammes to dependencies
 useEffect(() => {
    const checkSessionAndFetchData = async () => {
      const sessionData = localStorage.getItem('sessionData');
      
      if (!sessionData) {
        navigate('/signup');
        return;
      }
  
      try {
        const { uid, expiresAt } = JSON.parse(sessionData);
        const currentTime = new Date().getTime();
        const expiration = new Date(expiresAt).getTime();
        
        // Extend session instead of logging out
        if (currentTime >= expiration) {
          console.warn('Session is about to expire. Extending session.');
          // Optionally update expiration in localStorage
          const extendedSessionData = {
            ...JSON.parse(sessionData),
            expiresAt: new Date(currentTime + 24 * 60 * 60 * 1000).toISOString() // Extend by 24 hours
          };
          localStorage.setItem('sessionData', JSON.stringify(extendedSessionData));
        }
  
        // Verify the session in Firestore
        const sessionRef = doc(db, 'sessions', uid);
        const sessionDoc = await getDoc(sessionRef);
        
        if (!sessionDoc.exists() || sessionDoc.data().isActive === false) {
          navigate('/signup');
          return;
        }
  
        // Fetch user and data
        const user = auth.currentUser;
        if (!user) {
          navigate('/signup');
          return;
        }
  fetchCompanyDetails(user);
        fetchProgrammes(user);
  
      } catch (error) {
        console.error('Session check and data fetch error:', error);
        
        // Fallback states
       
        
        // Do not automatically log out on errors
        console.warn('There was an issue checking your session. Please try again.');
      }
    };
  
    // Initial check and data fetch
    checkSessionAndFetchData();
    
    // Periodic session checks
    const interval = setInterval(checkSessionAndFetchData, 5 * 60 * 1000); // Check every 5 minutes
    
    return () => clearInterval(interval);
  }, [navigate, auth, db]);
// useEffect(() => {
//   const fetchCompanyDetails = async () => {
//     try {
//       // if (!user) {
//       //   navigate('/signup');
//       //   return;
//       // }

//       // Query Firestore to find the user document where uid matches user.uid
//       const q = query(collection(db, 'users'), where('uid', '==', auth.currentUser.uid));
//       const querySnapshot = await getDocs(q);

//       if (!querySnapshot.empty) {
//         const userData = querySnapshot.docs[0].data();
//         setCompanyDetails({
//           name: userData.companyName || 'Company Name',
//           logo: userData.logoUrl || userData.companyLogo || null
//         });
//       } else {
//         setCompanyDetails({ name: 'Company Name', logo: null });
//       }
//     } catch (error) {
//       console.error('Error fetching company details:', error);
//       setCompanyDetails({ name: 'Company Name', logo: null });
//     }
//   };

//   fetchCompanyDetails();
// }, [auth, db, navigate]);


  // Fetch programmes
  useEffect(() => {
    const fetchProgrammes = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const programmesQuery = await getDocs(
          query(collection(db, 'programmes'), where('uid', '==', user.uid))
        );
        
        const fetchedProgrammes = programmesQuery.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setProgrammes(fetchedProgrammes);
      } catch (error) {
        console.error('Error fetching programmes:', error);
        setProgrammes([]);
      }
    };

    fetchProgrammes();
  }, [auth, db]);
 
  const openSettings = () => {
    setActiveTab('settings'); // Switch to settings view
  };
  // Update the Breadcrumb component
  const Breadcrumb = ({ currentStep, showCreateEvent, activeTab, setCurrentStep }) => {
    // Handle Settings view
    if (activeTab === 'settings') {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FontAwesomeIcon
            icon={faChevronRight}
            className="text-gray-400 w-3 h-3"
          />
          <span className="text-gray-900 font-medium">Settings</span>
        </div>
      );
    }
  
    // Handle Program Creation steps
    if (showCreateEvent) {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FontAwesomeIcon
            icon={faChevronRight}
            className="text-gray-400 w-3 h-3"
          />
          {currentStep === 1 && (
            <span className="text-gray-900 font-medium">Basic Details</span>
          )}
          {currentStep === 2 && (
            <>
              <span 
                className="text-gray-600 hover:text-gray-900 cursor-pointer" 
                onClick={() => setCurrentStep(1)}
              >
                Basic Details
              </span>
              <FontAwesomeIcon
                icon={faChevronRight}
                className="text-gray-400 w-3 h-3"
              />
              <span className="text-gray-900 font-medium">Form Builder</span>
            </>
          )}
          {currentStep === 3 && (
            <>
              <span 
                className="text-gray-600 hover:text-gray-900 cursor-pointer" 
                onClick={() => setCurrentStep(1)}
              >
                Basic Details
              </span>
              <FontAwesomeIcon
                icon={faChevronRight}
                className="text-gray-400 w-3 h-3"
              />
              <span 
                className="text-gray-600 hover:text-gray-900 cursor-pointer"
                onClick={() => setCurrentStep(2)}
              >
                Form Builder
              </span>
              <FontAwesomeIcon
                icon={faChevronRight}
                className="text-gray-400 w-3 h-3"
              />
              <span className="text-gray-900 font-medium">Review Section</span>
            </>
          )}
        </div>
      );
    }
  
    // Return null if no conditions are met
    return null;
  };
  const handleNewProgramClick = async () => {
    setSelectedProgram(null); // Clear any selected program
    setEventData({
      name: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      categories: [],
      location: '',
      description: '',
      Eligibility: '',
      Incentives: '',
      isPublic: true,
      calendar: 'Google Calendar',
      customFields: [],
      image: null,
    });
    setShowCreateEvent(true);
    setCurrentStep(1);
    // Reset draft-related state
    setprogramid(null); // Clear the program ID
    setUserStatus(null); // Clear the user status
  
    // Optionally, update Firestore to clear the user's draft status
    try {
      const user = auth.currentUser;
      if (user) {
        const usersQuery = query(collection(db, 'users'), where('uid', '==', user.uid));
        const userSnapshot = await getDocs(usersQuery);
        if (!userSnapshot.empty) {
          const userDocRef = doc(db, 'users', userSnapshot.docs[0].id);
          await updateDoc(userDocRef, {
            programStatus: null,
            programid: null,
          });
        }
      }
    } catch (error) {
      console.error('Error resetting user draft status:', error);
    }
  };
  
  // const Breadcrumb = ({ 
  //   activeTab,
  //   selectedApplication,
  //   selectedProgram,
  //   setActiveTab,
  //   currentStep,
  //   setCurrentStep,
  //   showCreateEvent
  // }) => {
  //   const getBreadcrumbItems = () => {
  //     const items = [];
      
  //     // Only show breadcrumbs during program creation
  //     if (showCreateEvent) {
  //       // Always add Basic Details for both steps
  //       items.push({
  //         label: 'Basic Details',
  //         onClick: () => setCurrentStep(1)
  //       });
        
  //       // Add Form Builder for step 2
  //       if (currentStep === 2) {
  //         items.push({
  //           label: 'Form Builder',
  //           onClick: null // No onClick for current step
  //         });
  //       }
  //     }
      
  //     return items;
  //   };
    
  //   const breadcrumbItems = getBreadcrumbItems();
    
  //   // Don't render anything if there are no items
  //   if (breadcrumbItems.length === 0) return null;
    
  //   return (
  //     <div className="flex items-center gap-2 text-sm text-gray-600">
  //       {breadcrumbItems.map((item, index) => (
  //         <React.Fragment key={item.label}>
  //           {index > 0 && (
  //             <FontAwesomeIcon
  //               icon={faChevronRight}
  //               className="text-gray-400 w-3 h-3 mx-2"
  //             />
  //           )}
  //           {item.onClick ? (
  //             <button
  //               onClick={item.onClick}
  //               className="text-gray-600 hover:text-gray-900 focus:outline-none"
  //             >
  //               {item.label}
  //             </button>
  //           ) : (
  //             <span className="text-gray-900 font-medium">
  //               {item.label}
  //             </span>
  //           )}
  //         </React.Fragment>
  //       ))}
  //     </div>
  //   );
  // };
  
  
  
  
  
  
  // Fetch form responses when program or tab changes
 // Fetch form responses when program or tab changes
// StepIndicator Component
const StepIndicator = ({ currentStep }) => {
  const steps = [
    { number: 1, label: 'Basic Details', status: 'current' },
    { number: 2, label: 'Form Builder', status: 'upcoming' },
    { number: 3, label: 'Review & Launch', status: 'upcoming' }
  ];

  return (
    <div className="flex items-center w-full mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step.number <= currentStep
                  ? 'bg-blue-700 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step.number}
            </div>
            <span
              className={`ml-2 ${
                step.number <= currentStep
                  ? 'text-blue-700 font-semibold'
                  : 'text-gray-400'
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className="flex-grow mx-4">
              <div
                className={`h-0.5 ${
                  step.number < currentStep ? 'bg-blue-700' : 'bg-gray-200'
                }`}
              ></div>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
const HomePage = ({ userStatus, 
  programid, 
  showCreateEvent, 
  setShowCreateEvent, 
  fetchProgrammes,
  currentStep, 
  setCurrentStep,
  onFormLaunchSuccess ,selectedProgram,programStats,  }) => {
    const auth = getAuth();
    const [eventData, setEventData] = useState({
      name: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      categories: [],
      location: '',
      description: '',
      Eligibility: '',
      Incentives: '',
      isPublic: true,
      calendar: 'Google Calendar',
      customFields: [],
      image: null,
    });
  const db = getFirestore();
  //  const [showCreateEvent, setShowCreateEvent] = useState(false);
  // const [currentStep, setCurrentStep] = useState(1);
  // const [eventData, setEventData] = useState(null);
  const [isClosing, setIsClosing] = useState(false); // Add state to track closing operation

  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const user = auth.currentUser;
        // if (!user) {
        //   navigate('/signup');
        //   return;
        // }

        const usersQuery = query(
          collection(db, 'users'),
          where('uid', '==', user.uid)
        );
        const querySnapshot = await getDocs(usersQuery);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setUserStatus(userData.programStatus || null);
          setprogramid(userData.programid || null);
        }
      } catch (error) {
        console.error('Error fetching user status:', error);
      } finally {
        // setIsLoading(false);
      }
    };

    fetchUserStatus();
  }, [auth, db, navigate]);
 

  // Get userStatus and programid from parent component's state
  // const { userStatus, programid } = { userStatus, programid };
  // const oncloseoperation = async () => {
  //   if (isClosing) return; // Prevent multiple simultaneous close operations
    
  //   setIsClosing(true);
  //   try {
  //     // Reference to the "users" collection and query by the `uid` field
  //     const usersRef = collection(db, "users");
  //     const q = query(usersRef, where("uid", "==", auth.currentUser.uid));
  //     const querySnapshot = await getDocs(q);

  //     if (!querySnapshot.empty) {
  //       const userDocRef = querySnapshot.docs[0].ref;
  //       await updateDoc(userDocRef, {
  //         programStatus: "completed",
  //         programid: null,
  //       });
  //     }
      
  //     // Close the form immediately after database update
  //     setShowCreateEvent(false);
  //     setCurrentStep(1);
  //   } catch (error) {
  //     console.error('Error closing form:', error);
  //   } finally {
  //     setIsClosing(false);
  //   }
  // };
  const handleClose = () => {
    setShowCreateEvent(false);
    setCurrentStep(1);
  };
  // const handleClose = async () => {
  //   try {
  //     // Check if name is not null (i.e., some data has been entered)
  //     if (eventData?.name) {
  //       // Only proceed with deletion if programId exists
  //       if (programid) {
  //         // Delete the program if it exists
  //         const programmesRef = collection(db, 'programmes');
  //         const q = query(programmesRef, where('id', '==', programid));
  //         const querySnapshot = await getDocs(q);
  
  //         if (!querySnapshot.empty) {
  //           const docRef = doc(db, 'programmes', querySnapshot.docs[0].id);
  //           await deleteDoc(docRef);
  //         }
  
  //         // Update user's program status and program ID
  //         const usersQuery = query(
  //           collection(db, 'users'),
  //           where('uid', '==', auth.currentUser.uid)
  //         );
  //         const userSnapshot = await getDocs(usersQuery);
  
  //         if (!userSnapshot.empty) {
  //           const userDoc = userSnapshot.docs[0];
  //           const userDocRef = doc(db, 'users', userDoc.id);
  //           await updateDoc(userDocRef, {
  //             programStatus: null,
  //             programid: null,
  //           });
  //         }
  //       }
  //     }
  
  //     // Close the form regardless of whether data was entered or not
  //     setShowCreateEvent(false);
  //     setCurrentStep(1);
  
  //     // Reload programmes
  //     if (fetchProgrammes) {
  //       await fetchProgrammes(auth.currentUser);
  //     }
  
  //   } catch (error) {
  //     console.error('Error closing form:', error);
  //   }
  // };
  // useEffect(() => {
  //   // Only proceed if not currently closing
  //   if (isClosing) return;
  
  //   if (userStatus === 'active' && programid) {
  //     // Add a delay before checking program status
  //     const timer = setTimeout(() => {
  //       const fetchExistingProgram = async () => {
  //         try {
  //           const programmesRef = collection(db, 'programmes');
  //           const q = query(programmesRef, where('id', '==', programid));
  //           const querySnapshot = await getDocs(q);
            
  //           if (!querySnapshot.empty) {
  //             const programData = querySnapshot.docs[0].data();
  //             setEventData(programData);
  //             setShowCreateEvent(true); // Remove this line
  //           }
  //         } catch (error) {
  //           console.error('Error fetching existing program:', error);
  //         }
  //       };
    
  //       fetchExistingProgram();
  //     }, 2000); // 2 second delay
  
  //     return () => clearTimeout(timer);
  //   }
  // }, [userStatus, programid, isClosing]);
  const [columnWidths, setColumnWidths] = useState({
    programName: 500,
    status: 100,
    deadline: 130,
    applicationCount: 100
  });
  const [isResizing, setIsResizing] = useState(false);
  
  const resizingRef = useRef(null);
  const startXRef = useRef(null);
  const columnRef = useRef(null);
  const initialWidthRef = useRef(null);
  const tableRef = useRef(null);

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
      
      const maxWidth = 800;
      
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
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const formatStatus = (programStatus) => {
    switch (programStatus) {
      case 'completed':
        return 'Active';
      case 'draft':
        return 'Draft';
      case 'ddraft':
        return 'Inactive';
      default:
        return 'Active';
    }
  };
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      console.log('Hi');
      // Handle "YYYY-MM-DD" string format explicitly
      if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        const [year, month, day] = date.split('-');
        const dateObj = new Date(year, month - 1, day); // month is 0-indexed
        if (isNaN(dateObj.getTime())) return 'Invalid Date';
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long', // Displays full month name (e.g., "March")
          day: 'numeric', // Displays day as a number (e.g., "4")
        }); // e.g., "March 4, 2025"
      }
      // Fallback for other formats
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return 'Invalid Date';
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }); // e.g., "March 4, 2025"
    } catch (error) {
      console.error('Error formatting date:', date, error);
      return 'N/A';
    }
  };
  // const formatDeadline = (deadline) => {
  //   if (!deadline) return 'N/A';
  //   // Assuming deadline is a timestamp or date string
  //   return new Date(deadline).toLocaleDateString();
  // };
  return (
    <div className="md:px-36 overflow-auto mt-8">
      {!showCreateEvent && (
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold font-sans-serif">Home</h1>
          <div className="flex gap-2">
            <button
              onClick={handleNewProgramClick}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faPlus} size="sm" />
            </button>
            <button
              onClick={handleNewProgramClick}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md flex items-center gap-2"
            >
              New Program
            </button>
          </div>
        </div>
      )}
      {!showCreateEvent && <div className="border-b border-gray-300 mt-4"></div>}

      {showCreateEvent ? (
        <CreateEventForm
          onClose={handleClose}
          initialData={selectedProgram}
          programId={programid || selectedProgram?.id}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          fetchProgrammes={fetchProgrammes}
          setShowCreateEvent={setShowCreateEvent}
          onFormLaunchSuccess={onFormLaunchSuccess}
          eventData={eventData} // Pass eventData from FounderDashboard
          setEventData={setEventData} // Pass setEventData from FounderDashboard
          isNewProgram={!selectedProgram || selectedProgram.programStatus !== 'draft'}
        />
      ) : programStats.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center mt-28">
          <div className="bg-gray-50 rounded-lg p-8 max-w-lg w-full text-center">
            <div className="mb-4">
              <Plus className="w-12 h-12 text-gray-400 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Create your first Program</h2>
            <p className="text-gray-600 mb-6">
              Get started by creating an event, program, or cohort to begin collecting responses.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleNewProgramClick}
                className="px-4 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50 flex items-center gap-2"
              >
                <Plus size={16} />
              </button>
              <button
                onClick={handleNewProgramClick}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                New Program
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8 mb-10">
          {/* <h2 className="text-2xl font-semibold mb-4">Program Statistics</h2> */}
          <div className='p-4'></div>
          <div className="overflow-x-auto rounded-xl border-l-4 border-[#F99F31]">
            <div ref={tableRef}>
              <table className="w-full border border-gray-300 rounded-lg">
                <thead>
                  <tr>
                    <th 
                      className="sticky top-0 bg-white px-4 py-2 text-left border border-gray-300 rounded-lg relative group"
                      style={{ width: columnWidths['programName'] }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate pr-6">Active Programs</span>
                        <div
                          className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-gray-300 opacity-0 group-hover:opacity-100"
                          onMouseDown={(e) => handleResizeStart(e, 'programName')}
                        >
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 -translate-x-1/2">
                            <FontAwesomeIcon icon={faGripVertical} className="text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </th>
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
                      style={{ width: columnWidths['deadline'] }}
                    >
                      <div className="flex items-center justify-between">
                        <span>Deadline</span>
                        <div
                          className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-gray-300 opacity-0 group-hover:opacity-100"
                          onMouseDown={(e) => handleResizeStart(e, 'deadline')}
                        >
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 -translate-x-1/2">
                            <FontAwesomeIcon icon={faGripVertical} className="text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </th>
                    <th 
                      className="sticky top-0 bg-white px-4 py-2 text-left border border-gray-300 rounded-lg relative group"
                      style={{ width: columnWidths['applicationCount'] }}
                    >
                      <div className="flex items-center justify-between">
                        <span>Number of Applications</span>
                        <div
                          className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-gray-300 opacity-0 group-hover:opacity-100"
                          onMouseDown={(e) => handleResizeStart(e, 'applicationCount')}
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
                  {programStats.map((program) => (
                    <tr key={program.id} className="hover:bg-gray-50">
                      <td 
                        className="px-4 py-2 border border-gray-300 rounded-lg overflow-hidden text-ellipsis"
                        style={{
                          width: columnWidths['programName'],
                          maxWidth: columnWidths['programName'],
                        }}
                      >
                        {program.name}
                      </td>
                      <td 
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                        style={{
                          width: columnWidths['status'],
                          maxWidth: columnWidths['status'],
                        }}
                      >
                        {formatStatus(program.programStatus)}
                      </td>
                      <td 
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                        style={{
                          width: columnWidths['deadline'],
                          maxWidth: columnWidths['deadline'],
                        }}
                      >
                        {formatDate(program.endDate)}
                      </td>
                      <td 
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                        style={{
                          width: columnWidths['applicationCount'],
                          maxWidth: columnWidths['applicationCount'],
                        }}
                      >
                        {program.applicationCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
const Header = ({ 
  activeTab, 
  selectedApplication, 
  setActiveTab, 
  openSettings,
  currentStep,
  selectedProgram,
  setCurrentStep,
  showCreateEvent,
  setShowCreateEvent 
}) => {
  const handleLogoClick = () => {
    // Reset all necessary states to return to home
    setActiveTab('home');
    setShowCreateEvent(false);
    setCurrentStep(1);
  };
  return (
    <div className="flex items-center justify-between px-4 py-2 sticky top-0 bg-white border-b border-gray-200 z-10">
      <div className="flex items-center gap-4">
      <button
  onClick={() => setActiveTab('home')}
  className="focus:outline-none hover:bg-gray-100 rounded-lg"
>
  <h6
    className="text-black font-bold hover:opacity-80 transition-opacity px-2"
    style={{
      fontFamily: 'CustomFont',
      fontSize: '30px',
      
    }}
  >
    seco
  </h6>
</button>
        {console.log("currentStep",currentStep)}  
        <Breadcrumb 
          currentStep={currentStep} 
          showCreateEvent={showCreateEvent}
          setCurrentStep={setCurrentStep}
          activeTab={activeTab}
          setActiveTab={setActiveTab}  // Pass the prop here
        />
        {/* <Breadcrumb 
          activeTab={activeTab}
          selectedApplication={selectedApplication}
          selectedProgram={selectedProgram}
          setActiveTab={setActiveTab}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          showCreateEvent={showCreateEvent}
        /> */}
      </div>
      
      <a
        className="p-2 text-black hover:text-gray-300 focus:outline-none"
        onClick={openSettings}
      >
        <FontAwesomeIcon icon={faCog} size="lg" />
      </a>
    </div>
  );
};


// Card Components
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`${className}`}>
    {children}
  </div>
);


const handleProgramClick = (program, isJudgingProgram = false) => {
  setSelectedProgram(program);
  setIsJudgingProgramSelected(isJudgingProgram); // Track if it's a judging program

  if (!isJudgingProgram && program.programStatus === 'draft') {
    // Handle draft programs for founders
    setShowCreateEvent(true);
    setCurrentStep(1);
    setprogramid(program.id);
    setUserStatus('draft');
  } else {
    // Switch to program tab for both founder and judge programs
    setActiveTab('program');
    setActiveProgramTab(isJudgingProgram ? 'formResponses' : 'insights'); // Only set to formResponses for judging programs
    setFormResponses([]);
  }
};
const createToast = ({ title, description, actionText = "OK", actionCallback = () => {} }) => {
  // Remove any existing toasts
  const existingToasts = document.querySelectorAll('.custom-toast');
  existingToasts.forEach(toast => toast.remove());

  const toast = document.createElement('div');
  toast.className = 'custom-toast';
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #ffffff;
    padding: 16px 24px;
    border-radius: 20px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.2);
    z-index: 1000;
    min-width: 400px;
    color: #000000;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 16px;
    justify-content: space-between;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  `;

  const textContainer = document.createElement('div');
  textContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 4px;
  `;

  const titleEl = document.createElement('div');
  titleEl.textContent = title;
  titleEl.style.cssText = `
    font-weight: bold;
    font-size: 16px;
  `;

  const descEl = document.createElement('div');
  descEl.textContent = description;
  descEl.style.cssText = `
    font-size: 14px;
  `;

  textContainer.appendChild(titleEl);
  textContainer.appendChild(descEl);

  const actionBtn = document.createElement('button');
  actionBtn.textContent = actionText;
  actionBtn.style.cssText = `
    color: #ffffff;
    background: #000000;
    border: none;
    padding: 8px 16px;
    border-radius: 9999px;
    cursor: pointer;
    font-weight: bold;
    width: fit-content;
  `;

  const closeToast = () => {
    toast.style.opacity = '0';
    setTimeout(() => {
      if (toast.parentNode) {
        document.body.removeChild(toast);
      }
    }, 300);
  };

  actionBtn.addEventListener('click', () => {
    actionCallback();
    closeToast();
  });

  toast.appendChild(textContainer);
  toast.appendChild(actionBtn);
  document.body.appendChild(toast);

  // Fade in animation
  setTimeout(() => {
    toast.style.opacity = '1';
  }, 10);

  // Auto-close after 5 seconds
  setTimeout(closeToast, 5000);

  return toast;
};
  const handleLogout = async () => {
    try {
      localStorage.removeItem('sessionData'); // Clear session data
      await signOut(auth);
      navigate('/signup');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  const libraries = ['places'];
 // Define the component
const CreateEventForm = ({
  onClose,
  initialData,
  programId,
  currentStep,
  eventData,
  setEventData,
  setCurrentStep,
  fetchProgrammes,
  isNewProgram = false,
  onFormLaunchSuccess,
  setShowCreateEvent, // Added to match your original props
}) => {
  const auth = getAuth();
  const db = getFirestore();

  // State declarations
  const [isClosing, setIsClosing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [eventImage, setEventImage] = useState(null);
  const [newFieldName, setNewFieldName] = useState('');
  const [locationInput, setLocationInput] = useState(eventData?.location || ''); // For location
  const [categoryInput, setCategoryInput] = useState(''); // For categories // Initialize with eventData.location
  const [selectedFormOption, setSelectedFormOption] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]); // State for location suggestions
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
// Custom debounce hook
const useDebounce = (callback, delay) => {
  const debounceRef = useRef(null);

  const debouncedCallback = useCallback(
    (...args) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  return debouncedCallback;
};
  // Load draft from Firestore
  useEffect(() => {
    console.log('CreateEventForm mounted with:', { programId, isNewProgram });
    const loadDraftFromFirestore = async () => {
      if (programId) {
        console.log('Loading draft for programId:', programId);
        try {
          const programmesRef = collection(db, 'programmes');
          const q = query(programmesRef, where('id', '==', programId));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const programData = querySnapshot.docs[0].data();
            console.log('Draft data loaded:', programData);
            setEventData({
              name: programData.name || '',
              startDate: programData.startDate || '',
              startTime: programData.startTime || '',
              endDate: programData.endDate || '',
              endTime: programData.endTime || '',
              categories: programData.categories || [],
              location: programData.location || '',
              description: programData.description || '',
              Eligibility: programData.Eligibility || '',
              Incentives: programData.Incentives || '',
              isPublic: programData.isPublic !== undefined ? programData.isPublic : true,
              calendar: programData.calendar || 'Google Calendar',
              customFields: programData.customFields || [],
              image: programData.image || null,
            });
            setLocationInput(programData.location || ''); // Sync location input with eventData
          } else {
            console.warn(`No program found with ID: ${programId}`);
          }
        } catch (error) {
          console.error('Error loading draft from Firestore:', error);
        }
      }
    };
    loadDraftFromFirestore();
  }, [programId, setEventData, isNewProgram, db]);

  // Check current step
  useEffect(() => {
    console.log('Current Step:', currentStep);
  }, [currentStep]);

  // Handle initial data
  useEffect(() => {
    if (initialData) {
      console.log('Initial data received:', initialData);
      setEventData((prev) => ({
        ...prev,
        name: initialData.name || '',
        startDate: initialData.startDate || '',
        startTime: initialData.startTime || '',
        endDate: initialData.endDate || '',
        endTime: initialData.endTime || '',
        categories: initialData.categories || [],
        location: initialData.location || '',
        description: initialData.description || '',
        Eligibility: initialData.Eligibility || '',
        Incentives: initialData.Incentives || '',
        isPublic: initialData.isPublic !== undefined ? initialData.isPublic : true,
        calendar: initialData.calendar || 'Google Calendar',
        customFields: initialData.customFields || [],
      }));
      setEventImage(initialData.image || null);
      setLocationInput(initialData.location || ''); // Sync location input with initial data
    }
  }, [initialData, setEventData]);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEventData((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Save as draft
  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const dataToSave = {
        ...eventData,
        uid: auth.currentUser.uid,
        programStatus: 'draft',
        updatedAt: serverTimestamp(),
      };

      let newProgramId = programId;
      if (programId) {
        const q = query(collection(db, 'programmes'), where('id', '==', programId));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const docRef = doc(db, 'programmes', querySnapshot.docs[0].id);
          await updateDoc(docRef, dataToSave);
        }
      } else {
        newProgramId = generatedId;
        dataToSave.id = newProgramId;
        dataToSave.createdAt = serverTimestamp();
        await addDoc(collection(db, 'programmes'), dataToSave);
      }

      const usersQuery = query(collection(db, 'users'), where('uid', '==', auth.currentUser.uid));
      const userSnapshot = await getDocs(usersQuery);
      if (!userSnapshot.empty) {
        const userDocRef = doc(db, 'users', userSnapshot.docs[0].id);
        await updateDoc(userDocRef, {
          programStatus: 'draft',
          programid: newProgramId,
        });
      }

      await fetchProgrammes(auth.currentUser);
      onClose();
      // alert('');

      createToast({
        title: "Success",
        description: "Draft saved successfully!"
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      // alert(' ' + error.message);
      createToast({
        title: "Error saving draft:",
        description: error.message // Remove the `+` before error.message
      });
    }
     finally {
      setIsSaving(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    console.log('Submitting with eventData:', eventData);
    console.log('programId:', programId);

    if (!eventData.name || !eventData.startDate || !eventData.endDate) {
      throw new Error('Missing required fields: name, startDate, or endDate');
    }

    try {
      const programmesRef = collection(db, 'programmes');
      let docId;

      if (programId) {
        const q = query(programmesRef, where('id', '==', programId));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const existingDoc = querySnapshot.docs[0];
          docId = existingDoc.id;
          await updateDoc(doc(db, 'programmes', docId), {
            ...eventData,
            image: eventImage || null,
            programStatus: 'active',
            updatedAt: serverTimestamp(),
            uid: auth.currentUser.uid,
          });
          console.log('Program updated successfully with ID:', docId);
        } else {
          throw new Error(`No program found with ID: ${programId}`);
        }
      } else {
        const newProgramData = {
          ...eventData,
          image: eventImage || null,
          id: generatedId,
          uid: auth.currentUser.uid,
          programStatus: 'active',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        const docRef = await addDoc(programmesRef, newProgramData);
        docId = docRef.id;
        console.log('New program created with ID:', docId);
      }

      const usersQuery = query(collection(db, 'users'), where('uid', '==', auth.currentUser.uid));
      const userSnapshot = await getDocs(usersQuery);
      if (!userSnapshot.empty) {
        const userDocRef = doc(db, 'users', userSnapshot.docs[0].id);
        await updateDoc(userDocRef, {
          programStatus: 'active',
          programid: programId || generatedId,
        });
        console.log('User status updated successfully');
      } else {
        throw new Error('User document not found');
      }

      return docId;
    } catch (e) {
      console.error('Error in handleSubmit:', e);
      throw e;
    }
  };

  // Handle next step
 // Define the ToastWithAction component within the same file or import it
// Simple Toast implementation
const createToast = ({ title, description, actionText, actionCallback }) => {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #ffffff; /* Black background */
    padding: 16px 24px;
    border-radius: 20px; /* Adjusted to match the pill-shaped button in the image */
    box-shadow: 0 4px 6px rgba(0,0,0,0.2);
    z-index: 1000;
    min-width: 400px; /* Wider to match the image */
    color: #000000; /* White text */
    display: flex; /* Use flexbox for layout */
    flex-direction: row; /* Horizontal layout */
    align-items: center; /* Center items vertically in the row */
    gap: 16px; /* Space between elements */
    justify-content: space-between; /* Space out content and button */
  `;

  // Container for text (title + description) to keep them stacked vertically
  const textContainer = document.createElement('div');
  textContainer.style.display = 'flex';
  textContainer.style.flexDirection = 'column';
  textContainer.style.gap = '4px'; /* Space between title and description */

  const titleEl = document.createElement('div');
  titleEl.textContent = title;
  titleEl.style.fontWeight = 'bold';
  titleEl.style.fontSize = '16px'; /* Slightly larger for emphasis */

  const descEl = document.createElement('div');
  descEl.textContent = description;
  descEl.style.fontSize = '14px'; /* Smaller font for description */

  // Append title and description to the text container
  textContainer.appendChild(titleEl);
  textContainer.appendChild(descEl);

  const actionBtn = document.createElement('button');
  actionBtn.textContent = actionText || "OK"; // Default to "OK" if no actionText provided
  actionBtn.style.cssText = `
    color: #ffffff; /* White button background */
    background: #000000; /* Black text for contrast */
    border: none;
    padding: 8px 16px;
    border-radius: 30%; /* Rounded button */
    cursor: pointer;
    font-weight: bold;
    width: fit-content; /* Fit button to text */
  `;
  actionBtn.addEventListener('click', () => {
    document.body.removeChild(toast); // Simply close the toast when clicked
  });

  // Append text container and button to toast
  toast.appendChild(textContainer);
  toast.appendChild(actionBtn);

  document.body.appendChild(toast);
  return toast;
};

// Example usage (you can keep or modify ToastWithAction as needed):


// You can keep the ToastWithAction and handleNext functions as they were, just updating how you call createToast:


// Modified ToastWithAction component
const ToastWithAction = ({ message }) => {
  return createToast({
    title: "Uh oh! Something went wrong.",
    description: message,
    actionText: "Ok",
    actionCallback: () => {
      // Add retry logic here if needed
      console.log("Try again clicked");
    }
  });
};

// Modified handleNext function
const handleNext = async () => {
  setIsProcessing(true);
  try {
    const missingFields = [];
    if (!eventData.name) missingFields.push('Event Name');
    if (!eventData.startDate) missingFields.push('Start Date');
    if (!eventData.endDate) missingFields.push('End Date');
    if (!eventData.image) missingFields.push('Image');
    if (!eventData.description) missingFields.push('Description');
    if (!eventData.location) missingFields.push('Location');
    // Modified category check to validate if array exists and has items
    if (!eventData.categories || eventData.categories.length === 0) {
      missingFields.push('Sector');
    }

    if (missingFields.length > 0) {
      throw new Error(`Please fill in the following required fields: ${missingFields.join(', ')}`);
    }

    // Rest of your existing code...
    const dataToSave = {
      ...eventData,
      uid: auth.currentUser.uid,
      programStatus: 'draft',
      updatedAt: serverTimestamp(),
    };

    let newProgramId = programId;
    if (programId) {
      const q = query(collection(db, 'programmes'), where('id', '==', programId));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docRef = doc(db, 'programmes', querySnapshot.docs[0].id);
        await updateDoc(docRef, dataToSave);
      }
    } else {
      newProgramId = generatedId;
      dataToSave.id = newProgramId;
      dataToSave.createdAt = serverTimestamp();
      await addDoc(collection(db, 'programmes'), dataToSave);
    }

    const usersQuery = query(collection(db, 'users'), where('uid', '==', auth.currentUser.uid));
    const userSnapshot = await getDocs(usersQuery);
    if (!userSnapshot.empty) {
      const userDocRef = doc(db, 'users', userSnapshot.docs[0].id);
      await updateDoc(userDocRef, {
        programStatus: 'draft',
        programid: newProgramId,
      });
    }

    await fetchProgrammes(auth.currentUser);
    setCurrentStep(2);
  } catch (error) {
    console.error('Error in handleNext:', error);
    createToast({
      title: "Uh oh! Something went wrong.",
      description: error.message,
      actionText: "Ok",
      actionCallback: () => {
        console.log("Try again clicked");
      }
    });
  } finally {
    setIsProcessing(false);
  }
};
  // Quill editor setup
  const modules = {
    toolbar: [
      [{ header: '1' }, { header: '2' }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ link: 'text' }],
    ],
  };

  const formats = ['header', 'bold', 'italic', 'underline', 'strike', 'list', 'bullet', 'link'];

  const handleChange = (value) => {
    setEventData((prev) => ({
      ...prev,
      description: value,
    }));
  };

  // Custom fields management
  const addCustomField = () => {
    if (newFieldName.trim()) {
      setEventData({
        ...eventData,
        customFields: [...eventData.customFields, { id: Date.now(), name: newFieldName.trim(), date: '' }],
      });
      setNewFieldName('');
    }
  };

  const removeCustomField = (id) => {
    setEventData({
      ...eventData,
      customFields: eventData.customFields.filter((field) => field.id !== id),
    });
  };

  const updateCustomField = (id, date) => {
    setEventData({
      ...eventData,
      customFields: eventData.customFields.map((field) => (field.id === id ? { ...field, date } : field)),
    });
  };

  // Category management
  const predefinedCategories = ['Technology', 'Healthcare', 'Finance', 'Education', 'Marketing', 'Retail'];

  const filteredCategories = predefinedCategories.filter(
    (category) =>
      category.toLowerCase().includes(categoryInput.toLowerCase()) &&
      (!eventData || !eventData.categories || !eventData.categories.includes(category))
  );
//wUuZz8uA0OmFfVBvUZ3jJTGDwdOGDYrhn34xh7kH
  // Location suggestions with fetch
  const fetchLocationSuggestions = async (query) => {
    if (!query) {
      setLocationSuggestions([]);
      return;
    }
  
    const apiKey = 'wUuZz8uA0OmFfVBvUZ3jJTGDwdOGDYrhn34xh7kH'; // Replace with your actual Ola Maps API key
    const baseUrl = 'https://api.olamaps.io/places/v1/autocomplete';
    
    // Optional: Bias results based on user location (e.g., if you have geolocation)
    const userLocation = ''; // e.g., "12.931316595874005,77.61649243443775" (add geolocation logic if needed)
    const radius = 5000; // 5km radius, adjust as needed
    const url = `${baseUrl}?input=${encodeURIComponent(query)}&api_key=${apiKey}${
      userLocation ? `&location=${userLocation}&radius=${radius}` : ''
    }`;
  
    const requestOptions = {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Request-Id': crypto.randomUUID(), // Generate UUID for tracking (optional)
        'X-Correlation-Id': crypto.randomUUID(), // Generate UUID for transaction (optional)
      },
    };
  
    try {
      const response = await fetch(url, requestOptions);
      const result = await response.json();
  
      if (result.status === 'ok' && result.predictions?.length > 0) {
        // Extract the 'description' field from each prediction for display
        const suggestions = result.predictions.map((prediction) => prediction.description);
        setLocationSuggestions(suggestions);
      } else {
        setLocationSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching Ola Maps autocomplete suggestions:', error);
      setLocationSuggestions([]);
    }
  };
// Debounced fetch function
const debouncedFetchSuggestions = useDebounce((query) => {
  fetchLocationSuggestions(query);
}, 300); // 300ms delay
  // Handle input change with debouncing
  const handleLocationInputChange = (e) => {
    const value = e.target.value;
    setLocationInput(value);
    setEventData((prev) => ({ ...prev, location: value }));
    debouncedFetchSuggestions(value); // Fetch suggestions debounced
  };
  const handleSelectLocation = (suggestion) => {
    setLocationInput(suggestion);
    setEventData((prev) => ({ ...prev, location: suggestion }));
    setLocationSuggestions([]); // Clear suggestions after selection
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
        setLocationSuggestions([]); // Clear location suggestions when clicking outside
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddCategory = (category) => {
    if (category.trim() && !eventData?.categories?.includes(category.trim())) {
      setEventData((prev) => ({
        ...prev,
        categories: [...(prev.categories || []), category.trim()],
      }));
      setCategoryInput('');
      setIsDropdownOpen(false);
    }
  };

  const handleRemoveCategory = (indexToRemove) => {
    setEventData((prev) => ({
      ...prev,
      categories: prev.categories.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && categoryInput.trim()) {
      handleAddCategory(categoryInput);
    }
  };

  // Handle close
  const handleClose = async () => {
    if (isClosing) return;
    setIsClosing(true);
    try {
      if (programId) {
        const programmesRef = collection(db, 'programmes');
        const q = query(programmesRef, where('id', '==', programId));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const docRef = doc(db, 'programmes', querySnapshot.docs[0].id);
          await deleteDoc(docRef);
        }

        const usersQuery = query(collection(db, 'users'), where('uid', '==', auth.currentUser.uid));
        const userSnapshot = await getDocs(usersQuery);
        if (!userSnapshot.empty) {
          const userDocRef = doc(db, 'users', userSnapshot.docs[0].id);
          await updateDoc(userDocRef, {
            programStatus: null,
            programid: null,
          });
        }
      }
      await fetchProgrammes(auth.currentUser);
      onClose();
    } catch (error) {
      console.error('Error closing form:', error);
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <div className="max-w mx-auto p-4">
      <StepIndicator currentStep={currentStep} />
      <div className="border-b border-gray-300 mt-4"></div>

      {currentStep === 1 ? (
        <>
          <div className="flex items-center justify-between mb-6 mt-8">
            <input
              type="text"
              placeholder="Event Name"
              className="w-full text-2xl font-light border-none focus:outline-none focus:ring-0"
              value={eventData?.name || ''}
              onChange={(e) => setEventData((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-3 gap-6">
            {/* Left column - Image upload */}
            <div className="col-span-1">
              <div className="bg-white rounded-lg shadow">
                <div className="p-0">
                  <div
                    className="relative aspect-square bg-gray-100 flex items-center justify-center cursor-pointer rounded-lg overflow-hidden"
                    onClick={() => document.getElementById('imageUpload').click()}
                  >
                    {eventData?.image ? (
                      <img
                        src={eventData.image || eventImage}
                        alt="Event"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <FontAwesomeIcon icon={faCamera} className="text-3xl text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Click to upload event image</p>
                      </div>
                    )}
                    <input
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right column - Event details */}
            <div className="col-span-2">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 space-y-6">
                  <label className="block text-sm text-gray-500 mb-1">Description</label>
                  <div className="w-full p-0 rounded-md">
                    <ReactQuill
                      theme="snow"
                      value={eventData?.description || ''}
                      onChange={handleChange}
                      placeholder="Add Description"
                      modules={modules}
                      formats={formats}
                      style={{ whiteSpace: 'pre-wrap' }}
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm text-gray-500 mb-1">Sectors</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {eventData?.categories?.map((category, index) => (
                        <div
                          key={index}
                          className="flex items-center bg-gray-200 rounded-full px-3 py-1 text-sm"
                        >
                          {category}
                          <button
                            type="button"
                            onClick={() => handleRemoveCategory(index)}
                            className="ml-2 text-gray-600 hover:text-gray-800"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={categoryInput}
                        onChange={(e) => {
                          setCategoryInput(e.target.value);
                          setIsDropdownOpen(true);
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search or add custom category"
                        className="w-full p-3 border rounded-md"
                      />
                      {isDropdownOpen && (categoryInput || filteredCategories.length > 0) && (
                        <div
                          ref={dropdownRef}
                          className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto"
                        >
                          {filteredCategories.map((category) => (
                            <button
                              key={category}
                              onClick={() => handleAddCategory(category)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100"
                            >
                              {category}
                            </button>
                          ))}
                          {categoryInput && !filteredCategories.includes(categoryInput) && (
                            <button
                              onClick={() => handleAddCategory(categoryInput)}
                              className="w-full text-left px-4 py-2 text-blue-600 hover:bg-gray-100"
                            >
                              Add "{categoryInput}"
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm text-gray-500 mb-1">Location</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Enter location or venue (e.g., 5-3/1, Santosh Nagar)"
                        value={locationInput}
                        onChange={handleLocationInputChange}
                        className="w-full p-3 border rounded-md"
                      />
                      {locationSuggestions.length > 0 && (
                        <ul
                          ref={dropdownRef}
                          className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-60 overflow-auto"
                        >
                          {locationSuggestions.map((suggestion, index) => (
                            <li
                              key={index}
                              onClick={() => handleSelectLocation(suggestion)}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            >
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    </div>

                  <div className="space-y-4">
                    <div className="pt-6 border-t">
                    <label className="block text-sm text-gray-500 mb-1">Schedule</label>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Application Start Date *</label>
                        <input
                          type="date"
                          className="w-full border rounded-md px-3 py-2"
                          value={eventData?.startDate || ''}
                         
                          onChange={(e) =>
                            setEventData((prev) => ({ ...prev, startDate: e.target.value }))
                          }
                          required
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Application End Date *</label>
                        <input
                          type="date"
                          className="w-full border rounded-md px-3 py-2"
                          value={eventData?.endDate || ''}
                          onChange={(e) =>
                            setEventData((prev) => ({ ...prev, endDate: e.target.value }))
                          }
                          min={eventData?.startDate}
                          required
                        />
                      </div>
                    </div>

                    <div className="pt-6 border-t">
                    <label className="block text-sm text-gray-500 mb-1">Additional Important Dates</label>
                      <h3 className="text-lg font-medium text-gray-700 mb-4"></h3>
                      <p className="text-xs text-gray-500 mb-4">
                        Add any additional program dates (e.g., Interview Rounds, Pitch Day, Demo Day)
                      </p>
                    </div>
                    <div className="space-y-4">
                      {eventData?.customFields?.map((field) => (
                        <div key={field.id}>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-sm text-gray-500">{field.name}</label>
                            <button
                              onClick={() => removeCustomField(field.id)}
                              className="text-red-500 hover:text-red-700"
                              aria-label="Remove field"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="date"
                              className="flex-1 border rounded-md px-3 py-2"
                              value={field.date}
                              onChange={(e) => updateCustomField(field.id, e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="pt-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter new date field name"
                          className="flex-1 border rounded-md px-3 py-2"
                          value={newFieldName}
                          onChange={(e) => setNewFieldName(e.target.value)}
                        />
                        <button
                          onClick={addCustomField}
                          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center gap-2"
                          disabled={!newFieldName.trim()}
                        >
                          <Plus className="w-4 h-4" />
                          Add Field
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                  disabled={isClosing}
                >
                  {isClosing ? 'Closing...' : 'Close'}
                </button>
                <button
                  onClick={handleSaveDraft}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save as Draft'}
                </button>
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <FormBuilderOptions
          programId={programId || generatedId}
          onOptionSelect={(option) => setSelectedFormOption(option)}
          onBack={() => setCurrentStep(1)}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          setShowCreateEvent={setShowCreateEvent}
          onFormLaunchSuccess={onFormLaunchSuccess}
          eventData={eventData}
        />
      )}
    </div>
  );
};
  const CompanyLogo = ({ companyDetails }) => {
    const [logoError, setLogoError] = useState(false);
  
    if (logoError || !companyDetails?.logoUrl) {
      return (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          <FontAwesomeIcon icon={faBuilding} className="text-gray-500" />
        </div>
      );
    }
  
    return (
      <img
        src={companyDetails.logoUrl}
        alt="Company Logo"
        className="w-8 h-8 rounded-full object-cover border border-gray-200"
        onError={() => setLogoError(true)}
      />
    );
  };

  const NavItem = ({ icon, label, active, onClick, className = '' }) => (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-100 ${
        active ? 'bg-gray-200 font-medium' : ''
      } ${className}`}
    >
      <FontAwesomeIcon icon={icon} />
      <span>{label}</span>
    </button>
  );

  const ProgramHeader = ({ 
    program, 
    onStatusChange 
  }) => {
    const handleToggle = () => {
      const newStatus = program.programStatus === 'completed' ? 'ddraft' : 'completed';
      onStatusChange(program.id, newStatus);
    };
  
    // Function to copy shareable link to clipboard
    const handleShare = () => {
      const shareableLink = `discover.getseco.com/program/${program.id}`;
      navigator.clipboard.writeText(shareableLink)
        .then(() => {
          createToast({
            title: "Link Copied!",
            description: "The program link has been copied to your clipboard.",
            actionText: "OK",
            actionCallback: () => {}
          });
        })
        .catch((error) => {
          console.error('Failed to copy link:', error);
          createToast({
            title: "Error",
            description: "Failed to copy the link. Please try again.",
            actionText: "OK",
            actionCallback: () => {}
          });
        });
    };
  
    return (
      <div className="md:px-36 overflow-none mt-8">
        <div className="border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-4xl font-bold">{program.name || 'Untitled Program'}</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {program.programStatus === 'completed' ? 'Active' : 'Inactive'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={program.programStatus === 'completed'}
                    onChange={handleToggle}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
              <button
                onClick={handleShare}
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2 text-sm"
              >
                <FontAwesomeIcon icon={faShareAlt} /> {/* Add faShareAlt to your imports */}
                Share
              </button>
            </div>
          </div>
          <div className="flex space-x-6">
            {['insights', 'formResponses', 'editProgram', 'addJudges'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveProgramTab(tab)}
                className={`text-sm font-medium pb-2 transition-colors duration-200 ${
                  activeProgramTab === tab
                    ? 'border-b-2 border-blue-500 text-blue-500 hover:bg-transparent hover:text-blue-500'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1).replace(/([A-Z])/g, ' $1')}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };
  const [judges, setJudges] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  
  // Update dependency array to include selectedProgram.id
  useEffect(() => {
    if (selectedProgram?.id) {
      fetchJudges();
    }
  }, [selectedProgram?.id]); // This will re-run whenever selectedProgram.id changes

  const fetchProgramDocument = async () => {
    try {
      const programmesRef = collection(db, 'programmes');
      const q = query(programmesRef, where('id', '==', selectedProgram.id));
      const snapshot = await getDocs(q);
  
      if (snapshot.empty) {
        console.error('No matching program found');
        return null;
      }
  
      const programDoc = snapshot.docs[0];
      return programDoc;
    } catch (error) {
      console.error('Error fetching program document:', error);
      return null;
    }
  };
  
  const fetchJudges = async () => {
    try {
      const programDoc = await fetchProgramDocument();
      if (!programDoc) {
        console.error('Program document not found');
        return;
      }
  
      // Query the judges collection directly with program filter
      const judgesRef = collection(db, 'judges');
      const q = query(judgesRef, where('programId', '==', selectedProgram.id));
      const snapshot = await getDocs(q);
      
      const judgesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setJudges(judgesList);
    } catch (error) {
      console.error('Error fetching judges:', error);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddJudge = async () => {
    if (!formData.name || !formData.email) {
     
      createToast({
        title: "Error Adding:",
        description: "Please fill in both name and email"
      });
      return;
    }
  
    setLoading(true);
    try {
      const programDoc = await fetchProgramDocument();
      if (!programDoc) {
        console.error('Program document not found');
        return;
      }
  
      // Generate a unique ID that will be used in both collections
      const judgeId = doc(collection(db, 'judges')).id;
  
      // Add to programmes/{programDoc.id}/judges subcollection
      await setDoc(doc(db, `programmes/${programDoc.id}/judges`, judgeId), {
        id: judgeId,
        name: formData.name,
        email: formData.email,
        createdAt: serverTimestamp()
      });
  
      // Add to separate judges collection
      await setDoc(doc(db, 'judges', judgeId), {
        id: judgeId,
        name: formData.name,
        email: formData.email,
        programId: selectedProgram.id,
        createdAt: serverTimestamp()
      });
  
      // Reset form and refresh judges list
      setFormData({ name: '', email: '' });
      fetchJudges();
    } catch (error) {
      console.error('Error adding judge:', error);

      // alert(' Please try again.');
      createToast({
        title: "Error adding judge:",
        description: "Please try again" // Remove the `+` before error.message
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemoveJudge = async (judgeId) => {
    if (window.confirm('Are you sure you want to remove this judge?')) {
      setLoading(true);
      try {
        const programDoc = await fetchProgramDocument();
        if (!programDoc) {
          console.error('Program document not found');
          return;
        }
  
        // Remove from programmes/{programDoc.id}/judges subcollection
        await deleteDoc(doc(db, `programmes/${programDoc.id}/judges`, judgeId));
  
        // Remove from separate judges collection using the same ID
        await deleteDoc(doc(db, 'judges', judgeId));
  
        fetchJudges();
      } catch (error) {
        console.error('Error removing judge:', error);
        createToast({
          title: "Error removing judge:",
          description: "Please try again" // Remove the `+` before error.message
        });
        // alert('. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

 // In FounderDashboard.js

const generateJudgeDashboardLink = (judgeId) => {
  return `discover.getseco.com/judge/${judgeId}`; // Use the React Router route
};

const handleTriggerEmails = async () => {
  setIsSendingEmails(true); // Using isSendingEmails instead of setLoading based on previous context
  
  try {
    emailjs.init('zdMI9GNYRKzA-jLsN'); // Replace with your EmailJS public key

    const emailPromises = judges.map(judge => {
      const judgingLink = generateJudgeDashboardLink(judge.id);

      const templateParams = {
        to_name: judge.name,
        to_email: judge.email,
        from_name: 'SECO',
        program_name: selectedProgram.name || 'Your Program Name',
        organizer: companyDetails?.name || 'Your Organizer Name',
        judging_link: judgingLink,
        your_organization: 'SECO',
        your_contact: 'contact@seco.com',
        message: '',
      };

      return emailjs.send(
        'service_2ebtwjp', // Replace with your EmailJS service ID
        'template_w26dqy4', // Replace with your EmailJS template ID
        templateParams
      );
    });

    await Promise.all(emailPromises);
    createToast({
      title: "Success",
      description: "Emails sent successfully to all judges!"
    });
  } catch (error) {
    console.error('Failed to send emails:', error);
    createToast({
      title: "Error",
      description: "Failed to send emails. Please try again."
    });
  } finally {
    setIsSendingEmails(false);
  }
};
  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 p-4 overflow-y-auto scrollbar-hide h-full">
        <div className="flex items-center gap-2 mb-6">
        <CompanyLogo companyDetails={companyDetails} />
          <span className="font-medium truncate">
            {companyDetails?.name || 'Loading...'}
          </span>
        </div>

        <nav className="space-y-1">
          <NavItem 
            icon={faHome}
            label="Home" 
            active={activeTab === 'home'} 
            onClick={() => setActiveTab('home')} 
          />
        </nav>

        <div className="mt-8">
          <div className="text-sm text-gray-500 mb-2">Programs</div>
          <div className="ml-2">
          {programmes.length > 0 ? (
  programmes.map((programme) => (
    <NavItem
      key={programme.id}
      icon={faFile}
      label={
        <>
          {programme.name || 'Untitled Program'}
          {programme.programStatus === 'draft' && (
            <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Draft</span>
          )}
        </>
      }
      active={selectedProgram?.id === programme.id}
      onClick={() => handleProgramClick(programme)}
    />
  ))
) : (
  <div className="text-gray-400 p-2">No programs available</div>
)}
          </div>
        </div>
        {isJudge && (
          <div className="mt-8">
            <div className="text-sm text-gray-500 mb-2">Judging Programmes</div>
            <div className="ml-2">
              {judgingProgrammes.length > 0 ? (
                judgingProgrammes.map((programme) => (
                  <NavItem
                    key={programme.id}
                    icon={faFile}
                    label={programme.name || 'Untitled Program'}
                    active={selectedProgram?.id === programme.id && isJudgingProgramSelected}
                    onClick={() => handleProgramClick(programme, true)}
                  />
                ))
              ) : (
                <div className="text-gray-400 p-2">No judging programs assigned</div>
              )}
            </div>
          </div>
        )}
        {/* Product section */}
        <div className="mt-8">
          <div className="text-sm text-gray-500 mb-2">Product</div>
          <nav className="space-y-1">
            <NavItem icon={faFile} label="Templates" />
            <NavItem icon={faMagic} label="What's new" />
            <NavItem icon={faMap} label="Roadmap" />
            <NavItem icon={faLightbulb} label="Feature requests" />
            <NavItem icon={faTrashAlt} label="Trash" />
          </nav>
        </div>

        {/* Help section */}
        <div className="mt-8">
          <div className="text-sm text-gray-500 mb-2">Help</div>
          <nav className="space-y-1">
            <NavItem icon={faRocket} label="Get started" />
            <NavItem icon={faBook} label="How-to guides" />
            <NavItem icon={faQuestion} label="Help center" />
            <NavItem icon={faCommentDots} label="Contact support" />
          </nav>
        </div>

        {/* Logout option */}
        <div className="mt-8 border-t pt-4">
          <NavItem 
            icon={faSignOutAlt}
            label="Logout" 
            onClick={handleLogout}
            className="text-red-600 hover:bg-red-50"
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
      <Header
          activeTab={activeTab}
          selectedApplication={selectedApplication}
          setActiveTab={setActiveTab}
          openSettings={openSettings}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          showCreateEvent={showCreateEvent}
          setShowCreateEvent={setShowCreateEvent}
        />
        <main className="flex-1 overflow-y-auto">
        {activeTab === 'home' && (
  <HomePage
    userStatus={userStatus}
    programid={programid}
    showCreateEvent={showCreateEvent}
    setShowCreateEvent={setShowCreateEvent}
    fetchProgrammes={fetchProgrammes}
    currentStep={currentStep}
    setCurrentStep={setCurrentStep}
    onFormLaunchSuccess={() => fetchProgrammes(auth.currentUser)}
    selectedProgram={selectedProgram}
    programStats={programmes} // Pass the enriched programmes data
  />
)}
          {activeTab === 'program' && selectedProgram && (
            <div className="h-full flex flex-col">
             <ProgramHeader 
                program={selectedProgram}
                
                onStatusChange={handleStatusChange}
              />
              <div className="flex-1 overflow-y-auto">
                {/* {activeProgramTab === 'insights' && (
                  <div className='md:px-36 overflow-none mt-8'>
                    <h3 className="text-lg font-semibold mb-4">Program Insights</h3>
                    
                  </div>
                )} */}
                
                {activeProgramTab === 'insights' && <ProgramInsights program={selectedProgram} />}


                {activeProgramTab === 'formResponses' && (
                  <div className="h-full">
                    <div className="md:px-36 overflow-none mt-8">
                      {isJudgingProgramSelected ? (
                        <JudgesFormResponses programId={selectedProgram.id} />
                      ) : (
                        <FormResponses programId={selectedProgram.id} />
                      )}
                    </div>
                  </div>
                )}




                {activeProgramTab === 'editProgram' &&  <FProgramEditPage programId={selectedProgram.id}/>
                  // <div className="md:px-36 overflow-none mt-8">
                  //   <h3 className="text-lg font-semibold mb-4">Edit Program</h3>
                  //   {/* Add edit program form */}
                  // </div>
                }
                
                {activeProgramTab === 'addJudges' && (
  <div className="md:px-36 overflow-none mt-8">
  <h3 className="text-lg font-semibold mb-4">Add Judges</h3>
  <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
    <div>
      <label className="block text-sm font-medium mb-1">Name</label>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        className="w-full px-3 py-2 border rounded-lg"
        placeholder="Enter judge's name"
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">Email</label>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleInputChange}
        className="w-full px-3 py-2 border rounded-lg"
        placeholder="Enter judge's email"
      />
    </div>
    <button
      type="button"
      onClick={handleAddJudge}
      disabled={loading}
      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
    >
      {isAdding ? 'Adding...' : 'Add Judge'}
    </button>
  </form>

  <div className="mt-8">
  <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold">Judges List</h4>
            <button
              type="button"
              onClick={handleTriggerEmails}
              disabled={loading || judges.length === 0}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-green-300"
            >
              {isSendingEmails ? 'Sending...' : 'Trigger Emails'}
            </button>
          </div>
    <ul className="space-y-4">
      {judges.map((judge) => (
        <li key={judge.id} className="flex justify-between items-center p-4 border rounded-lg">
          <div>
            <p className="font-medium">{judge.name}</p>
            <p className="text-sm text-gray-600">{judge.email}</p>
          </div>
          <button
            type="button"
            onClick={() => handleRemoveJudge(judge.id)}
            disabled={loading}
            className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 disabled:bg-red-300"
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  </div>
</div>
)}

              </div>
            </div>
          )}

{/*  */}
{/* <div className="h-[calc(100vh/1.16)] overflow-auto scrollbar-hide mt-8 mb-8">
{activeTab === 'settings' && renderSettingsForm()}

</div> */}
{activeTab === 'settings' && (
      <div className="flex-1 overflow-y-auto p-8">
        {renderSettingsForm()}
      </div>
    )}
        </main>
      </div>

      <button 
        className="fixed bottom-4 right-4 w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-700"
        aria-label="Help"
      >
        <FontAwesomeIcon icon={faQuestionCircle} size="lg" />
      </button>
    </div>
  );
};

export default FounderDashboard;
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
  faTrashAlt
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getAuth, signOut } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, getDocs, getFirestore, query, updateDoc, where,deleteDoc,setDoc,serverTimestamp } from 'firebase/firestore';
import { Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState,useCallback } from 'react';
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import './Dashboard.css';
import FormBuilder from './FormBuilder';
import FormResponses from './FormResponses';

import { useNavigate } from 'react-router-dom';
import SettingsForm from '../components/SettingsForm';
const generatedId = Math.floor(Math.random() * 1_000_000_000);


const FounderDashboard = () => {
  const [companyDetails, setCompanyDetails] = useState(null);
  const [logoError, setLogoError] = useState(false);
  const [programmes, setProgrammes] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [formResponses, setFormResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [activeProgramTab, setActiveProgramTab] = useState('summary');
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [error, setError] = useState(null);
  const [userStatus, setUserStatus] = useState(null);
  const [programid, setprogramid] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const FormBuilderOptions = ({ onOptionSelect, onBack,programId,currentStep, setCurrentStep,setShowCreateEvent ,onFormLaunchSuccess   }) => {
    const auth = getAuth();
    const user = auth.currentUser;
    return (
      <div className="max-w-4xl mx-auto p-4">
        {/* Directly render the FormBuilder */}
        <FormBuilder programId={programId} userId={user.uid} currentStep={currentStep}
          setCurrentStep={setCurrentStep}  setShowCreateEvent={setShowCreateEvent}    onFormLaunchSuccess={onFormLaunchSuccess}  // Pass fetchProgrammes as a prop
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
 
  useEffect(() => {
    const checkSession = () => {
      const sessionData = localStorage.getItem('sessionData');
      if (!sessionData) {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          if (user) {
            // User is still signed in with Firebase, create new session
            const newSession = {
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hour session
              userId: user.uid
            };
            localStorage.setItem('sessionData', JSON.stringify(newSession));
            loadAllData();
          } else {
            navigate('/signup');
          }
        });
        return () => unsubscribe();
      }
  
      const { expiresAt } = JSON.parse(sessionData);
      const now = new Date().getTime();
      const expiration = new Date(expiresAt).getTime();
      
      if (now >= expiration) {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          if (user) {
            // User is still signed in with Firebase, refresh session
            const newSession = {
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              userId: user.uid
            };
            localStorage.setItem('sessionData', JSON.stringify(newSession));
            loadAllData();
          } else {
            handleLogout();
          }
        });
        return () => unsubscribe();
      }
    };
  
    checkSession();
    // Check session every minute
    const interval = setInterval(checkSession, 300000);
    
    return () => clearInterval(interval);
  }, []);
 
  // Auth state change effect
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // User is signed in, check/create session
        let sessionData = localStorage.getItem('sessionData');
        let session = sessionData ? JSON.parse(sessionData) : null;
        
        const now = new Date().getTime();
        const needsNewSession = !session || 
          now >= new Date(session.expiresAt).getTime() || 
          session.userId !== user.uid;

        if (needsNewSession) {
          // Create new session
          session = {
            expiresAt: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
            userId: user.uid
          };
          localStorage.setItem('sessionData', JSON.stringify(session));
        }

        // Load data regardless of session status
        loadAllData();
      } else {
        // No user is signed in
        localStorage.removeItem('sessionData');
        navigate('/signup');
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);
  // Modified loadAllData function
  
// Pass reloadCompanyDetails to SettingsForm
const renderSettingsForm = () => (
  <SettingsForm onProfileUpdate={reloadCompanyDetails} />
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

  // Function to fetch programmes
 // Inside FounderDashboard component
const fetchProgrammes = useCallback(async (user) => {
  try {
    const programmesQuery = await getDocs(
      query(
        collection(db, 'programmes'),
        where('uid', '==', user.uid),
        where('programStatus', '==', 'completed')
      )      
    );
    
    const fetchedProgrammes = programmesQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    setProgrammes(fetchedProgrammes);
  } catch (error) {
    console.error('Error fetching programmes:', error);
    setError('Failed to load programmes');
    setProgrammes([]);
  }
}, [db]); // Add dependency array
  
  // Add reload function to handle manual reloads
  const handleReload = () => {
    loadAllData();
  };

  // Inside FounderDashboard component
useEffect(() => {
  const fetchData = async () => {
    const user = auth.currentUser;
    if (user) {
      await fetchProgrammes(user);
    }
  };
  fetchData();
}, [auth, fetchProgrammes]); // Add fetchProgrammes to dependencies
  // Fetch company details
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const user = auth.currentUser;
        // if (!user) {
        //   navigate('/signup');
        //   return;
        // }

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCompanyDetails({
            name: userData.companyName || 'Company Name',
            logo: userData.logoUrl || userData.companyLogo || null
          });
        }
      } catch (error) {
        console.error('Error fetching company details:', error);
        setCompanyDetails({ name: 'Company Name', logo: null });
      }
    };

    fetchCompanyDetails();
  }, [auth, db, navigate]);

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
  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const user = auth.currentUser;
    if (!user) return;

    try {
      await Promise.all([
        fetchCompanyDetails(user),
        fetchProgrammes(user)
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load some data');
    } finally {
      setLoading(false);
    }
  }, [auth, fetchCompanyDetails]);
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
  currentStep, 
  setCurrentStep,
  onFormLaunchSuccess   }) => {
    const auth = getAuth();
  const db = getFirestore();
  //  const [showCreateEvent, setShowCreateEvent] = useState(false);
  // const [currentStep, setCurrentStep] = useState(1);
  const [eventData, setEventData] = useState(null);
  const [isClosing, setIsClosing] = useState(false); // Add state to track closing operation

  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/signup');
          return;
        }

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
  const handleClose = async () => {
    setIsClosing(true); // Set closing state

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("uid", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDocRef = querySnapshot.docs[0].ref;
        await updateDoc(userDocRef, {
          programStatus: "completed",
          programid: null,
        });
      }

      setShowCreateEvent(false);
      setCurrentStep(1);

      // Keep isClosing true for 2 seconds after the form closes
      setTimeout(() => {
        setIsClosing(false);
      }, 2000);

    } catch (error) {
      console.error('Error closing form:', error);
      setIsClosing(false);
    }
  };
  useEffect(() => {
    // Only proceed if not currently closing
    if (isClosing) return;

    if (userStatus === 'active' && programid) {
      // Add a delay before checking program status
      const timer = setTimeout(() => {
        const fetchExistingProgram = async () => {
          try {
            const programmesRef = collection(db, 'programmes');
            const q = query(programmesRef, where('id', '==', programid));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
              const programData = querySnapshot.docs[0].data();
              setEventData(programData);
              setShowCreateEvent(true);
            }
          } catch (error) {
            console.error('Error fetching existing program:', error);
          }
        };
    
        fetchExistingProgram();
      }, 2000); // 2 second delay

      return () => clearTimeout(timer);
    }
  }, [userStatus, programid, isClosing]);
  return (
    <div className="md:px-56 overflow-auto mt-8">
      {/* <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Welcome to your dashboard</h2>
      </div> */}
      {!showCreateEvent && (
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold font-sans-serif">Home</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateEvent(true)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md flex items-center gap-2"
            >
             <FontAwesomeIcon icon={faPlus} size="sm" />
            </button>
            <button
              onClick={() => setShowCreateEvent(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2"
            >
              
              New Program
            </button>
          </div>
        </div>
      )}
{!showCreateEvent && (<div className="border-b border-gray-300 mt-4">
        {/* Placeholder for additional content */}
      </div> )}
      
      

     
 
     
      {showCreateEvent ? (
      <CreateEventForm 
      onClose={handleClose}
      initialData={eventData}
      programId={programid}
      currentStep={currentStep}
      setCurrentStep={setCurrentStep}
      isClosing={isClosing}
      onFormLaunchSuccess={onFormLaunchSuccess} // Pass fetchProgrammes as a prop
    />
      ) : (
        // Rest of your existing HomePage content
        <div className="flex-1 flex flex-col items-center justify-center mt-28">
        <div className="bg-gray-50 rounded-lg p-8 max-w-lg w-full text-center">  
          <div className="mb-4">
            <Plus className="w-12 h-12 text-gray-400 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Create your first form</h2>
          <p className="text-gray-600 mb-6">
            Get started by creating an event, program, or cohort to begin collecting responses.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setShowCreateEvent(true)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50 flex items-center gap-2"
            >
              <Plus size={16} />
             
            </button>
            <button
              onClick={() => setShowCreateEvent(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
             
              New Program
            </button>
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


  const handleProgramClick = (program) => {
    setActiveTab('program');
    setSelectedProgram(program);
    setActiveProgramTab('summary');
    setFormResponses([]);
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
  const CreateEventForm = ({ onClose, 
    initialData, 
    programId,
    currentStep,
    setCurrentStep,
    fetchProgrammes ,
    isClosing,
    onFormLaunchSuccess  }) => {
    // console.log('Initial Data:', initialData); // Enhanced logging
    // const [currentStep, setCurrentStep] = useState(1);

    // const [currentStep, setCurrentStep] = useState(1);
  const [eventImage, setEventImage] = useState(null);
  const [skipForm, setSkipForm] = useState(false);
  const [selectedFormOption, setSelectedFormOption] = useState(null);
  const [newFieldName, setNewFieldName] = useState('');
  // const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    console.log('Current Step:', currentStep);
  }, [currentStep]);
  // Single source of truth for event data
  const [eventData, setEventData] = useState({
    name: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    sector: '',
    location: '',
    description: '',
    Eligibility: '',
    Incentives: '',
    isPublic: true,
    calendar: 'Google Calendar',
    customFields: []
  });

  // Use useEffect to update state when initialData changes
  useEffect(() => {
    if (initialData) {
      console.log('Updating event data with initial data:', initialData);
      setEventData(prevData => ({
        ...prevData,
        name: initialData.name || '',
        startDate: initialData.startDate || '',
        endDate: initialData.endDate || '',
        sector: initialData.sector || '',
        location: initialData.location || '',
        description: initialData.description || '',
        isPublic: initialData.isPublic !== undefined ? initialData.isPublic : true,
        calendar: initialData.calendar || 'Google Calendar',
        customFields: initialData.customFields || []
      }));

      if (initialData.image) {
        setEventImage(initialData.image);
      }
    }
  }, [initialData]);
    const modules = {
      toolbar: [
        [{ 'header': '1'}, { 'header': '2'}],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
       [{'link': 'text'}],
      ],
    };
    
    const formats = [
      'header', 'bold', 'italic', 'underline', 'strike',
      'list', 'bullet', 'link', 'image', 'check'
    ];
    
    
    const [description, setDescription] = useState("");

    const handleChange = (value) => {
      setEventData({ ...eventData, description: value });
    };
    const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setEventImage(reader.result);
        };
        reader.readAsDataURL(file);
      }
    };
  
    const handleNext = () => {
      handleSubmit(() => {
        // fetchProgrammes(auth.currentUser); // Refresh the programmes list
        setCurrentStep(2);
      });
    };
  
    const handleBack = () => {
      setCurrentStep(1);
    };
    const handleStepChange = (step) => {
      setCurrentStep(step);
    };
  
   
  
    // Add these functions for managing custom fields
    const addCustomField = () => {
      if (newFieldName.trim()) {
        setEventData({
          ...eventData,
          customFields: [
            ...eventData.customFields,
            { id: Date.now(), name: newFieldName.trim(), date: '' }
          ]
        });
        setNewFieldName('');
      }
    };
  
    const removeCustomField = (id) => {
      setEventData({
        ...eventData,
        customFields: eventData.customFields.filter(field => field.id !== id)
      });
    };
  
    const updateCustomField = (id, date) => {
      setEventData({
        ...eventData,
        customFields: eventData.customFields.map(field => 
          field.id === id ? { ...field, date } : field
        )
      });
    };
  
    const handleSubmit = async (onSuccess) => {
      try {
        if (programId) {
          // Update existing program
          const programmesRef = collection(db, 'programmes');
          const q = query(programmesRef, where('id', '==', programId));
          const querySnapshot = await getDocs(q);
    
          if (!querySnapshot.empty) {
            const docRef = doc(db, 'programmes', querySnapshot.docs[0].id);
            await updateDoc(docRef, {
              ...eventData,
              image: eventImage,
              programStatus: 'active',
              updatedAt: new Date(),
            });
    
            // Update user's program status and program ID
            const usersQuery = query(
              collection(db, 'users'),
              where('uid', '==', auth.currentUser.uid)
            );
            const userSnapshot = await getDocs(usersQuery);
    
            if (!userSnapshot.empty) {
              const userDoc = userSnapshot.docs[0];
              const userDocRef = doc(db, 'users', userDoc.id);
              await updateDoc(userDocRef, {
                programStatus: 'active', // Update the status to 'active' or a relevant value
                programid: programId, // Update the programId field
              });
            }
          }
        } else {
          // Create new program
          const docRef = await addDoc(collection(db, 'programmes'), {
            ...eventData,
            image: eventImage,
            id: generatedId,
            uid: auth.currentUser.uid,
            programStatus: 'active',
            createdAt: new Date(),
          });
    
          // Update user's program status
          const usersQuery = query(
            collection(db, 'users'),
            where('uid', '==', auth.currentUser.uid)
          );
          const querySnapshot = await getDocs(usersQuery);
    
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userDocRef = doc(db, 'users', userDoc.id);
            await updateDoc(userDocRef, {
              programStatus: 'active',
              programid: generatedId,
            });
          }
        }
    
        // Call the onSuccess callback to refresh the programmes list
        if (onSuccess) {
          onSuccess();
        }
      } catch (e) {
        console.error('Error saving program: ', e);
      }
    };
    useEffect(() => {
      console.log('Current eventData:', eventData);
    }, [eventData]);

    const handleClose = () => {
      if (isClosing) return;
      onClose();
    };
    return (
      <div className="max-w-4xl mx-auto p-4">
        
  
        <StepIndicator currentStep={currentStep} />
        <div className="border-b border-gray-300 mt-4">
        {/* Placeholder for additional content */}
      </div> 
     
        {currentStep === 1 ? (
           <><div className="flex items-center justify-between mb-6 mt-8">
            <input
              type="text"
              placeholder="Event Name"
              className="w-full text-2xl font-light border-none focus:outline-none focus:ring-0"
              value={eventData.name || ''}
              onChange={(e) => setEventData(prev => ({ ...prev, name: e.target.value }))} />
          </div><div className="grid grid-cols-3 gap-6">
              {/* Left column - Image upload */}
              <div className="col-span-1">
                <Card>
                  <CardContent className="p-0">
                    <div
                      className="relative aspect-square bg-gray-100 flex items-center justify-center cursor-pointer rounded-lg overflow-hidden"
                      onClick={() => document.getElementById('imageUpload').click()}
                    >
                      {eventImage ? (
                        <img
                          src={eventImage}
                          alt="Event"
                          className="w-full h-full object-contain" />
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
                        onChange={handleImageUpload} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right column - Event details */}
              <div className="col-span-2">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="w-full p-3 rounded-md">
                      <ReactQuill
                        theme="snow"
                        value={eventData.description}
                        onChange={handleChange}
                        placeholder="Add Description"
                        modules={modules} // Use the custom toolbar
                        formats={formats} // Supported formats
                        style={{ whiteSpace: 'pre-wrap' }} // Preserve line breaks
                      />
                    </div>

                    {/* Sector dropdown */}
                    <div className="mb-6">
                      <label className="block text-sm text-gray-500 mb-1">Please Select Your sector</label>
                      <select
                        value={eventData.sector}
                        onChange={(e) => setEventData({ ...eventData, sector: e.target.value })}
                        className="w-full p-3 border rounded-md"
                      >
                        <option value="" disabled>Select Sector</option>
                        <option value="Technology">Technology</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Finance">Finance</option>
                        <option value="Education">Education</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Retail">Retail</option>
                      </select>
                    </div>

                    {/* Required Date Fields */}
                    <div className="space-y-4">
                      <div className="pt-6 border-t">
                        <h3 className="text-lg font-medium text-gray-700 mb-4">Schedule of the event</h3>

                      </div>
                      <div className="flex gap-4">
    <div className="flex-1">
        <label className="block text-sm text-gray-500 mb-1">
            Application Start Date *
        </label>
        <input
            type="date"
            className="w-full border rounded-md px-3 py-2"
            value={eventData.startDate}
            onChange={(e) => setEventData({ ...eventData, startDate: e.target.value })}
            required />
    </div>
    <div className="flex-1">
        <label className="block text-sm text-gray-500 mb-1">
            Application End Date *
        </label>
        <input
            type="date"
            className="w-full border rounded-md px-3 py-2"
            value={eventData.endDate}
            onChange={(e) => setEventData({ ...eventData, endDate: e.target.value })}
            min={eventData.startDate} // Add min attribute to prevent earlier dates
            required />
    </div>
</div>

                      {/* Custom Date Fields */}
                      <div className="pt-6 border-t">
                        <h3 className="text-lg font-medium text-gray-700 mb-4">Additional Important Dates</h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Add any additional program dates (e.g., Interview Rounds, Pitch Day, Demo Day)
                        </p>
                      </div>
<div className='additional-dates-container space-y-4'>
                      {eventData.customFields.map(field => (
                        <div key={field.id}>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-sm text-gray-500">
                              {field.name}
                            </label>
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
                              onChange={(e) => updateCustomField(field.id, e.target.value)} />
                          </div>
                        </div>
                      ))}
</div>
                      {/* Add Custom Field Input */}
                      <div className="pt-4">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Enter new date field name"
                            className="flex-1 border rounded-md px-3 py-2"
                            value={newFieldName}
                            onChange={(e) => setNewFieldName(e.target.value)} />
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
                  </CardContent>
                </Card>

                {/* Buttons */}
                <div className="flex justify-end gap-4 mt-6">
                <button 
          onClick={handleClose}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
          disabled={isClosing}
        >
          {isClosing ? 'Closing...' : 'Cancel'}
        </button>
                  {/* <button
      onClick={() => {
        handleSubmit();
        setSkipForm(true);
        setCurrentStep(3);
      }}
      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
    >
      Review and Launch
    </button> */}
                  <button
                    onClick={handleNext}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div></>
        ) : (
          <FormBuilderOptions
    programId={userStatus === 'active' ? programid : generatedId}
    onOptionSelect={(option) => {
      setSelectedFormOption(option);
    }}
    onBack={handleBack}
    currentStep={currentStep}
    setCurrentStep={setCurrentStep}
    setShowCreateEvent={setShowCreateEvent} // Pass this prop
    onFormLaunchSuccess={onFormLaunchSuccess}
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

  const ProgramHeader = ({ program }) => (
    <div className="md:px-56 overflow-none mt-8">
    <div className="border-b border-gray-200 p-4">
      <h2 className="text-2xl font-bold mb-4">{program.name || 'Untitled Program'}</h2>
      <div className="flex space-x-6">
        {['summary', 'formResponses', 'editProgram', 'editForm','addJudges'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveProgramTab(tab)}
            className={`text-sm font-medium pb-2 ${
              activeProgramTab === tab
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1).replace(/([A-Z])/g, ' $1')}
          </button>
        ))}
      </div>
    </div>
    </div>
  );
  
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
      alert('Please fill in both name and email');
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
      alert('Error adding judge. Please try again.');
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
        alert('Error removing judge. Please try again.');
      } finally {
        setLoading(false);
      }
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
                  label={programme.name || 'Untitled Program'}
                  active={selectedProgram?.id === programme.id}
                  onClick={() => handleProgramClick(programme)}
                />
              ))
            ) : (
              <div className="text-gray-400 p-2">No programs available</div>
            )}
          </div>
        </div>

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
        {activeTab === 'home' && <HomePage 
              userStatus={userStatus} 
              programid={programid}
              showCreateEvent={showCreateEvent}
              setShowCreateEvent={setShowCreateEvent}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              onFormLaunchSuccess={() => fetchProgrammes(auth.currentUser)}
            />}
          {activeTab === 'program' && selectedProgram && (
            <div className="h-full flex flex-col">
              <ProgramHeader program={selectedProgram} />
              <div className="flex-1 overflow-y-auto">
                {activeProgramTab === 'summary' && (
                  <div className='md:px-56 overflow-none mt-8'>
                    <h3 className="text-lg font-semibold mb-4">Program Summary</h3>
                    {/* Add program summary content */}
                  </div>
                )}
                



{activeProgramTab === 'formResponses' && (
    <div className="h-full">
      <div className="md:px-56 overflow-none mt-8">
      <div className="">
        <div className="flex justify-between items-center mb-6">
          {/* <h3 className="text-lg font-semibold">Form Responses</h3>
          <div className="text-sm text-gray-500">
          Total responses: {formResponses.length}
        </div> */}
        </div>
        <FormResponses programId={selectedProgram.id} />
      </div>
      </div>
    </div>
  )}




                {activeProgramTab === 'editProgram' && (
                  <div className="md:px-56 overflow-none mt-8">
                    <h3 className="text-lg font-semibold mb-4">Edit Program</h3>
                    {/* Add edit program form */}
                  </div>
                )}
                {activeProgramTab === 'editForm' && (
                  <div className="md:px-56 overflow-none mt-8">
                    <h3 className="text-lg font-semibold mb-4">Edit Form</h3>
                    {/* Add edit form content */}
                  </div>
                )}
                {activeProgramTab === 'addJudges' && (
  <div className="md:px-56 overflow-none mt-8">
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
      {loading ? 'Adding...' : 'Add Judge'}
    </button>
  </form>

  <div className="mt-8">
    <h4 className="text-lg font-semibold mb-4">Judges List</h4>
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
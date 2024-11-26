import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBook,
  faCog,
  faCommentDots,
  faFile,
  faHome,
  faLightbulb,
  faMagic,
  faMap,
  faQuestion,
  faQuestionCircle,
  faRocket,
  faSignOutAlt,
  faCamera,
  faLocationDot,
  faPlus,
  faTrashAlt,
  faBuilding
} from '@fortawesome/free-solid-svg-icons';
import FormResponses from './FormResponses';
import { getAuth, signOut } from 'firebase/auth';
import FormBuilder from './FormBuilder';

import { getFirestore, doc, getDoc, getDocs, query, where, collection,addDoc } from 'firebase/firestore';
import { Search, Settings, Plus, HelpCircle, Upload, Sparkles } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
const generatedId = Math.floor(Math.random() * 1_000_000_000);
const FormBuilderOptions = ({ onOptionSelect, onBack}) => {
  const [submittedId, setSubmittedId] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  const [showFormBuilder, setShowFormBuilder] = useState(false);
  
  const options = [
    {
      icon: <Plus className="w-12 h-12 text-gray-600" />,
      title: "Start from scratch",
      description: "Build from a list of ready-made form elements.",
      value: "scratch"
    },
    {
      icon: <Upload className="w-12 h-12 text-gray-600" />,
      title: "Import questions",
      description: "Copy and paste questions or import from Google Forms.",
      value: "import"
    },
    {
      icon: <Sparkles className="w-12 h-12 text-gray-600" />,
      title: "Create with AI",
      description: "Use AI to help generate questions for any form.",
      value: "ai"
    }
  ];

  const handleOptionSelect = (value) => {
    if (value === 'scratch' || value === 'import') {
      setShowFormBuilder(true);
    } else {
      onOptionSelect(value);
    }
  };

  if (showFormBuilder) {
    return (
      <div className="w-full">
        setCurrentStep(3) // Skip to review
        <FormBuilder programId={generatedId} />
        <div className="fixed bottom-4 right-4">
          <button
            onClick={() => setShowFormBuilder(false)}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            Back
          </button>
        </div>
      </div>
    );
  }
  

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-center mb-2">How do you want to build your form?</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {options.map((option) => (
          <div
            key={option.value}
            onClick={() => handleOptionSelect(option.value)}
            className="cursor-pointer transform transition-transform hover:scale-105"
          >
            <div className="h-full p-6 border rounded-lg flex flex-col items-center text-center hover:shadow-lg transition-shadow bg-white">
              <div className="mb-4">
                {option.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{option.title}</h3>
              <p className="text-gray-600 text-sm">{option.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-start mt-6">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
        >
          Back
        </button>
      </div>
    </div>
  );
};
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

  
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();

  // Fetch company details
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/signup');
          return;
        }

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCompanyDetails({
            name: userData.companyName || 'Company Name',
            logo: userData.logo || userData.companyLogo || null
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
      await signOut(auth);
      navigate('/signup');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  const CreateEventForm = ({ onClose }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [eventImage, setEventImage] = useState(null);
    const [skipForm, setSkipForm] = useState(false);
    const [selectedFormOption, setSelectedFormOption] = useState(null);
    const [submittedId, setSubmittedId] = useState(null);
    const [showFormBuilder, setShowFormBuilder] = useState(false);


    const [eventData, setEventData] = useState({
      title: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      location: '',
      description: '',
      eligibility: '',
      incentives: '',
      isPublic: true,
      calendar: 'Google Calendar'
    });
  
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
      setCurrentStep(2);
    };
  
    const handleBack = () => {
      setCurrentStep(1);
    };
  
    const handleSubmit = async () => {
      try {
        // Generate a unique numeric ID for the event
        
    
        const docRef = await addDoc(collection(db, 'programmes'), {
          ...eventData,
          image: eventImage,
          id: generatedId, // Use the generated numeric ID here
          uid: auth.currentUser.uid,
          createdAt: new Date(),
        });
    
        // Alert the generated ID
        alert(`Event added with ID: ${generatedId}`);
        console.log(`Event added with ID: ${generatedId}`);
    
        // Save the submitted ID
        setSubmittedId(docRef.id);
    
        // Navigate to the next step
        setShowFormBuilder(true); // This assumes showFormBuilder starts step 3
      } catch (e) {
        console.error('Error adding event: ', e);
      }
    };
    
    
    
  
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Create Event</h1>
        </div>
  
        <StepIndicator currentStep={currentStep} />
  
        {currentStep === 1 ? (
          <div className="grid grid-cols-3 gap-6">
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
                        className="w-full h-full object-cover"
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
                </CardContent>
              </Card>
            </div>
  
            {/* Right column - Event details */}
            <div className="col-span-2">
              <Card>
                <CardContent className="p-6 space-y-6">
                  <input
                    type="text"
                    placeholder="Event Name"
                    className="w-full text-2xl font-light border-none focus:outline-none focus:ring-0"
                    value={eventData.name}
                    onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                  />
  
                  {/* Date and time */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Start</label>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          className="flex-1 border rounded-md px-3 py-2"
                          value={eventData.startDate}
                          onChange={(e) => setEventData({ ...eventData, startDate: e.target.value })}
                        />
                        <input
                          type="time"
                          className="w-32 border rounded-md px-3 py-2"
                          value={eventData.startTime}
                          onChange={(e) => setEventData({ ...eventData, startTime: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">End</label>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          className="flex-1 border rounded-md px-3 py-2"
                          value={eventData.endDate}
                          onChange={(e) => setEventData({ ...eventData, endDate: e.target.value })}
                        />
                        <input
                          type="time"
                          className="w-32 border rounded-md px-3 py-2"
                          value={eventData.endTime}
                          onChange={(e) => setEventData({ ...eventData, endTime: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
  
                  {/* Location */}
                  <div className="relative">
                    <FontAwesomeIcon icon={faLocationDot} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Add Event Location"
                      className="w-full pl-10 pr-3 py-2 border rounded-md"
                      value={eventData.location}
                      onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                    />
                  </div>
  
                  {/* Description, Eligibility, Incentives */}
                  <textarea
                    placeholder="Add Description"
                    className="w-full p-3 border rounded-md min-h-[20px]"
                    value={eventData.description}
                    onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                  />
                  
                  <textarea
                    placeholder="Add Eligibility"
                    className="w-full p-3 border rounded-md min-h-[20px]"
                    value={eventData.Eligibility}
                    onChange={(e) => setEventData({ ...eventData, eligibility: e.target.value })}
                  />
  
                  <textarea
                    placeholder="Add Incentives"
                    className="w-full p-3 border rounded-md min-h-[20px]"
                    value={eventData.Incentives}
                    onChange={(e) => setEventData({ ...eventData, incentives: e.target.value })}
                  />
                </CardContent>
              </Card>
  
              {/* Buttons */}
              <div className="flex justify-end gap-4 mt-6">
    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
      Cancel
    </button>
    <button 
      onClick={() => {
        handleSubmit()
        // setSkipForm(true);
        setCurrentStep(3); // Skip to review
        handleNext()
      }}
      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
    >
      Next
    </button>
    {/* <button
      onClick=
      className="px-4 py-2 bg-purple-600 text-white rounded-md"
    >
      Next
    </button> */}
  </div>
            </div>
          </div>
          
        ) : (
          <FormBuilderOptions
            onOptionSelect={(option) => {
              setSelectedFormOption(option);
            }}
            // onBack={() => setCurrentStep(1)}
          />
        )}
      </div>
    );
  };
  const CompanyLogo = () => {
    if (logoError || !companyDetails?.logo) {
      return (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          <FontAwesomeIcon icon={faBuilding} className="text-gray-500" />
        </div>
      );
    }
    return (
      <img 
        src={companyDetails.logo}
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
    <div className="border-b border-gray-200 p-4">
      <h2 className="text-2xl font-bold mb-4">{program.title || 'Untitled Program'}</h2>
      <div className="flex space-x-6">
        {['summary', 'formResponses', 'editProgram', 'editForm'].map((tab) => (
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
  );

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 p-4 overflow-y-auto scrollbar-none h-full">
        <div className="flex items-center gap-2 mb-6">
          <CompanyLogo />
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
                  label={programme.title || 'Untitled Program'}
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
      <div className="flex-1 overflow-auto">
        <main className="h-full">
          {activeTab === 'home' && (
            <div className="p-4">
              <h2 className="text-2xl font-bold mb-4">Welcome to your dashboard</h2>
            </div>
          )}
          
          {activeTab === 'program' && selectedProgram && (
            <div className="h-full">
              <ProgramHeader program={selectedProgram} />
              <div className="p-4">
                {activeProgramTab === 'summary' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Program Summary</h3>
                    {/* Add program summary content */}
                  </div>
                )}
                



{activeProgramTab === 'formResponses' && (
    <div className="h-full">
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          {/* <h3 className="text-lg font-semibold">Form Responses</h3>
          <div className="text-sm text-gray-500">
          Total responses: {formResponses.length}
        </div> */}
        </div>
        <FormResponses programId={selectedProgram.id} />
      </div>
    </div>
  )}




                {activeProgramTab === 'editProgram' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Edit Program</h3>
                    {/* Add edit program form */}
                  </div>
                )}
                {activeProgramTab === 'editForm' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Edit Form</h3>
                    {/* Add edit form content */}
                  </div>
                )}
              </div>
            </div>
          )}

{!showCreateEvent ? (
            <>
              <div className="flex justify-end gap-2 mb-8">
                <button 
                  onClick={() => setShowCreateEvent(true)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md flex items-center gap-2"
                >
                  New Event
                </button>
                <button
                  onClick={() => setShowCreateEvent(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faPlus} size="sm" />
                  New program
                </button>
              </div>

              <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
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
                      New Event
                    </button>
                    <button
                      onClick={() => setShowCreateEvent(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Plus size={16} />
                      New Program
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Regular dashboard content */}
              {activeTab === 'formResponses' && <FormResponses />}
            </>
          ) : (
            <CreateEventForm onClose={() => setShowCreateEvent(false)} />
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
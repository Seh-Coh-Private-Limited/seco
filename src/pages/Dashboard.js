import {
  faBook,
  faBuilding,
  faCamera,
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
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getAuth, signOut } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import './Dashboard.css';
import FormBuilder from './FormBuilder';
import FormResponses from './FormResponses';

import { useNavigate } from 'react-router-dom';
import SettingsForm from '../components/SettingsForm';
const generatedId = Math.floor(Math.random() * 1_000_000_000);
const FormBuilderOptions = ({ onOptionSelect, onBack,programId }) => {
  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Directly render the FormBuilder */}
      <FormBuilder programId={programId}/>

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
  const [selectedApplication, setSelectedApplication] = useState(null);

  
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

  const openSettings = () => {
    setActiveTab('settings'); // Switch to settings view
  };
  

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
const HomePage = () => {
  return (
    <div className="md:px-56 overflow-none mt-8">
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
      
      

     
 
      {!showCreateEvent ? (
        
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
      ) : (
        <CreateEventForm onClose={() => setShowCreateEvent(false)} />
      )}
    </div>
  );
};
const Header = ({ activeTab, selectedApplication, setActiveTab, openSettings }) => {
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

        {/* <Breadcrumb 
          activeTab={activeTab} 
          selectedApplication={selectedApplication}
          setActiveTab={setActiveTab}
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
    const [newFieldName, setNewFieldName] = useState('');
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
      customFields: [] // Add this for dynamic date fields
    });
    const modules = {
      toolbar: [
        [{ 'header': '1'}, { 'header': '2'}, { 'header': '3'}, { 'font': [] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'image'],
        ['clean'],
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
      handleSubmit();
      setCurrentStep(2);
     
    };
  
    const handleBack = () => {
      setCurrentStep(1);
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
  
    const handleSubmit = async () => {
      try {
        const docRef = await addDoc(collection(db, 'programmes'), {
          ...eventData,
          image: eventImage,
          id: generatedId,
          uid: auth.currentUser.uid,
          createdAt: new Date(),
        });
        console.log('Event added with ID:', docRef.id);
        // onClose();
      } catch (e) {
        console.error('Error adding event: ', e);
      }
    };
  
    return (
      <div className="max-w-4xl mx-auto p-4">
        
  
        <StepIndicator currentStep={currentStep} />
        <div className="border-b border-gray-300 mt-4">
        {/* Placeholder for additional content */}
      </div> 
      <div className="flex items-center justify-between mb-6 mt-8">
          <input
            type="text"
            placeholder="Event Name"
            className="w-full text-2xl font-light border-none focus:outline-none focus:ring-0"
            value={eventData.name}
            onChange={(e) => setEventData({ ...eventData, name: e.target.value })}
          />
        </div>
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
                </CardContent>
              </Card>
            </div>
  
            {/* Right column - Event details */}
            <div className="col-span-2">
              <Card>
                <CardContent className="p-6 space-y-6">
                <div className="w-full p-3 border rounded-md">
      <ReactQuill
        theme="snow"
        value={eventData.description}
        onChange={handleChange}
        placeholder="Add Description"
        modules={modules}  // Use the custom toolbar
        formats={formats}  // Supported formats
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
        required
      />
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
        required
      />
    </div></div>
  
                    {/* Custom Date Fields */}
                    <div className="pt-6 border-t">
                      <h3 className="text-lg font-medium text-gray-700 mb-4">Additional Important Dates</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Add any additional program dates (e.g., Interview Rounds, Pitch Day, Demo Day)
                      </p>
                    </div>
  
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
                            onChange={(e) => updateCustomField(field.id, e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
  
                    {/* Add Custom Field Input */}
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
                </CardContent>
              </Card>
  
              {/* Buttons */}
              <div className="flex justify-end gap-4 mt-6">
                <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
                  Cancel
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
          </div>
        ) : (
          <FormBuilderOptions
          programId={generatedId}
            onOptionSelect={(option) => {
              setSelectedFormOption(option);
            }}
            onBack={() => setCurrentStep(1)}
          />
        )}
      </div>
    );
  };
  const CompanyLogo = () => {
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
      <Header 
  activeTab={activeTab}
  selectedApplication={selectedApplication}
  setActiveTab={setActiveTab}
  openSettings={openSettings}
/>
        <main className="h-full">
        {activeTab === 'home' && <HomePage />}
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

{/*  */}
<div className="h-[calc(100vh/1.16)] overflow-auto scrollbar-hide mt-8 mb-8">
  {activeTab === 'settings' && (
    <SettingsForm />
  )}
</div>
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
import {
  faBook,
  faCog,
  faCommentDots,
  faFile,
  faGlobe,
  faHome,
  faLightbulb,
  faMagic,
  faMap,
  faPlus,
  faQuestion,
  faQuestionCircle,
  faRocket,
  faSearch,
  faStar,
  faTrashAlt,
  faUsers,
  faCamera,
  faLocationDot,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { Search, Settings, Plus, HelpCircle, Upload, Sparkles } from 'lucide-react';
import FormBuilder from './FormBuilder';
import { db } from '../firebase';  // Import the db from firebase.js
import { collection, addDoc } from 'firebase/firestore';
import FormResponses from './FormResponses';
// FormBuilderOptions Component
// Then update your FormBuilderOptions component like this:
const FormBuilderOptions = ({ onOptionSelect, onBack }) => {
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
    if (value === 'scratch') {
      setShowFormBuilder(true);
    } else {
      onOptionSelect(value);
    }
    if (value === 'import') {
      setShowFormBuilder(true);
    } else {
      onOptionSelect(value);
    }
  };

  if (showFormBuilder) {
    return (
      <div className="w-full">
        <FormBuilder />
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

// CreateEventForm Component
const CreateEventForm = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [eventImage, setEventImage] = useState(null);
  const [skipForm, setSkipForm] = useState(false);
  const [selectedFormOption, setSelectedFormOption] = useState(null);
  const [eventData, setEventData] = useState({
    name: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: '',
    description: '',
    Eligibility: '',
    Incentives: '',
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
      // Add a new document to the "programmes" collection
      const docRef = await addDoc(collection(db, 'programmes'), {
        ...eventData,
        image: eventImage,
        createdAt: new Date(),
      });
      console.log('Event added with ID:', docRef.id);
      // Close the form after submission
      onClose();
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
                  onChange={(e) => setEventData({ ...eventData, name: e.target.value })}
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
                  onChange={(e) => setEventData({ ...eventData, Eligibility: e.target.value })}
                />

                <textarea
                  placeholder="Add Incentives"
                  className="w-full p-3 border rounded-md min-h-[20px]"
                  value={eventData.Incentives}
                  onChange={(e) => setEventData({ ...eventData, Incentives: e.target.value })}
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
      setSkipForm(true);
      setCurrentStep(3); // Skip to review
    }}
    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
  >
    Review and Launch
  </button>
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
          onOptionSelect={(option) => {
            setSelectedFormOption(option);
          }}
          onBack={() => setCurrentStep(1)}
        />
      )}
    </div>
  );
};

// NavItem Component
const NavItem = ({ icon, label, active, onClick, className }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-2 p-2 rounded-md cursor-pointer ${active ? 'bg-gray-200 font-medium' : ''} ${className}`}
  >
    <span>{icon}</span>
    <span>{label}</span>
  </div>
);

// Main Dashboard Component
const DDashboard = () => {
  const [expandedWorkspace, setExpandedWorkspace] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [showCreateEvent, setShowCreateEvent] = useState(false);

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 p-4 overflow-y-auto scrollbar-none h-full">
        {/* User section */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-full bg-gray-200"></div>
          <span className="font-medium">User</span>
        </div>

        {/* Main navigation */}
        <nav className="space-y-1">
          <NavItem icon={<FontAwesomeIcon icon={faHome} />} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <NavItem icon={<FontAwesomeIcon icon={faSearch} />} label="Search" active={activeTab === 'search'} onClick={() => setActiveTab('search')} />
          <NavItem icon={<FontAwesomeIcon icon={faUsers} />} label="Members" active={activeTab === 'members'} onClick={() => setActiveTab('members')} />
          <NavItem icon={<FontAwesomeIcon icon={faGlobe} />} label="Files" active={activeTab === 'files'} onClick={() => setActiveTab('files')} />
          <NavItem icon={<FontAwesomeIcon icon={faCog} />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          <NavItem icon={<FontAwesomeIcon icon={faStar} />} label="Upgrade plan" className="text-purple-600" />
        </nav>

        {/* Workspaces */}
        <div className="mt-8">
          <div className="text-sm text-gray-500 mb-2">Workspaces</div>
          {['Programs', 'Events', 'Cohorts'].map((workspace) => (
            <div key={workspace} className="ml-2">
              <details>
                <summary className="cursor-pointer mb-2">{workspace}</summary>
                <div className="ml-2">
                  <NavItem
                    icon={<FontAwesomeIcon icon={faFile} />}
                    label="Form Responses"
                    active={activeTab === 'formResponses'}
                    onClick={() => setActiveTab('formResponses')}
                  />
                </div>
              </details>
            </div>
          ))}
        </div>

        {/* Product section */}
        <div className="mt-8">
          <div className="text-sm text-gray-500 mb-2">Product</div>
          <nav className="space-y-1">
            <NavItem icon={<FontAwesomeIcon icon={faFile} />} label="Templates" />
            <NavItem icon={<FontAwesomeIcon icon={faMagic} />} label="What's new" />
            <NavItem icon={<FontAwesomeIcon icon={faMap} />} label="Roadmap" />
            <NavItem icon={<FontAwesomeIcon icon={faLightbulb} />} label="Feature requests" />
            <NavItem icon={<FontAwesomeIcon icon={faTrashAlt} />} label="Trash" />
          </nav>
        </div>

        {/* Help section */}
        <div className="mt-8">
          <div className="text-sm text-gray-500 mb-2">Help</div>
          <nav className="space-y-1">
            <NavItem icon={<FontAwesomeIcon icon={faRocket} />} label="Get started" />
            <NavItem icon={<FontAwesomeIcon icon={faBook} />} label="How-to guides" />
            <NavItem icon={<FontAwesomeIcon icon={faQuestion} />} label="Help center" />
            <NavItem icon={<FontAwesomeIcon icon={faCommentDots} />} label="Contact support" />
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="h-14 border-b border-gray-200 px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <FontAwesomeIcon icon={faHome} className="text-xl" />
            <h1 className="text-xl font-semibold">Home</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-600 hover:bg-gray-100 p-2 rounded-md">
              <FontAwesomeIcon icon={faSearch} size="lg" />
            </button>
            <button className="text-gray-600 hover:bg-gray-100 p-2 rounded-md">
              <FontAwesomeIcon icon={faCog} size="lg" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="p-4">
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

      {/* Help button */}
      <button className="fixed bottom-4 right-4 w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center">
        <FontAwesomeIcon icon={faQuestionCircle} size="lg" />
      </button>
    </div>
  );
};

export default DDashboard;
  
  
  
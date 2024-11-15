import {
  faBook,
  faCamera,
  faCog,
  faCommentDots,
  faFile,
  faHome,
  faLightbulb,
  faLocationDot,
  faMagic,
  faMap,
  faPlus,
  faQuestion,
  faQuestionCircle,
  faRocket,
  faSearch,
  faTrashAlt
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { GripVertical, Plus } from 'lucide-react';
import React, { useState } from 'react';
import FormResponses from './FormResponses';


import FormBuilderModal from './FormBuilderModal';




const StepIndicator = ({ currentStep }) => {
  const steps = [
    { number: 1, label: 'Basic Details', status: 'current' },
    { number: 2, label: 'Registration Details', status: 'upcoming' },
    {number: 3, label: 'Create Event', status: 'upcoming'}
  ];

  return (
    <div className="flex items-center w-full mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          {/* Step Circle and Label */}
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

          {/* Connector Line */}
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


// Simple Card Components for CreateEventForm
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
const [eventImage, setEventImage] = useState(null);
const [isModalOpen, setModalOpen] = useState(false);

  const showFormBuilder = (isOpen) => {
    setModalOpen(isOpen);
  };

  const handleOptionSelect = (option) => {
    console.log(`Selected option: ${option}`);
    setModalOpen(false); // Close the modal after selection
  };

const [eventData, setEventData] = useState({
  name: '',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  location: '',
  description: '',
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

return (
  <div className="max-w-4xl mx-auto p-4">
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-semibold">Create Event</h1>
      <div className="flex gap-2">
        
      </div>
    </div>

    <StepIndicator currentStep={1} />

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

        <div className="mt-4">
          <h3 className="font-medium mb-2"></h3>
          <Card>
           
          </Card>
        </div>
      </div>

      {/* Right column - Event details */}
      <div className="col-span-2">
        <Card>
          <CardContent className="p-6 space-y-6">
            

            {/* Event name */}
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

            {/* Description */}
            <textarea
              placeholder="Add Description"
              className="w-full p-3 border rounded-md min-h-[20px]"
              value={eventData.description}
              onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
            />

            {/* Description */}
            <textarea
              placeholder="Add Eligibility"
              className="w-full p-3 border rounded-md min-h-[20px]"
              value={eventData.description}
              onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
            />

            {/* Description */}
            <textarea
              placeholder="Add Incentives"
              className="w-full p-3 border rounded-md min-h-[20px]"
              value={eventData.description}
              onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
            />

            {/* Event Options */}
            <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
          Cancel
        </button>
        <button
        className="px-4 py-2 bg-purple-600 text-white rounded-md"
        onClick={() => showFormBuilder(true)}
      >
        Next
      </button>

      {isModalOpen && (
        <FormBuilderModal 
          onClose={() => setModalOpen(false)} 
          onOptionSelect={handleOptionSelect} 
        />
      )}
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);
};

const NavItem = ({ icon, label, active, onClick, className }) => (
<div
  onClick={onClick}
  className={`flex items-center gap-2 p-2 rounded-md cursor-pointer ${active ? 'bg-gray-200 font-medium' : ''} ${className}`}
>
  <span>{icon}</span>
  <span>{label}</span>
</div>
);

const IDashboard = () => {
const [expandedWorkspace, setExpandedWorkspace] = useState(null);
const [activeTab, setActiveTab] = useState('home');
const [showCreateEvent, setShowCreateEvent] = useState(false);
const [showFormModal, setShowFormModal] = useState(false);
  const [formType, setFormType] = useState(null);
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [questions, setQuestions] = useState([]);
  //const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(null);
  const [draggedTemplate, setDraggedTemplate] = useState(null);

  
const workspaces = [
  { name: 'Workspace 1', events: ['Event 1', 'Event 2'] },
  { name: 'Workspace 2', events: ['Event 3', 'Event 4'] },
];
const [formDetails, setFormDetails] = useState({
  name: '',
  description: '',
  eligibility: '',
  incentives: '',
  startDate: '',
  endDate: ''
});
const toggleWorkspace = (workspaceName) => {
  setExpandedWorkspace((prev) => (prev === workspaceName ? null : workspaceName));
};
const questionTemplates = [
  {
    type: 'multiple_choice',
    title: 'How satisfied are you with our service?',
    description: 'Rate your overall satisfaction',
    choices: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'],
    icon: '🎯'
  },
  {
    type: 'multiple_choice',
    title: 'What is your age group?',
    description: 'Select your age range',
    choices: ['18-24', '25-34', '35-44', '45-54', '55+'],
    icon: '📊'
  },
  {
    type: 'text',
    title: 'Please provide your feedback',
    description: 'Share your thoughts with us',
    icon: '✍️'
  },
  {
    type: 'multiple_choice',
    title: 'Would you recommend us to others?',
    description: 'Select your likelihood to recommend',
    choices: ['Definitely', 'Probably', 'Not sure', 'Probably not', 'Definitely not'],
    icon: '👍'
  }
];

  const handleDragStart = (template, e) => {
    setDraggedTemplate(template);
    e.dataTransfer.setData('text/plain', ''); // Required for Firefox
  };

const handleDragOver = (e) => {
  e.preventDefault();
};

const handleDrop = (e) => {
  e.preventDefault();
  if (draggedTemplate) {
    const newQuestion = {
      ...draggedTemplate,
      id: Date.now(),
      required: false,
      multipleSelection: false,
      randomize: false,
      otherOption: false,
      verticalAlignment: false
    };
    setQuestions([...questions, newQuestion]);
    setCurrentQuestionIndex(questions.length);
    setDraggedTemplate(null);
  }
};

const [setWorkspaces] = useState([
  {
    name: 'My Events',
    events: []
  },
  {
      name: 'My Programs',
      events: []
    },
  {
    name: 'My Cohorts',
    events: []
  }
]);

const handleCreateForm = (option) => {
  if (option === 'scratch') {
    setIsCreatingForm(true);
  } else {
    const newWorkspaces = [...workspaces];
    const newItemName = formType === 'event' ? 
      `New Event #${newWorkspaces[0].events.length + 1}` :
      `New Program #${newWorkspaces[0].events.length + 1}`;
    
    newWorkspaces[0].events.push(newItemName);
    setWorkspaces(newWorkspaces);
    setShowFormModal(false);
    setFormType(null);
  }
};

const addQuestion = () => {
  setQuestions([...questions, {
    id: Date.now(),
    type: 'text',
    question: '',
    required: false,
    options: []
  }]);
};


const updateQuestion = (id, updates) => {
  setQuestions(questions.map(q => 
    q.id === id ? { ...q, ...updates } : q
  ));
};

const deleteQuestion = (id) => {
  setQuestions(questions.filter(q => q.id !== id));
};

const saveForm = () => {
  if (!formTitle || !formDetails.name) {
    alert('Please add a title and name for your form');
    return;
  }

  const newWorkspaces = [...workspaces];
  newWorkspaces[0].events.push(formTitle);
  setWorkspaces(newWorkspaces);

  setShowFormModal(false);
  setFormType(null);
  setIsCreatingForm(false);
  setFormTitle('');
  setQuestions([]);
  setFormDetails({
    name: '',
    description: '',
    eligibility: '',
    incentives: '',
    startDate: '',
    endDate: ''
  });
};

const openFormModal = (type) => {
  setFormType(type);
  setShowFormModal(true);
};

const [currentQuestion, setCurrentQuestion] = useState({
  type: 'text',
  title: '',
  description: '',
  required: false,
  multipleSelection: false,
  randomize: false,
  otherOption: false,
  verticalAlignment: false,
  choices: ['Choice 1', 'Choice 2']
});

const QuestionEditor = () => {
  return (
    <div className="flex h-full">
      {/* Questions List and Editor */}
      <div className="flex-1 border-r">
        {/* Questions List */}
        <div 
          className="border-b p-4"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {questions.map((question, index) => (
            <div 
              key={question.id}
              className={`flex items-center gap-2 p-3 border rounded-lg mb-2 cursor-pointer ${
                currentQuestionIndex === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
              onClick={() => setCurrentQuestionIndex(index)}
            >
              <GripVertical className="text-gray-400" size={16} />
              <div>
                <div className="font-medium">{question.title}</div>
                <div className="text-sm text-gray-500">{question.type}</div>
              </div>
            </div>
          ))}
          {questions.length === 0 && (
            <div className="text-center text-gray-500 p-8">
              Drag and drop a template from the right or create a new question
            </div>
          )}
        </div>

        {/* Current Question Editor */}
        {currentQuestionIndex !== null && (
          <div className="p-4">
            <div className="max-w-2xl mx-auto">
              <input
                type="text"
                value={questions[currentQuestionIndex].title}
                onChange={(e) => {
                  const newQuestions = [...questions];
                  newQuestions[currentQuestionIndex].title = e.target.value;
                  setQuestions(newQuestions);
                }}
                className="w-full text-lg p-2 border-b border-gray-200 focus:outline-none focus:border-blue-500 mb-2"
                placeholder="Your question here. Recall information with @"
              />
              <input
                type="text"
                value={questions[currentQuestionIndex].description}
                onChange={(e) => {
                  const newQuestions = [...questions];
                  newQuestions[currentQuestionIndex].description = e.target.value;
                  setQuestions(newQuestions);
                }}
                className="w-full text-sm text-gray-600 p-2 border-b border-gray-200 focus:outline-none focus:border-blue-500 mb-4"
                placeholder="Description (optional)"
              />

              {questions[currentQuestionIndex].type === 'multiple_choice' && (
                <div className="space-y-2">
                  {questions[currentQuestionIndex].choices.map((choice, choiceIndex) => (
                    <div key={choiceIndex} className="flex items-center gap-2">
                      <span className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded">
                        {String.fromCharCode(65 + choiceIndex)}
                      </span>
                      <input
                        type="text"
                        value={choice}
                        onChange={(e) => {
                          const newQuestions = [...questions];
                          newQuestions[currentQuestionIndex].choices[choiceIndex] = e.target.value;
                          setQuestions(newQuestions);
                        }}
                        className="flex-1 p-2 border rounded focus:outline-none focus:border-blue-500"
                        placeholder={`Choice ${choiceIndex + 1}`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Panel with Settings and Templates */}
      <div className="w-80 bg-gray-50 overflow-y-auto">
        {/* Settings Section */}
        <div className="p-4 border-b">
          <h3 className="font-medium mb-4">Settings</h3>
          <div className="space-y-4">
            {currentQuestionIndex !== null && (
              <>
                <label className="flex items-center justify-between">
                  <span>Required</span>
                  <div 
                    className="relative inline-block w-10 h-6 transition-colors duration-200 ease-in-out border-2 rounded-full cursor-pointer"
                    onClick={() => {
                      const newQuestions = [...questions];
                      newQuestions[currentQuestionIndex].required = !newQuestions[currentQuestionIndex].required;
                      setQuestions(newQuestions);
                    }}
                  >
                    <span className={`inline-block w-4 h-4 transition duration-200 ease-in-out transform bg-white rounded-full ${
                      questions[currentQuestionIndex].required ? 'translate-x-4 bg-blue-600' : 'translate-x-0'
                    }`} />
                  </div>
                </label>
                {/* Add other settings toggles similarly */}
              </>
            )}
          </div>
        </div>

        {/* Templates Section */}
        <div className="p-4">
          <h3 className="font-medium mb-4">Question Templates</h3>
          <div className="space-y-3">
            {questionTemplates.map((template, index) => (
              <div
                key={index}
                draggable
                onDragStart={(e) => handleDragStart(template, e)}
                className="p-3 bg-white rounded-lg border border-gray-200 cursor-move hover:border-blue-500 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span>{template.icon}</span>
                  <span className="font-medium">{template.title}</span>
                </div>
                <p className="text-sm text-gray-500">{template.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};



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
        {/* <NavItem icon={<FontAwesomeIcon icon={faSearch} />} label="Search" active={activeTab === 'search'} onClick={() => setActiveTab('search')} /> */}
        {/* <NavItem icon={<FontAwesomeIcon icon={faUsers} />} label="Members" active={activeTab === 'members'} onClick={() => setActiveTab('members')} />
        <NavItem icon={<FontAwesomeIcon icon={faGlobe} />} label="Files" active={activeTab === 'files'} onClick={() => setActiveTab('files')} />
        <NavItem icon={<FontAwesomeIcon icon={faCog} />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        <NavItem icon={<FontAwesomeIcon icon={faStar} />} label="Upgrade plan" className="text-purple-600" /> */}
      </nav>

      {/* Rest of the sidebar components */}
      <div className="mt-8">
        <div className="text-sm text-gray-500 mb-2">Workspaces</div>
        <div className="ml-2">
          <details>
            <summary className="cursor-pointer mb-2">Programs</summary>
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
        <div className="ml-2">
          <details>
            <summary className="cursor-pointer mb-2">Events</summary>
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
        <div className="ml-2">
        <details>
  <summary className="cursor-pointer mb-2">Cohorts</summary>
  <div className="ml-2">
    <NavItem
      icon={<FontAwesomeIcon icon={faFile} />}
      label="Form Responses"
      active={activeTab === 'formResponses'}
      onClick={() => setActiveTab('formResponses')}
    />
  </div>
</details>

{/* Conditional rendering of FormResponses */}

        </div>
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
               className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2">
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
            {/*activeTab === 'home' && <div>Welcome to the Home Page</div>*/}
            {activeTab === 'formResponses' && <FormResponses />}
          </>
        ) : (
          <CreateEventForm onClose={() => setShowCreateEvent(false)} />
        )}

        
     </main>
    </div>

    {/* Help button
  
        {/* Help button */}
        <button className="fixed bottom-4 right-4 w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center">
          <FontAwesomeIcon icon={faQuestionCircle} size="lg" />
        </button>
      </div>
    );
  };
  
  export default IDashboard;
  
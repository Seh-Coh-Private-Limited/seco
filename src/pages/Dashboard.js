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
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import FormResponses from './FormResponses'; // Import the FormResponses component
  
  const NavItem = ({ icon, label, active, onClick, className }) => (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 p-2 rounded-md cursor-pointer ${active ? 'bg-gray-200 font-medium' : ''} ${className}`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
  
  const Dashboard = () => {
    const [expandedWorkspace, setExpandedWorkspace] = useState(null);
    const [activeTab, setActiveTab] = useState('home'); // State to track the active tab
  
    const workspaces = [
      { name: 'Workspace 1', events: ['Event 1', 'Event 2'] },
      { name: 'Workspace 2', events: ['Event 3', 'Event 4'] },
    ];
  
    const toggleWorkspace = (workspaceName) => {
      setExpandedWorkspace((prev) => (prev === workspaceName ? null : workspaceName));
    };
  
    return (
      <div className="flex h-screen bg-white">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-200 p-4 overflow-y-auto scrollbar-none h-full"> {/* Make sidebar scrollable */}
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
  
          {/* Cohorts section */}
          <div className="mt-8">
            <div className="text-sm text-gray-500 mb-2">Cohorts</div>
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
        <div className="flex-1 overflow-auto"> {/* Make content scrollable */}
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
            <div className="flex justify-end gap-2 mb-8">
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md flex items-center gap-2">
                New Event
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2">
                <FontAwesomeIcon icon={faPlus} size="sm" />
                New program
              </button>
            </div>
  
            {/* Conditional rendering of the main content based on the activeTab */}
            {activeTab === 'home' && <div>Welcome to the Home Page</div>}
            {activeTab === 'formResponses' && <FormResponses />}
            {/* Add other tab contents here if needed */}
          </main>
        </div>
  
        {/* Help button */}
        <button className="fixed bottom-4 right-4 w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center">
          <FontAwesomeIcon icon={faQuestionCircle} size="lg" />
        </button>
      </div>
    );
  };
  
  export default Dashboard;
  
import {
  faBook,
  faBuilding,
  faCog,
  faCommentDots,
  faFile,
  faFolder,
  faHome,
  faLightbulb,
  faMagic,
  faMap,
  faQuestion,
  faQuestionCircle,
  faRocket,
  faSearch,
  faSignOutAlt,
  faTrashAlt
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getAuth, signOut } from 'firebase/auth';
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Articles from '../components/Articles';
import FFormResponses from './FFormResponses';

const FounderDashboard = () => {
  const [companyDetails, setCompanyDetails] = useState(null);
  const [logoError, setLogoError] = useState(false);
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [formResponses, setFormResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [activeApplicationTab, setActiveApplicationTab] = useState('summary');
  
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();

  // Fetch company details and applications
  useEffect(() => {
    const fetchUserDataAndApplications = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/signup');
          return;
        }

        // Query users collection where uid field matches current user's uid
        const usersRef = collection(db, 'users');
        const userQuery = query(usersRef, where('uid', '==', user.uid));
        const userSnapshot = await getDocs(userQuery);
        
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          setCompanyDetails({
            name: userData.companyName || 'Company Name',
            logo: userData.logo || userData.companyLogo || null
          });

          // Get the user document reference
          const userDocRef = userSnapshot.docs[0].ref;
          
          // Fetch applications from the subcollection
          const applicationsCollection = collection(userDocRef, 'applications');
          const applicationsSnapshot = await getDocs(applicationsCollection);
          
          const fetchedApplications = applicationsSnapshot.docs.map(doc => ({
            id: doc.data().id,  // Use id field from document data
            title: doc.data().title
          }));
          
          setApplications(fetchedApplications);
        }
      } catch (error) {
        console.error('Error fetching user data and applications:', error);
        setCompanyDetails({ name: 'Company Name', logo: null });
        setApplications([]);
      }
    };

    fetchUserDataAndApplications();
  }, [auth, db, navigate]);

  const handleApplicationClick = (application) => {
    setActiveTab('application');
    setSelectedApplication(application);
    setActiveApplicationTab('summary');
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

  const NavItem = ({ icon, label, active, onClick, className = '', status }) => (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-100 ${
        active ? 'bg-gray-200 font-medium' : ''
      } ${className}`}
    >
      <FontAwesomeIcon icon={icon} />
      <span className="flex-1">{label}</span>
      {status && (
        <span className={`text-xs px-2 py-1 rounded-full ${
          status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
          status === 'Approved' ? 'bg-green-100 text-green-800' :
          status === 'Rejected' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {status}
        </span>
      )}
    </button>
  );

  const ApplicationHeader = ({ application }) => (
    <div className="border-b border-gray-200 p-4">
      {/* <h2 className="text-2xl font-bold mb-4">{application.title || 'Untitled Application'}</h2> */}
      <div className="flex space-x-6">
        {['summary', 'editApplication'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveApplicationTab(tab)}
            className={`text-sm font-medium pb-2 ${
              activeApplicationTab === tab
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
          <NavItem 
            icon={faSearch}
            label="Discover" 
            active={activeTab === 'discover'} 
            onClick={() => setActiveTab('discover')} 
          />
        </nav>

        <div className="mt-8">
          <div className="text-sm text-gray-500 mb-2">Applications</div>
          <div className="ml-2">
            {applications.length > 0 ? (
              applications.map((application) => (
                <NavItem
                  key={application.id}
                  icon={faFolder}
                  label={application.title || 'Untitled Application'}
                  active={selectedApplication?.id === application.id}
                  onClick={() => handleApplicationClick(application)}
                />
              ))
            ) : (
              <div className="text-gray-400 p-2">No applications available</div>
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
        <header className="h-14 border-b border-gray-200 px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <FontAwesomeIcon icon={activeTab === 'discover' ? faSearch : faHome} className="text-xl" />
            <h1 className="text-xl font-semibold">
              {activeTab === 'discover' ? 'Discover' : 
               activeTab === 'application' ? selectedApplication?.title || 'Application' : 
               'Home'}
            </h1>
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

        <main className="h-full">
          {activeTab === 'home' && (
            <div className="p-4">
              <h2 className="text-2xl font-bold mb-4">Welcome to your dashboard</h2>
              {/* Add home content here */}
            </div>
          )}

          {activeTab === 'discover' && (
            <div className="p-4">
              <Articles />
            </div>
          )}
          
          {activeTab === 'application' && selectedApplication && (
            <div className="h-full">
              <ApplicationHeader application={selectedApplication} />
              <div className="p-4">
                {activeApplicationTab === 'summary' && (
                  <div className="h-full">
                  <FFormResponses programId={selectedApplication.id} userId={auth.currentUser.uid} />
                </div>
                )}

                {activeApplicationTab === 'formResponses' && (
                  <div className="h-full">
                    <FFormResponses programId={selectedApplication.id} userId={auth.currentUser.uid} />
                  </div>
                )}

                {activeApplicationTab === 'editApplication' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Edit Application</h3>
                    {/* Add edit application form */}
                  </div>
                )}
                
                {/* {activeApplicationTab === 'editForm' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Edit Form</h3>
                   
                  </div>
                )} */}
              </div>
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
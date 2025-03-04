import {
  faBook,
  faBuilding,
  faChevronRight,
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
import { collection, doc, getDoc, getDocs, getFirestore, query, setDoc, where } from 'firebase/firestore';
import React, { useEffect, useState,useCallback,setError } from 'react';
import Articles from '../components/Articles';
import SettingsForm from '../components/SettingsForm';
import FFormResponses from './FFormResponses';

import { useNavigate } from 'react-router-dom';
import Application from './ApplicationForm';
import FProgramDetailPage from './FProgramDetailPage';

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
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [dashboardTab, setDashboardTab] = useState({
    activeTab: 'articles',
    programId: null
  })
  const [activeApplicationTab, setActiveApplicationTab] = useState('summary');
  const [eventDetails, setEventDetails] = useState(null);

  const [selectedProgramId, setSelectedProgramId] = useState(null); // Declare here

  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();
  useEffect(() => {
    const checkSessionAndFetchData = async () => {
      const sessionData = localStorage.getItem('sessionData');
      console.log('Hi im being checked');
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
  
        // Fetch company details
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCompanyDetails({
            name: userData.companyName || 'Company Name',   
            logo: userData.logoUrl || userData.companyLogo || null
          });
          console.log('Success Reload of Company Details');
        }
  
        // Fetch applications
        const usersRef = collection(db, 'users');
        const userQuery = query(usersRef, where('uid', '==', user.uid));
        const userSnapshot = await getDocs(userQuery);
        
        if (!userSnapshot.empty) {
          const userDocRef = userSnapshot.docs[0].ref;
          
          // Fetch applications from subcollection
          const applicationsCollection = collection(userDocRef, 'applications');
          const applicationsSnapshot = await getDocs(applicationsCollection);
          
          const fetchedApplications = applicationsSnapshot.docs.map(doc => ({
            id: doc.id,
            title: doc.data().programTitle
          }));
          console.log('Success Reload of Program Details');
          setApplications(fetchedApplications);
        }
  
        // Fetch programmes
        const programmesQuery = await getDocs(
          query(collection(db, 'programmes'), where('uid', '==', user.uid))
        );
        
        const fetchedProgrammes = programmesQuery.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setProgrammes(fetchedProgrammes);
  
        // Update last activity
        await setDoc(sessionRef, {
          lastActivity: new Date().toISOString()
        }, { merge: true });
  
      } catch (error) {
        console.error('Session check and data fetch error:', error);
        
        // Fallback states
        setCompanyDetails({ name: 'Company Name', logo: null });
        setApplications([]);
        setProgrammes([]);
        
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
 
  const fetchCompanyDetails = useCallback(async (user) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setCompanyDetails({
          name: userData.companyName || 'Company Name',
          logo: userData.logoUrl || userData.companyLogo || null
        });
        setLogoError(false); // Reset logo error state
      }
    } catch (error) {
      console.error('Error fetching company details:', error);
      setCompanyDetails({ name: 'Company Name', logo: null });
    }
  }, [db]);

  const reloadCompanyDetails = useCallback(async () => {
    const user = auth.currentUser;
    if (user) {
      await fetchCompanyDetails(user);
    }
  }, [auth, fetchCompanyDetails]);

  // Replace all other company detail fetching useEffects with this single one
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      fetchCompanyDetails(user);
    }
  }, [fetchCompanyDetails]);
  // Fetch company details
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const user = auth.currentUser;
        const sessionData = localStorage.getItem('sessionData');
        
        // if (!user || !sessionData) {
        //   navigate('/signup');
        //   return;
        // }
  
        const { expiresAt } = JSON.parse(sessionData);
        const now = new Date().getTime();
        const expiration = new Date(expiresAt).getTime();
        
        if (now >= expiration) {
          await handleLogout();
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
  useEffect(() => {
    const fetchProgramDetails = async () => {
      if (selectedProgramId) {
        try {
          console.log(selectedProgramId);
    
          // Query Firestore to find document where the field matches selectedProgramId
          const programQuery = query(collection(db, 'programmes'), where('id', '==', selectedProgramId));
          const querySnapshot = await getDocs(programQuery);
    
          if (!querySnapshot.empty) {
            // Assuming there's only one document that matches the query
            const programDoc = querySnapshot.docs[0];
            setEventDetails(programDoc.data()); // Update eventDetails with program details
            console.log(programDoc.data());
          } else {
            console.log('No program found with the selectedProgramId');
          }
        } catch (error) {
          console.error('Error fetching program details:', error);
          setEventDetails(null); // Reset eventDetails if there's an error
        }
      }
    };
    
  
    fetchProgramDetails();
  }, [selectedProgramId, db]);
  useEffect(() => {
    const fetchUserDataAndApplications = async () => {
      try {
        const user = auth.currentUser;
        // if (!user) {
        //   navigate('/signup');
        //   return;
        // }

        // Query users collection where uid field matches current user's uid
        const usersRef = collection(db, 'users');
        const userQuery = query(usersRef, where('uid', '==', user.uid));
        const userSnapshot = await getDocs(userQuery);
        
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          setCompanyDetails({
            name: userData.companyName || 'Company Name',
            logo: userData.logoUrl || userData.companyLogo || null
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
const reloadApplications = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return;

    // Query users collection where uid field matches current user's uid
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('uid', '==', user.uid));
    const userSnapshot = await getDocs(userQuery);
    
    if (!userSnapshot.empty) {
      const userDocRef = userSnapshot.docs[0].ref;
      
      // Fetch applications from subcollection
      const applicationsCollection = collection(userDocRef, 'applications');
      const applicationsSnapshot = await getDocs(applicationsCollection);
      
      const fetchedApplications = applicationsSnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().programTitle
      }));
      
      setApplications(fetchedApplications);
    }
  } catch (error) {
    console.error('Error reloading applications:', error);
  }
};
const Breadcrumb = ({ 
  activeTab, 
  selectedApplication, 
  selectedProgram, 
  eventDetails, 
  setActiveTab 
}) => {
  const getBreadcrumbItems = () => {
    const items = [];

    // Add breadcrumb items based on active tab and selected resources
    switch (activeTab) {
      case 'discover':
        items.push({ 
          label: 'Discover', 
          onClick: () => setActiveTab('discover') 
        });
        break;

      case 'programdetailpage':
        items.push(
          { 
            label: 'Discover', 
            onClick: () => setActiveTab('discover') 
          },
          { 
            label: eventDetails?.name || 'Event', 
            onClick: () => setActiveTab('programdetailpage') 
          }
        );
        break;

      case 'applicationform':
        items.push(
          { 
            label: 'Discover', 
            onClick: () => setActiveTab('discover') 
          },
          { 
            label: eventDetails?.name || 'Event', 
            onClick: () => {
              setActiveTab('programdetailpage');
              setSelectedProgramId(eventDetails?.id); // Make sure this matches the program ID field in your data
            }
          },
          { 
            label: 'Application Form', 
            
          }
        );
        break;

      case 'application':
        if (selectedApplication) {
          items.push(
           
            { 
              label: selectedApplication.title || 'Untitled Application', 
              onClick: () => setActiveTab('application') 
            }
          );
        }
        break;

      case 'settings':
        items.push({ label: 'Settings' });
        break;

      default:
        break;
    }

    return items;
  };
  const breadcrumbItems = getBreadcrumbItems();
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      {breadcrumbItems.length > 0 && (
        <FontAwesomeIcon
          icon={faChevronRight}
          className="text-gray-400 w-3 h-3"
        />
      )}
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={item.label}>
          {index > 0 && (
            <FontAwesomeIcon
              icon={faChevronRight}
              className="text-gray-400 w-3 h-3"
            />
          )}
          {item.onClick ? (
            <a
              onClick={item.onClick} 
              className="text-gray-900 hover:underline focus:outline-none"
            >
              {item.label}
            </a>
          ) : (
            <span className="text-gray-900">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
// Replace your existing header section in the return statement with this:
const Header = ({ activeTab, selectedApplication, setActiveTab, openSettings,eventDetails }) => {
  return (
    <div className="flex items-center justify-between px-4 py-2 sticky top-0 bg-white border-b border-gray-200">
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

        <Breadcrumb 
          activeTab={activeTab} 
          eventDetails={eventDetails}
          selectedApplication={selectedApplication}
          setActiveTab={setActiveTab}
        />
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


  const handleProgramClick = (program) => {
    setActiveTab('program');
    setSelectedProgram(program);
    setActiveProgramTab('summary');
    setFormResponses([]);
  };

  const handleLogout = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const sessionRef = doc(db, 'sessions', user.uid);
        await setDoc(sessionRef, { 
          isActive: false,
          logoutTime: new Date().toISOString()
        }, { merge: true });
      }
      await signOut(auth);
      localStorage.removeItem('sessionData');
      navigate('/signup');
    } catch (error) {
      console.error('Logout error:', error);
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
  const openSettings = () => {
    setActiveTab('settings'); // Switch to settings view
  };

  const goBack = () => {
    setActiveTab('home'); // Return to home view
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
  const handleApplicationClick = (application) => {
    setActiveTab('application');
    setSelectedApplication(application);
    setActiveApplicationTab('summary');
    setFormResponses([]);
  };
  // const [activeTab, setActiveTab] = useState('discover');
  // const [selectedProgramId, setSelectedProgramId] = useState(null);

  const handleTabChange = (tab, programId) => {
    console.log(tab);
    console.log(programId);
    setActiveTab(tab);
    setSelectedProgramId(programId);
  };
  const ApplicationHeader = ({ application }) => (
    <div className=" border-b border-gray-200 p-0">
      {/* <h2 className="text-2xl font-bold mb-4">{application.title || 'Untitled Application'}</h2> */}
      <div className="flex space-x-6">
        {['summary', 'formresponses'].map((tab) => (
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
      <div className="w-64 border-r border-gray-200 p-4 overflow-y-auto scrollbar-hide h-full">
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
          {/* <NavItem 
            icon={faSearch}
            label="Discover" 
            active={activeTab === 'discover'} 
            onClick={() => setActiveTab('discover')} 
          /> */}
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
      <div className="flex-1 overflow-hidden scrollbar-hide">
      <Header 
  activeTab={activeTab}
  selectedApplication={selectedApplication}
  eventDetails={eventDetails} 
  setActiveTab={setActiveTab}
  openSettings={openSettings}
/>
        <main className="h-full">
          {activeTab === 'home' && (
            <div className="h-[calc(100vh/1.16)] overflow-auto scrollbar-hide mt-8 mb-8">
            <Articles handleTabChange={handleTabChange} />
          </div>
          )}
          
          {activeTab === 'discover' && (
        <div className="h-[calc(100vh/1.16)] overflow-auto scrollbar-hide mt-8 mb-8">
          <Articles handleTabChange={handleTabChange} />
        </div>
      )}
      {activeTab === 'programdetailpage' && (
        <div className="h-[calc(100vh/1.16)] md:px-36 overflow-auto scrollbar-hide mt-8 mb-8">
          {/* Your Events component */}
          <FProgramDetailPage 
      programId={selectedProgramId} 
      handleTabChange={handleTabChange}  // Add this prop
    />
          {/* <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Events</h3>
            <p className="text-gray-600">No events available</p>
            </div> */}
        </div>
      )}
      {activeTab === 'applicationform' && (
        <div className="h-[calc(100vh/1.16)] overflow-auto scrollbar-hide mt-8 mb-8">
          {/* Your Applications component */}
          {/* <Applications programId={selectedProgramId} /> */}
          <Application 
                programId={selectedProgramId} 
                onFormSubmitSuccess={reloadApplications} 
              />
          {/* <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Applications</h3>
            </div> */}
        </div>
      )}
          
          {activeTab === 'application' && selectedApplication && (
            <div className="md:px-36 overflow-none mt-8 h-full">
              <ApplicationHeader application={selectedApplication} />
              <div className="py-4">
                {activeApplicationTab === 'summary' && (
                  <div className="h-full">
                  <h3 className="text-lg font-semibold mb-4">Summary</h3>
                </div>
                )}

                {activeApplicationTab === 'formResponses' && (
                  <div className="h-full">
                  <FFormResponses 
      programId={selectedApplication.id} 
      userId={auth.currentUser.uid} 
      isTabActive={activeApplicationTab === 'formResponses'}
    />
                  </div>
                )}

                {activeApplicationTab === 'editApplication' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Edit Application</h3>
                    {/* Add edit application form */}
                  </div>
                )}
                
                {activeApplicationTab === 'addJudges' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Add Judges</h3>
                   
                  </div>
                )}
              </div>
            </div>
          )}

<div className="h-[calc(100vh/1.16)] overflow-auto scrollbar-hide mt-8 mb-8">
  {activeTab === 'settings' && (
    <SettingsForm onProfileUpdate={reloadCompanyDetails}  />
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
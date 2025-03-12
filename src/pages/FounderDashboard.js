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
import React, { useEffect, useState, useCallback } from 'react';
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
  const [activeProgramTab, setActiveProgramTab] = useState('application');
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [dashboardTab, setDashboardTab] = useState({
    activeTab: 'articles',
    programId: null
  });
  const [activeApplicationTab, setActiveApplicationTab] = useState('application');
  const [eventDetails, setEventDetails] = useState(null);
  const [selectedProgramId, setSelectedProgramId] = useState(null);

  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();

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

        if (currentTime >= expiration) {
          console.warn('Session is about to expire. Extending session.');
          const extendedSessionData = {
            ...JSON.parse(sessionData),
            expiresAt: new Date(currentTime + 24 * 60 * 60 * 1000).toISOString()
          };
          localStorage.setItem('sessionData', JSON.stringify(extendedSessionData));
        }

        const sessionRef = doc(db, 'sessions', uid);
        const sessionDoc = await getDoc(sessionRef);

        if (!sessionDoc.exists() || sessionDoc.data().isActive === false) {
          navigate('/signup');
          return;
        }

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

        const usersRef = collection(db, 'users');
        const userQuery = query(usersRef, where('uid', '==', user.uid));
        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
          const userDocRef = userSnapshot.docs[0].ref;
          const applicationsCollection = collection(userDocRef, 'applications');
          const applicationsSnapshot = await getDocs(applicationsCollection);

          const fetchedApplications = applicationsSnapshot.docs.map(doc => ({
            id: doc.id,
            title: doc.data().programTitle
          }));
          setApplications(fetchedApplications);
        }

        const programmesQuery = await getDocs(
          query(collection(db, 'programmes'), where('uid', '==', user.uid))
        );

        const fetchedProgrammes = programmesQuery.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setProgrammes(fetchedProgrammes);

        await setDoc(sessionRef, {
          lastActivity: new Date().toISOString()
        }, { merge: true });

      } catch (error) {
        console.error('Session check and data fetch error:', error);
        setCompanyDetails({ name: 'Company Name', logo: null });
        setApplications([]);
        setProgrammes([]);
        console.warn('There was an issue checking your session. Please try again.');
      }
    };

    checkSessionAndFetchData();
    const interval = setInterval(checkSessionAndFetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [navigate, auth, db]);

  const fetchFormResponses = async (programId) => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;
  
      // Query the 'programmes' collection where the 'id' field matches programId
      const programsRef = collection(db, 'programmes');
      const programQuery = query(programsRef, where('id', '==', programId));
      const programSnapshot = await getDocs(programQuery);
  
      if (!programSnapshot.empty) {
        // Get the first matching program document
        const programDocRef = programSnapshot.docs[0].ref;
  
        // Query the 'formResponses' subcollection where 'uid' matches the user's UID
        const responsesCollection = collection(programDocRef, 'formResponses');
        console.log(user.uid);
        const responsesQuery = query(responsesCollection, where('userId', '==', user.uid));
        const responsesSnapshot = await getDocs(responsesQuery);
  
        // Process the responses to extract only question and response fields
        const fetchedResponses = responsesSnapshot.docs.map(doc => {
          const data = doc.data();
          // Check if 'responses' exists and is an array
          if (data.responses && Array.isArray(data.responses)) {
            return data.responses.map(responseItem => ({
              question: responseItem.question || 'No question provided',
              response: responseItem.response || 'No response provided'
            }));
          }
          return []; // Return empty array if no valid responses array
        }).flat(); // Flatten the array of arrays into a single array
  
        setFormResponses(fetchedResponses);
      } else {
        console.log(`No program found with id: ${programId}`);
        setFormResponses([]);
      }
    } catch (error) {
      console.error('Error fetching form responses:', error);
      setFormResponses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyDetails = useCallback(async (user) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setCompanyDetails({
          name: userData.companyName || 'Company Name',
          logo: userData.logoUrl || userData.companyLogo || null
        });
        setLogoError(false);
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

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      fetchCompanyDetails(user);
    }
  }, [fetchCompanyDetails]);

  useEffect(() => {
    const fetchProgramDetails = async () => {
      if (selectedProgramId) {
        try {
          const programQuery = query(collection(db, 'programmes'), where('id', '==', selectedProgramId));
          const querySnapshot = await getDocs(programQuery);

          if (!querySnapshot.empty) {
            const programDoc = querySnapshot.docs[0];
            setEventDetails(programDoc.data());
          } else {
            console.log('No program found with the selectedProgramId');
          }
        } catch (error) {
          console.error('Error fetching program details:', error);
          setEventDetails(null);
        }
      }
    };

    fetchProgramDetails();
  }, [selectedProgramId, db]);

  const reloadApplications = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const usersRef = collection(db, 'users');
      const userQuery = query(usersRef, where('uid', '==', user.uid));
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        const userDocRef = userSnapshot.docs[0].ref;
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

  const Breadcrumb = ({ activeTab, selectedApplication, selectedProgram, eventDetails, setActiveTab }) => {
    const getBreadcrumbItems = () => {
      const items = [];
      switch (activeTab) {
        case 'discover':
          items.push({ label: 'Discover', onClick: () => setActiveTab('discover') });
          break;
        case 'programdetailpage':
          items.push(
            { label: 'Discover', onClick: () => setActiveTab('discover') },
            { label: eventDetails?.name || 'Event', onClick: () => setActiveTab('programdetailpage') }
          );
          break;
        case 'applicationform':
          items.push(
            { label: 'Discover', onClick: () => setActiveTab('discover') },
            { label: eventDetails?.name || 'Event', onClick: () => { setActiveTab('programdetailpage'); setSelectedProgramId(eventDetails?.id); } },
            { label: 'Application Form' }
          );
          break;
        case 'application':
          if (selectedApplication) {
            items.push({ label: selectedApplication.title || 'Untitled Application', onClick: () => setActiveTab('application') });
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
          <FontAwesomeIcon icon={faChevronRight} className="text-gray-400 w-3 h-3" />
        )}
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={item.label}>
            {index > 0 && (
              <FontAwesomeIcon icon={faChevronRight} className="text-gray-400 w-3 h-3" />
            )}
            {item.onClick ? (
              <a onClick={item.onClick} className="text-gray-900 hover:underline focus:outline-none">
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

  const Header = ({ activeTab, selectedApplication, setActiveTab, openSettings, eventDetails }) => {
    return (
      <div className="flex items-center justify-between px-4 py-2 sticky top-0 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button onClick={() => setActiveTab('home')} className="focus:outline-none hover:bg-gray-100 rounded-lg">
            <h6 className="text-black font-bold hover:opacity-80 transition-opacity px-2" style={{ fontFamily: 'CustomFont', fontSize: '30px' }}>
              seco
            </h6>
          </button>
          <Breadcrumb activeTab={activeTab} eventDetails={eventDetails} selectedApplication={selectedApplication} setActiveTab={setActiveTab} />
        </div>
        <a className="p-2 text-black hover:text-gray-300 focus:outline-none" onClick={openSettings}>
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
        await setDoc(sessionRef, { isActive: false, logoutTime: new Date().toISOString() }, { merge: true });
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
    setActiveTab('settings');
  };

  const goBack = () => {
    setActiveTab('home');
  };

  const NavItem = ({ icon, label, active, onClick, className = '' }) => (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-100 ${active ? 'bg-gray-200 font-medium' : ''} ${className}`}
    >
      <FontAwesomeIcon icon={icon} />
      <span>{label}</span>
    </button>
  );

  const handleApplicationClick = (application) => {
    setActiveTab('application');
    setSelectedApplication(application);
    setActiveApplicationTab('application');
    fetchFormResponses(application.id);
  };

  const ApplicationHeader = ({ application }) => (
    <div className="border-b border-gray-200 p-0">
      <div className="flex space-x-6">
        {['application'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveApplicationTab(tab)}
            className={`text-sm font-medium pb-2 ${activeApplicationTab === tab ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600 hover:text-gray-900'}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1).replace(/([A-Z])/g, ' $1')}
          </button>
        ))}
      </div>
    </div>
  );

  const handleTabChange = (tab, programId) => {
    setActiveTab(tab);
    setSelectedProgramId(programId);
  };

  return (
    <div className="flex h-screen bg-white">
      <div className="w-64 border-r border-gray-200 p-4 overflow-y-auto scrollbar-hide h-full">
        <div className="flex items-center gap-2 mb-6">
          <CompanyLogo />
          <span className="font-medium truncate">{companyDetails?.name || 'Loading...'}</span>
        </div>

        <nav className="space-y-1">
          <NavItem icon={faHome} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
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

        <div className="mt-8">
          <div className="text-sm text-gray-500 mb-2">Help</div>
          <nav className="space-y-1">
            <NavItem icon={faRocket} label="Get started" />
            <NavItem icon={faBook} label="How-to guides" />
            <NavItem icon={faQuestion} label="Help center" />
            <NavItem icon={faCommentDots} label="Contact support" />
          </nav>
        </div>

        <div className="mt-8 border-t pt-4">
          <NavItem icon={faSignOutAlt} label="Logout" onClick={handleLogout} className="text-red-600 hover:bg-red-50" />
        </div>
      </div>

      <div className="flex-1 overflow-hidden scrollbar-hide">
        <Header activeTab={activeTab} selectedApplication={selectedApplication} eventDetails={eventDetails} setActiveTab={setActiveTab} openSettings={openSettings} />
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
              <FProgramDetailPage programId={selectedProgramId} handleTabChange={handleTabChange} />
            </div>
          )}

          {activeTab === 'applicationform' && (
            <div className="h-[calc(100vh/1.16)] overflow-auto scrollbar-hide mt-8 mb-8">
              <Application programId={selectedProgramId} onFormSubmitSuccess={reloadApplications} />
            </div>
          )}

          {activeTab === 'application' && selectedApplication && (
            <div className="md:px-36 overflow-none mt-8 h-full">
              <ApplicationHeader application={selectedApplication} />
              <div className="py-4">
                {activeApplicationTab === 'application' && (
                  <div className="h-full">
                    {loading ? (
                      <p>Loading responses...</p>
                    ) : formResponses.length > 0 ? (
                      <div className="space-y-4">
                        {formResponses.map((response, index) => (
                          <div key={response.id || index} className="border p-4 rounded-lg">
                            {Object.entries(response).map(([key, value]) => (
                              key !== 'id' && (
                                <div key={key} className="mb-2">
                                  <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                                  <span>{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                                </div>
                              )
                            ))}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No responses submitted yet for this application.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="h-[calc(100vh/1.16)] overflow-auto scrollbar-hide mt-8 mb-8">
              <SettingsForm onProfileUpdate={reloadCompanyDetails} />
            </div>
          )}
        </main>
      </div>

      <button className="fixed bottom-4 right-4 w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-700" aria-label="Help">
        <FontAwesomeIcon icon={faQuestionCircle} size="lg" />
      </button>
    </div>
  );
};

export default FounderDashboard;
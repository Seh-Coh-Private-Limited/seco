import { collection, doc, getDocs, query, where, deleteDoc, setDoc, serverTimestamp, getFirestore } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { useParams, useNavigate } from 'react-router-dom';
import JudgesFormResponses from './JudgesFormResponses';
import './Dashboard.css';

const IncJudgeDashboard = ({ userid }) => { // Accept userid as a prop
  const [companyDetails, setCompanyDetails] = useState(null);
  const [logoError, setLogoError] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [judges, setJudges] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [judgeEmail, setJudgeEmail] = useState('');
  const [judgeName, setJudgeName] = useState('');

  const navigate = useNavigate();
  const db = getFirestore();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        await Promise.all([
          fetchCompanyDetails(),
          fetchPrograms()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (userid) { // Use userid instead of uid
      loadData();
    } else {
      setError('No judge ID provided');
      setLoading(false);
    }
  }, [userid]); // Dependency on userid

  const fetchCompanyDetails = async () => {
    try {
      const q = query(collection(db, 'judges'), where('id', '==', userid)); // Use userid
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        setCompanyDetails({
          name: userData.name || 'Company Name',
          logo: userData.logoUrl || null
        });
        setJudgeEmail(userData.email || '');
        setJudgeName(userData.name || '');
      } else {
        setCompanyDetails({ name: 'Company Name', logo: null });
        setJudgeEmail('');
        setJudgeName('');
      }
    } catch (error) {
      console.error('Error fetching company details:', error);
      setCompanyDetails({ name: 'Company Name', logo: null });
    }
  };

  const fetchPrograms = async () => {
    try {
      const judgesQuery = query(collection(db, 'judges'), where('id', '==', userid)); // Use userid
      const judgesSnapshot = await getDocs(judgesQuery);
      
      if (judgesSnapshot.empty) {
        setError('No judge found with this ID');
        setPrograms([]);
        return;
      }
  
      const judgeData = judgesSnapshot.docs[0].data();
      setJudgeEmail(judgeData.email);
      setJudgeName(judgeData.name);
      const programIds = judgeData.programId;

      if (!programIds || !Array.isArray(programIds) || programIds.length === 0) {
        setPrograms([]);
        return;
      }

      const programsQuery = query(collection(db, 'programmes'), where('id', 'in', programIds));
      const programsSnapshot = await getDocs(programsQuery);
      
      if (!programsSnapshot.empty) {
        const programsList = programsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPrograms(programsList);
        setSelectedProgramId(programsList[0]?.id || null);
        fetchJudges(programsList[0]?.id);
      } else {
        setPrograms([]);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
      setPrograms([]);
    }
  };

  const fetchJudges = async (programId) => {
    try {
      const q = query(collection(db, 'judges'), where('programId', 'array-contains', programId));
      const snapshot = await getDocs(q);
      const judgesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJudges(judgesList);
    } catch (error) {
      console.error('Error fetching judges:', error);
      setJudges([]);
    }
  };

  const Header = () => (
    <div className="flex items-center justify-between px-4 py-2 sticky top-0 bg-white border-b border-gray-200 z-10">
      <div className="flex items-center gap-4">
        <h6 className="text-black font-bold text-2xl" style={{ fontFamily: 'CustomFont' }}>
          seco
        </h6>
        <span className="text-gray-600">Judge Dashboard - {judgeName || 'Judge'}</span>
      </div>
    </div>
  );

  const CompanyLogo = () => {
    if (logoError || !companyDetails?.logo) {
      return <div className="w-8 h-8 rounded-full bg-gray-200" />;
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

  const handleTabSelect = (programId) => {
    setSelectedProgramId(programId);
    fetchJudges(programId); // Fetch judges for the selected program
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddJudge = async () => {
    if (!formData.name || !formData.email || !selectedProgramId) {
      alert('Please fill in both name and email and select a program');
      return;
    }

    setLoading(true);
    try {
      const judgeId = doc(collection(db, 'judges')).id;

      await setDoc(doc(db, 'judges', judgeId), {
        id: judgeId,
        name: formData.name,
        email: formData.email,
        programId: [selectedProgramId], // Use array for consistency
        createdAt: serverTimestamp()
      });

      setFormData({ name: '', email: '' });
      fetchJudges(selectedProgramId);
    } catch (error) {
      console.error('Error adding judge:', error);
      alert('Error adding judge');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveJudge = async (judgeId) => {
    if (window.confirm('Are you sure you want to remove this judge?')) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, 'judges', judgeId));
        fetchJudges(selectedProgramId);
      } catch (error) {
        console.error('Error removing judge:', error);
        alert('Error removing judge');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* <Header /> */}
      <main className="overflow-auto p-4">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : programs.length > 0 ? (
          <div className="mx-auto w-full p-10">
            <div className="mb-8 bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
              <h2 className="text-2xl font-bold text-gray-800">
                Hello, {judgeName || 'Judge'}
              </h2>
              <p className="mt-2 text-gray-600">
                You have been invited to the judging panel for the following programs.
                Below you'll find the list of startup applications assigned to you for review and scoring.
              </p>
            </div>
            <div className="mb-4">
              <div className="flex border-b border-gray-200">
                {programs.map(program => (
                  <button
                    key={program.id}
                    onClick={() => handleTabSelect(program.id)}
                    className={`px-4 py-2 -mb-px text-sm font-medium ${
                      selectedProgramId === program.id
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {program.name || 'Untitled Program'}
                  </button>
                ))}
              </div>
            </div>
            {selectedProgramId && (
              <div className="mb-8">
                <JudgesFormResponses
                  key={selectedProgramId} // Ensure re-render on tab switch
                  programId={selectedProgramId}
                  email={judgeEmail}
                  name={judgeName}
                  judgeId={userid} // Pass the judge's user ID (uid) to JudgesFormResponses
                />
              </div>
            )}
          </div>
        ) : (
          <div>No programs assigned to this judge</div>
        )}
      </main>

      <button
        className="fixed bottom-4 right-4 w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-700"
        aria-label="Help"
      >
        <FontAwesomeIcon icon={faQuestionCircle} size="lg" />
      </button>
    </div>
  );
};

export default IncJudgeDashboard;
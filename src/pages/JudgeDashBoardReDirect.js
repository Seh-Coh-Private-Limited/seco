import { collection, doc, getDocs, query, where, deleteDoc, setDoc, serverTimestamp, getFirestore } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { useParams, useNavigate } from 'react-router-dom';
import JudgesFormResponses from './JudgesFormResponses';
import './Dashboard.css';

const JudgeDashboard = () => {
  const [companyDetails, setCompanyDetails] = useState(null);
  const [logoError, setLogoError] = useState(false);
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [judges, setJudges] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [judgeEmail, setJudgeEmail] = useState(''); // New state for judge email
  const [judgeName,setJudgeName]=useState('');

  const navigate = useNavigate();
  const { uid } = useParams(); // Get UID from URL params
  const db = getFirestore();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        await Promise.all([
          fetchCompanyDetails(),
          fetchProgram()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [uid]); // Only re-run when uid changes

  const fetchCompanyDetails = async () => {
    try {
      const q = query(collection(db, 'judges'), where('uid', '==', uid));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        setCompanyDetails({
          name: userData.name || 'Company Name',
          logo: userData.logoUrl || null
        });
      } else {
        setCompanyDetails({ name: 'Company Name', logo: null });
      }
    } catch (error) {
      console.error('Error fetching company details:', error);
      setCompanyDetails({ name: 'Company Name', logo: null });
    }
  };

  const fetchProgram = async () => {
    try {
      const judgesQuery = query(collection(db, 'judges'), where('id', '==', uid));
      const judgesSnapshot = await getDocs(judgesQuery);
      
      if (judgesSnapshot.empty) {
        setError('No judge found');
        setProgram(null);
        return;
      }

      const judgeData = judgesSnapshot.docs[0].data();
      setJudgeEmail(judgeData.email); // Store the judge's email
      setJudgeName(judgeData.name);
      const programId = judgeData.programId;

      const programsQuery = query(collection(db, 'programmes'), where('id', '==', programId));
      const programsSnapshot = await getDocs(programsQuery);

      if (!programsSnapshot.empty) {
        const programData = programsSnapshot.docs[0].data();
        setProgram({ id: programsSnapshot.docs[0].id, ...programData });
        fetchJudges(programId); // Fetch judges for this program
      }
    } catch (error) {
      console.error('Error fetching program:', error);
      setProgram(null);
    }
  };

  const fetchJudges = async (programId) => {
    try {
      const q = query(collection(db, 'judges'), where('programId', '==', programId));
      const snapshot = await getDocs(q);
      const judgesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJudges(judgesList);
    } catch (error) {
      console.error('Error fetching judges:', error);
    }
  };

  const Header = () => (
    <div className="flex items-center justify-between px-4 py-2 sticky top-0 bg-white border-b border-gray-200 z-10">
      <div className="flex items-center gap-4">
        <h6 className="text-black font-bold text-2xl" style={{ fontFamily: 'CustomFont' }}>
          seco
        </h6>
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

  const fetchProgramDocument = async () => {
    if (!program?.id) return null;
    const q = query(collection(db, 'programmes'), where('id', '==', program.id));
    const snapshot = await getDocs(q);
    return snapshot.empty ? null : snapshot.docs[0];
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddJudge = async () => {
    if (!formData.name || !formData.email) {
      alert('Please fill in both name and email');
      return;
    }

    setLoading(true);
    try {
      const programDoc = await fetchProgramDocument();
      if (!programDoc) return;

      const judgeId = doc(collection(db, 'judges')).id;

      await setDoc(doc(db, `programmes/${programDoc.id}/judges`, judgeId), {
        id: judgeId,
        name: formData.name,
        email: formData.email,
        createdAt: serverTimestamp()
      });

      await setDoc(doc(db, 'judges', judgeId), {
        id: judgeId,
        name: formData.name,
        email: formData.email,
        programId: program.id,
        createdAt: serverTimestamp()
      });

      setFormData({ name: '', email: '' });
      fetchJudges(program.id);
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
        const programDoc = await fetchProgramDocument();
        if (!programDoc) return;

        await deleteDoc(doc(db, `programmes/${programDoc.id}/judges`, judgeId));
        await deleteDoc(doc(db, 'judges', judgeId));
        fetchJudges(program.id);
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
      <Header />
      <main className="flex-1 overflow-auto p-4">
        {loading ? (
          <div></div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : program ? (
          <div className="mx-auto">
            <div className="mb-8">
              {/* {program && (
                <span className="text-lg font-medium">{program.name || 'Untitled Program'}</span>
              )}
              <h3 className="text-lg font-semibold mb-4">Form Responses</h3> */}
              <JudgesFormResponses programId={program.id} email={judgeEmail} name={judgeName} /> {/* Pass judgeEmail */}
            </div>
          </div>
        ) : (
          <div>No program found</div>
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

export default JudgeDashboard;
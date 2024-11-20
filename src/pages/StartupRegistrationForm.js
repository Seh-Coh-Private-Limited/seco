import React, { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { getAuth } from '../firebase';
import { db } from '../firebase';

const TypeformRegistration = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [errors, setErrors] = useState({});
  const [fileURL, setFileURL] = useState(null);
  const [error, setError] = useState('');
  const [manualEntry, setManualEntry] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();
  const [isAutofill, setIsAutofill] = useState(false);
  const [entryMethod, setEntryMethod] = useState(null); // 'manual' or 'autofill'

  const [documentFile, setDocumentFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState(null);
  const [isParsingDocument, setIsParsingDocument] = useState(false);
 // Function to parse document using Gemini API
 const parseDocumentWithGemini = async (file) => {
  setIsParsingDocument(true);
  setError('');

  try {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const fileContent = e.target.result;
      const base64File = btoa(fileContent);

      try {
        const response = await fetch(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyBblrQcX2ID2K-NSn-sm9Nk-XtRrK7U69Y', 
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `Please extract the following information from this document:
                    - Company Name
                    - Social Media Links
                    - Company Website
                    - Brief Company Description
                    - Company Address
                    - Founder Name
                    - Email Address
                    - Mobile Number
                    
                    If any information is not found, return "Not Found". Provide a structured, easy-to-parse response.`
                }, {
                  inlineData: {
                    mimeType: file.type,
                    data: base64File
                  }
                }]
              }],
              generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 1024
              }
            })
          }
        );

        const data = await response.json();
        const extractedText = data.candidates[0].content.parts[0].text;
        
        const parsedResponses = parseExtractedText(extractedText);
        
        const validResponses = Object.fromEntries(
          Object.entries(parsedResponses)
            .filter(([key, value]) => value && value !== 'Not Found')
        );
        
        setResponses(prev => ({
          ...prev,
          ...validResponses
        }));

        await uploadDocumentToStorage(file);

        if (Object.keys(validResponses).length > 0) {
          handleNext();
        }

        setIsParsingDocument(false);
      } catch (error) {
        console.error('Error parsing document:', error);
        setError('Failed to parse document. Please try manual entry.');
        setIsParsingDocument(false);
      }
    };
    reader.readAsBinaryString(file);
  } catch (error) {
    console.error('File reading error:', error);
    setError('Error reading the document');
    setIsParsingDocument(false);
  }
};
const renderEntryMethodSelection = () => (
  <div className="mb-8 text-center">
    <h2 className="text-xl text-gray-900">Choose how to enter your information</h2>
    <div className="mt-4 flex flex-col gap-4">
      <button
        onClick={() => setEntryMethod('autofill')}
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
      >
        Upload Document for Autofill
      </button>
      <button
        onClick={() => setEntryMethod('manual')}
        className="px-4 py-2 bg-[#F99F31] text-white rounded-md hover:bg-[#F99F38]"
      >
        Enter Manually
      </button>
    </div>
  </div>
);

const renderAutofillUpload = () => (
  <div className="mb-8 text-center">
    <h2 className="text-xl text-gray-900">Upload your document</h2>
    <div className="mt-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
          id="document-upload"
        />
        <label htmlFor="document-upload" className="cursor-pointer flex flex-col items-center gap-3">
          <Upload className="w-8 h-8 text-gray-400" />
          <span className="text-gray-600">Upload Word/PDF Document</span>
        </label>
      </div>
    </div>
    {isParsingDocument && (
      <div className="mt-4">
        <p>Parsing document...</p>
        <div className="animate-pulse">Extracting company information</div>
      </div>
    )}
    {error && <div className="mt-4 text-red-500">{error}</div>}
  </div>
);

const uploadDocumentToStorage = async (file) => {
  try {
    const storage = getStorage();
    const user = auth.currentUser;
    if (!user) throw new Error("No authenticated user found");
    
    const storageRef = ref(storage, `users/${user.uid}/uploaded-documents/${encodeURIComponent(file.name)}`);
    const uploadResult = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(uploadResult.ref);
    
    setUploadedDocument({
      name: file.name,
      url: downloadURL
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    setError("Failed to upload document: " + error.message);
  }
};

const parseExtractedText = (text) => {
  const parsedResponses = {};
  const lines = text.split('\n');
  
  const mappings = {
    'Company Name:': 'companyName',
    'Social Media Links:': 'socialMedia',
    'Company Website:': 'website',
    'Company Description:': 'about',
    'Company Address:': 'address',
    'Founder Name:': 'founderName',
    'Email Address:': 'semail',
    'Mobile Number:': 'mobile'
  };

  lines.forEach(line => {
    Object.keys(mappings).forEach(key => {
      if (line.includes(key)) {
        const value = line.split(':')[1].trim();
        parsedResponses[mappings[key]] = value;
      }
    });
  });

  return parsedResponses;
};

const handleFileChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.type.startsWith('image/')) {
    await handleLogoUpload(file);
  } else {
    await parseDocumentWithGemini(file);
  }
};
  const questions = [
    { id: 'logo', text: "First, let's add your company logo", type: 'file', required: true },
    { id: 'companyName', text: "What's your company name?", type: 'text', required: true },
    { id: 'socialMedia', text: "Share your social media links with us", type: 'text', placeholder: "LinkedIn, Twitter, Instagram URLs...", required: true },
    { id: 'website', text: "What's your company website?", type: 'text', placeholder: "https://", required: true },
    { id: 'about', text: "Tell us briefly about your company", type: 'textarea', required: true },
    { id: 'address', text: "Where is your company headquartered?", type: 'text', required: true },
    { id: 'founderName', text: "What's your founder full name?", type: 'text', required: true },
    { id: 'semail', text: "What's your email address?", type: 'email', required: true },
    { id: 'mobile', text: "Finally, what's your mobile number?", type: 'text', required: true }
  ];

  // Initialize all fields with empty strings when category is selected
  useEffect(() => {
    if (selectedCategory) {
      const initialResponses = questions.reduce((acc, question) => {
        acc[question.id] = '';
        return acc;
      }, {});
      setResponses(initialResponses);
    }
  }, [selectedCategory]);

  const autofillOptions = [
    'LinkedIn',
    'Upload Word/PDF Document with Q&As',
  ];

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleNext();
    }
  };

  useEffect(() => {
    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [currentStep, responses]);

  const handleInputChange = (value) => {
    const currentQuestion = questions[currentStep];
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: value || '' // Ensure empty values are stored as empty strings
    }));
    validateInput(currentQuestion.id, value);
  };

  const validateInput = (id, value) => {
    let error = '';
    if (value) { // Only validate if there's a value
      switch (id) {
        case 'semail':
          if (!isValidEmail(value)) {
            error = 'Please enter a valid email address';
          }
          break;
        case 'mobile':
          if (!isValidMobile(value)) {
            error = 'Please enter a valid 10-digit mobile number';
          }
          break;
        case 'website':
          if (!isValidURL(value)) {
            error = 'Please enter a valid URL';
          }
          break;
      }
    }
    setErrors(prev => ({
      ...prev,
      [id]: error
    }));
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidMobile = (mobile) => /^\d{10}$/.test(mobile);
  const isValidURL = (url) => /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(url);

  // const handleFileChange = async (e) => {
  //   const file = e.target.files[0];
  //   if (!file) {
  //     setResponses(prev => ({
  //       ...prev,
  //       logo: '' // Set empty string if no file is selected
  //     }));
  //     return;
  //   }

  //   try {
  //     const storage = getStorage();
  //     const user = auth.currentUser;
  //     if (!user) throw new Error("No authenticated user found");
      
  //     const storageRef = ref(storage, `users/${user.uid}/company-logos/${encodeURIComponent(file.name)}`);
  //     const uploadResult = await uploadBytes(storageRef, file);
  //     const downloadURL = await getDownloadURL(uploadResult.ref);
      
  //     setFileURL(downloadURL);
  //     setResponses(prev => ({
  //       ...prev,
  //       logo: downloadURL
  //     }));
  //     setError('');
  //   } catch (error) {
  //     console.error("Error uploading file:", error);
  //     setError("Failed to upload file: " + error.message);
  //     setResponses(prev => ({
  //       ...prev,
  //       logo: '' // Set empty string if upload fails
  //     }));
  //   }
  // };

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) {
      setError("No authenticated user found. Please sign in.");
      return;
    }

    // Ensure all fields exist in the submission data
    const completeResponses = questions.reduce((acc, question) => {
      acc[question.id] = responses[question.id] || '';
      return acc;
    }, {});

    const randomId = Math.random().toString(36).substr(2, 9) + Date.now();
    const dataWithTimestamp = {
      timestamp: Timestamp.now(),
      customId: randomId,
      category: selectedCategory,
      uid: user.uid,
      ...completeResponses // Use the complete responses object
    };

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, dataWithTimestamp, { merge: true });
      alert('Your responses have been submitted successfully!');
      navigate(selectedCategory === 'Startup' ? '/fDashboard' : '/dashboard');
    } catch (error) {
      console.error('Error saving responses:', error);
      setError("Error submitting responses. Please try again.");
    }
  };

  const handleNext = () => {
    if (currentStep === questions.length - 1) {
      handleSubmit();
    } else {
      // Ensure the current field exists in responses before moving to next step
      const currentQuestion = questions[currentStep];
      if (!(currentQuestion.id in responses)) {
        setResponses(prev => ({
          ...prev,
          [currentQuestion.id]: ''
        }));
      }
      setCurrentStep(prev => prev + 1);
    }
  };
  const handleLogoUpload = async (file) => {
    try {
      const storage = getStorage();
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user found");
      
      const storageRef = ref(storage, `users/${user.uid}/company-logos/${encodeURIComponent(file.name)}`);
      const uploadResult = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(uploadResult.ref);
      
      setFileURL(downloadURL);
      setResponses(prev => ({
        ...prev,
        logo: downloadURL
      }));
      setError('');
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Failed to upload file: " + error.message);
      setResponses(prev => ({
        ...prev,
        logo: ''
      }));
    }
  };
  // Rest of the component remains the same...
  const renderInput = () => {
    const question = questions[currentStep];
    if (isParsingDocument) {
      return (
        <div className="text-center">
          <p>Parsing document...</p>
          <div className="animate-pulse">Extracting company information</div>
        </div>
      );
    }
    switch (question.type) {
      case 'file':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              accept="image/*, .pdf, .doc, .docx"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-3">
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="text-gray-600">Click to upload or drag and drop</span>
            </label>
          </div>
        );

      case 'textarea':
        return (
          <div className="flex flex-col mb-4">
            <textarea
              value={responses[question.id] || ''}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Type your answer..."
              rows={4}
              className={`w-full p-4 text-gray-700 border-b-2 bg-transparent ${
                errors[question.id] ? 'border-red-500' : 'border-gray-400'
              } focus:outline-none focus:ring-0 focus:border-blue-500 placeholder-gray-400 resize-none`}
            />
            {errors[question.id] && (
              <span className="text-red-500 text-sm mt-1">{errors[question.id]}</span>
            )}
          </div>
        );

      default:
        return (
          <div className="flex flex-col mb-4">
            <input
              type={question.type}
              value={responses[question.id] || ''}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Type your answer..."
              className={`w-full p-4 text-gray-700 border-b-2 bg-transparent ${
                errors[question.id] ? 'border-red-500' : 'border-gray-400'
              } focus:outline-none focus:ring-0 focus:border-blue-500 placeholder-gray-400`}
            />
            {errors[question.id] && (
              <span className="text-red-500 text-sm mt-1">{errors[question.id]}</span>
            )}
          </div>
        );
    }
  };


  const renderButtons = () => {
    const isLastQuestion = currentStep === questions.length - 1;

    return (
      <div className="flex justify-center mt-6">
        {isLastQuestion ? (
          <button
            className="bg-[#F99F31] text-white rounded-md py-2 px-6 hover:bg-[#F99F38]"
            onClick={handleSubmit}
          >
            Submit
          </button>
        ) : (
          <>
            <button
              className="bg-[#F99F31] text-white rounded-md py-2 px-6 hover:bg-[#F99F38]"
              onClick={handleNext}
            >
              Next
            </button>
            <button
              className="bg-gray-400 text-white rounded-md py-2 px-6 hover:bg-gray-500 ml-4"
              onClick={handleNext}
            >
              Skip
            </button>
          </>
        )}
      </div>
    );
  };
  const handleAutofillSelection = () => {
    setIsAutofill(true);
  };

  const handleManualEntry = () => {
    setIsAutofill(false);
    setCurrentStep(0);
  };

  const handleNavigationClick = (direction) => {
    if (direction === 'up') {
      setCurrentStep(Math.max(0, currentStep - 1));
    } else if (direction === 'down' && currentStep < questions.length - 1) {
      // Only allow moving down if not on the last question
      handleNext();
    }
  };





  return (
    <div className="bg-gray-50 flex flex-col">
      <div className="px-4 py-3 bg-white">
        <div className="max-w-6xl flex justify-between gap-8">
          <div className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'CustomFont', fontSize: '30px', paddingLeft: '10px', paddingRight: '300px' }}>
            seco
          </div>
          <div className="flex items-center flex-1 justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-200  text-white flex items-center justify-center text-sm">✓</div>
              <span className="text-sm text-gray-900">Create your account</span>
            </div>
            <div className="h-px bg-gray-300 flex-1" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-600  text-gray-600 flex items-center justify-center text-sm">2</div>
              <span className="text-sm text-gray-600">Customize your experience</span>
            </div>
            <div className="h-px bg-gray-300 flex-1" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm">3</div>
              <span className="text-sm text-gray-600">Apply for Programmes</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex bg-white items-center justify-center p-6">
        <div className="w-full max-w-8xl h-[calc(100vh/1.17)] bg-gray-300 px-16 py-8 rounded-lg shadow-lg flex flex-col items-center justify-center">
        <div className="w-full px-4 py-6 rounded-md flex flex-col items-center justify-center">
            {!selectedCategory ? (
              // Category selection
              <div className="mb-8 text-center">
                <h2 className="text-xl text-gray-900">Select your category</h2>
                <div className="mt-4">
                  {["Startup", "Incubator"].map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className="px-4 py-2 m-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            ) : entryMethod === null ? (
              renderEntryMethodSelection()
            ) : entryMethod === 'autofill' ? (
              renderAutofillUpload()
            ) : (
              // Questions display (both for manual entry and after autofill)
              <div className="mb-8 text-center">
                <h2 className="text-xl text-gray-900">
                  <span className="mr-2 text-gray-400 font-light">{currentStep + 1}→</span>
                  {questions[currentStep]?.text}
                </h2>
                {renderInput()}
                {error && <div className="text-red-500 mt-2">{error}</div>}
                {renderButtons()}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-9 right-9">
        <div className="bg-gray-900 text-white rounded-lg shadow-lg p-1 flex">
          <button
            className="p-2 hover:bg-gray-700 rounded transition-colors duration-150"
            onClick={() => handleNavigationClick('up')}
          >
            ↑
          </button>
          <button
            className="p-2 hover:bg-gray-700 rounded transition-colors duration-150"
            onClick={() => handleNavigationClick('down')}
            disabled={currentStep === questions.length - 1}
          >
            ↓
          </button>
        </div>
      </div>
    </div>
  );
};

export default TypeformRegistration;
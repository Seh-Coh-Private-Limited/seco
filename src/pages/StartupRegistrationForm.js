import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage'; // Import necessary Firebase Storage functions
import { Upload } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { redirect } from 'react-router-dom';
import { db } from '../firebase';



const TypeformRegistration = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');
  const [manualEntry, setManualEntry] = useState(false); // To track if manual entry is selected
  const [inputValue, setInputValue] = useState('');
  const [fileURL, setFileURL] = useState(null); // To store the file's download URL
  const [responses, setResponses] = useState({});
  


  const questions = [
    { id: 'logo', text: "First, let's add your company logo", type: 'file', required: true },
    { id: 'companyName', text: "What's your company name?", type: 'text', required: true },
    { id: 'socialMedia', text: "Share your social media links with us", type: 'text', placeholder: "LinkedIn, Twitter, Instagram URLs...", required: true },
    { id: 'website', text: "What's your company website?", type: 'text', placeholder: "https://", required: true },
    { id: 'about', text: "Tell us briefly about your company", type: 'textarea', required: true },
    { id: 'address', text: "Where is your company headquartered?", type: 'text', required: true },
    { id: 'founderName', text: "What's your founder full name?", type: 'text', required: true },
    { id: 'email', text: "What's your email address?", type: 'email', required: true },
    { id: 'mobile', text: "Finally, what's your mobile number?", type: 'text', required: true }
  ];

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && answers[questions[currentStep].id]) {
      handleNext();
    }
  };

  useEffect(() => {
    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [currentStep, answers]);
  const handleSubmit = async () => {
    // Ensure that the responses state has all the necessary data, including the file URL
    const fileURL = responses[questions[currentStep].id]; // This should contain the file URL from the file upload

    if (!fileURL) {
        setError("Please upload a file before submitting.");
        return;
    }

    // Prepare the data to be submitted to Firestore
    const dataWithTimestamp = {
        ...responses, // Include the answers/responses
 // Add the file URL from file upload
        timestamp: Timestamp.now() // Add the current timestamp
    };

    try {
        // Add the document to Firestore's 'startups' collection
        const docRef = await addDoc(collection(db, 'startups'), dataWithTimestamp);

        // Log the document ID to the console
        console.log('Responses saved with document ID:', docRef.id);

        // Optionally, you could show a success message or redirect to another page
        setError(""); // Clear any previous errors
        alert('Your responses have been submitted successfully!'); // Success message

        // Reset the form or perform any other necessary actions after submission
    } catch (error) {
        console.error('Error saving responses:', error);
        setError("Error submitting responses. Please try again.");
    }
};

  
  const handleNext = () => {
    // If it's the last question, do nothing
    if (currentStep === questions.length - 1) {
        handleSubmit();
        redirect('/dashboard');
         // Do nothing for now on the last question
    }

    const currentQuestion = questions[currentStep];

    // Check if the input is valid for the current question
    if (!isValidInput()) {
      setError('This field is required'); // Set error message if invalid input
      return; // Do not proceed to next step if invalid
    }

    setError(null); // Clear any previous errors if input is valid

    // Proceed to next step
    setCurrentStep(currentStep + 1);
  };

  const handleChoice = (value) => {
    setAnswers({ ...answers, [questions[currentStep].id]: value });
    setError('');
  };

  const renderInput = () => {
    const question = questions[currentStep];
    
    const handleChange = (value) => {
        setAnswers((prevAnswers) => ({
            ...prevAnswers,
            [question.id]: value,
        }));
        
        setResponses((prevResponses) => ({
            ...prevResponses,
            [question.id]: value,
        }));
    };

    switch (question.type) {
      case 'file':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="logo-upload"
            />
            <label htmlFor="logo-upload" className="cursor-pointer flex flex-col items-center gap-3">
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="text-gray-600">Click to upload or drag and drop</span>
            </label>
          </div>
        );
      
      case 'textarea':
        return (
          <div className="flex flex-col mb-4">
            <label htmlFor={question.id} className="text-lg text-gray-700 mb-2">
              {question.label || 'Your Input'}
            </label>
            <textarea
              id={question.id}
              value={answers[question.id] || ''}
              onChange={(e) => handleChange(e.target.value)}  // Use handleChange here
              placeholder={question.placeholder || 'Type your answer...'}
              rows={4}
              className="w-full p-4 text-gray-700 border-b-2 border-gray-400 focus:outline-none focus:ring-0 focus:border-blue-500 placeholder-gray-400 resize-none"
              style={{
                background: 'transparent', 
                boxShadow: 'none', 
                borderTop: 'none', 
                borderLeft: 'none', 
                borderRight: 'none',
              }}
            />
          </div>
        );

      default:
        return (
          <div className="flex flex-col mb-4">
            <label htmlFor={question.id} className="text-lg text-gray-700 mb-2">
              {question.label || 'Your Input'}
            </label>
            <input
              id={question.id}
              type={question.type}
              value={answers[question.id] || ''}
              onChange={(e) => handleChange(e.target.value)}  // Use handleChange here
              placeholder={question.placeholder || 'Type your answer...'}
              className="w-full p-4 text-gray-700 border-b-2 border-gray-400 focus:outline-none focus:ring-0 focus:border-blue-500 placeholder-gray-400"
              style={{
                background: 'transparent', 
                boxShadow: 'none', 
                borderTop: 'none', 
                borderLeft: 'none', 
                borderRight: 'none',
              }}
            />
          </div>
        );
    }
};


const isValidInput = () => {
    const currentQuestion = questions[currentStep];
    if (currentQuestion?.type === 'file') {
      // Check if a file is uploaded
      return !!answers[currentQuestion.id];
    } else {
      // Check if the field is not empty
      return !!answers[currentQuestion.id]?.trim();
    }
  };
  

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
  
    if (file) {
      try {
        // Initialize Firebase Storage reference
        const storage = getStorage();
        const storageRef = ref(storage, `uploads/${encodeURIComponent(file.name)}`); // Ensure the filename is correctly encoded
  
        // Upload the file to Firebase Storage
        const uploadResult = await uploadBytes(storageRef, file);
        console.log("File uploaded successfully:", uploadResult); // Log upload result for debugging
  
        // After the file is uploaded, get the download URL
        const downloadURL = await getDownloadURL(storageRef); // Use `uploadResult.ref` for getting the download URL
  
        console.log("File available at URL:", downloadURL); // Log the URL to check
  
        // Ensure the correct question ID (for the logo)
        const currentQuestionId = questions[currentStep]?.id; // Check if currentQuestionId exists
        if (currentQuestionId) {
          console.log("Updating answers with logo URL for question ID:", currentQuestionId);
          
          // Store the download URL (a string) in the answers state
          setAnswers((prevAnswers) => ({
            ...prevAnswers,
            [currentQuestionId]: downloadURL, // Store the URL as a string
          }));
        } else {
          console.error("Invalid question ID:", currentQuestionId);
        }
  
        setError(''); // Clear any previous errors
      } catch (error) {
        console.error("Error uploading file:", error);
        setError("Failed to upload file");
      }
    } else {
      setError('No file selected');
    }
  };

  const autofillOptions = [
    'Crunchbase',
    'Traxcn',
    'Pitchbook',
    'LinkedIn',
    'Google',
    'Microsoft',
    'Google Autofill',
    'Google Sheet',
    'Upload Word/PDF Document with Q&As',
  ];

  return (
    <div className="bg-gray-50 flex flex-col">
      {/* Header with Logo and Progress Steps */}
      <div className="px-4 py-3 bg-white">
        <div className="max-w-6xl flex justify-between gap-8">
          {/* Logo */}
          <div className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'CustomFont', fontSize: '30px', paddingLeft: '10px', paddingRight: '300px' }}>
            seco
          </div>
           {/* Progress Steps: Centered */}
    <div className="flex items-center flex-1 justify-center gap-4">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">✓</div>
        <span className="text-sm text-gray-900">Create your account</span>
      </div>
      <div className="h-px bg-gray-300 flex-1" />
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm">2</div>
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

    {/* Main Content */}
<div className="flex-1 flex bg-white items-center justify-center p-6">
  <div className="w-full max-w-8xl h-[calc(100vh/1.17)] bg-gray-300 px-16 py-8 rounded-lg shadow-lg flex flex-col items-center justify-center">
    <div className="w-full px-4 py-6 rounded-md flex flex-col items-center justify-center">
      {/* Autofill Options or Manual Entry */}
      {!manualEntry && currentStep === 0 && (
        <div className="mb-8 text-center">
          <h2 className="text-xl text-gray-900">Select an autofill method</h2>
          <div className="mt-4">
            {autofillOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => setManualEntry(true)} // Directly trigger manual entry when an option is clicked
                className="px-4 py-2 m-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                {option}
              </button>
            ))}
            {/* Manual entry option */}
            <button
              onClick={() => setManualEntry(true)}
              className="mt-4 px-4 py-2 bg-[#F99F31] text-white rounded-md hover:bg-[#F99F38]"
            >
              Enter Manually
            </button>
          </div>
        </div>
      )}

      {/* Display Questions when Manual Entry is selected */}
      {manualEntry && (
        <div className="mb-8 text-center">
          <h2 className="text-xl text-gray-900">
            <span className="mr-2 text-gray-400 font-light">{currentStep + 1}→</span>
            {questions[currentStep]?.text}
          </h2>
          {renderInput()}
          {error && <div className="text-red-500 mt-2">{error}</div>}
          <div className="flex justify-between mt-6">
            {/* Next button should only be enabled when there is a valid input */}
            <button
              className={`bg-[#F99F31] text-white rounded-md py-2 px-6 hover:bg-[#F99F38] ${isValidInput() ? '' : 'opacity-50 cursor-not-allowed'}`}
              onClick={handleNext}
              disabled={!isValidInput()} // Disable button if any required input is missing
            >
              {currentStep === questions.length - 1 ? 'Submit' : 'Next'}
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
</div>


        {/* Navigation Controls */}
<div className="fixed bottom-9 right-9">
  <div className="bg-gray-900 text-white rounded-lg shadow-lg p-1 flex">
    <button
      className="p-2 hover:bg-gray-700 rounded transition-colors duration-150"
      onClick={() => {
        if (isValidInput()) {
          setCurrentStep(Math.max(0, currentStep - 1));
        }
      }}
    >
      ↑
    </button>
    <button
      className="p-2 hover:bg-gray-700 rounded transition-colors duration-150"
      onClick={() => {
        if (isValidInput()) {
          handleNext();
        }
      }}
    >
      ↓
    </button>
  </div>

        </div>
    </div>
  );
};

export default TypeformRegistration;

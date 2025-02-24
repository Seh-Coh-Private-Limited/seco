import { collection, getDocs, query, where } from 'firebase/firestore';
import { Send, User } from "lucide-react";
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';

// Loading dots animation
const LoadingDots = () => (
  <div className="flex items-center space-x-1 p-2">
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
  </div>
);

// Typewriter component
const Typewriter = ({ text, speed = 50, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setDisplayedText('');
    setIsComplete(false);

    const typeText = async () => {
      for (let i = 0; i <= text.length; i++) {
        if (!isMounted) break;
        setDisplayedText(text.slice(0, i));
        await new Promise(resolve => setTimeout(resolve, speed));
      }
      if (isMounted) {
        setIsComplete(true);
        onComplete?.();
      }
    };

    typeText();
    return () => { isMounted = false; };
  }, [text, speed, onComplete]);

  return (
    <div className="min-h-[2em] flex items-center">
      <h2 className="text-xl font-semibold">
        {displayedText}
        {!isComplete && <span className="ml-1 animate-pulse">|</span>}
      </h2>
    </div>
  );
};
// Custom icons as SVG components
const AttachmentIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M12.65 10.35a.5.5 0 0 1-.7.7l-1.8-1.8a2.5 2.5 0 0 0-3.54 3.54l4.95 4.95a3.5 3.5 0 0 0 4.95-4.95l-4.95-4.95a4.5 4.5 0 0 0-6.36 6.36l4.95 4.95.7-.7-4.95-4.95a3.5 3.5 0 0 1 4.95-4.95l4.95 4.95a2.5 2.5 0 0 1-3.54 3.54l-4.95-4.95a1.5 1.5 0 0 1 2.12-2.12l1.8 1.8Z" />
  </svg>
);

const VoiceIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z"/>
    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
  </svg>
);
const BotAvatar = () => (
  <div className="w-8 h-8 rounded-full bg-white relative overflow-hidden flex justify-center items-center">
    <svg width="60%" height="60%" viewBox="0 0 95 95" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M0.486816 0.412964H24.0868H35.8868L47.6868 47.613L59.4868 0.412964H71.2868H94.8867V24.013V35.813L47.6868 47.613L94.8867 59.413V71.213V94.813H71.2868H59.4868L47.6868 47.613L35.8868 94.813H24.0868H0.486816V71.213V59.413L47.6868 47.613L0.486816 35.813V24.013V0.412964Z" 
        fill="#F99F31" 
      />
    </svg>
  </div>
);
const QuestionOptions = ({ type, options, onSelect, disabled }) => {
  const [selectedOptions, setSelectedOptions] = useState(new Set());

  useEffect(() => {
    setSelectedOptions(new Set());
  }, [type, options]);

  if (!options || !Array.isArray(options) || options.length === 0 || 
      !['multipleChoice', 'checkbox'].includes(type) || disabled) {
    return null;
  }

  const handleCheckboxChange = (option) => {
    const newSelection = new Set(selectedOptions);
    if (newSelection.has(option)) {
      newSelection.delete(option);
    } else {
      newSelection.add(option);
    }
    setSelectedOptions(newSelection);
    onSelect(Array.from(newSelection));
  };

  const handleMultipleChoiceSelect = (option) => {
    setSelectedOptions(new Set([option]));
    onSelect(option);
  };

  if (type === 'multipleChoice') {
    return (
      <div className="mt-4 space-y-2">
        <h3 className="text-gray-600 mb-2">Select one option:</h3>
        <div className="space-y-2">
          {options.map((option, idx) => (
            <label key={idx} className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="multipleChoice"
                value={option}
                checked={selectedOptions.has(option)}
                onChange={() => handleMultipleChoiceSelect(option)}
                className="form-radio h-5 w-5 text-blue-500 border-gray-300 focus:ring-blue-500"
                disabled={disabled}
              />
              <span className="text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'checkbox') {
    return (
      <div className="mt-4 space-y-2">
        <h3 className="text-gray-600 mb-2">Select all that apply:</h3>
        <div className="space-y-2">
          {options.map((option, idx) => (
            <label key={idx} className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                value={option}
                checked={selectedOptions.has(option)}
                onChange={() => handleCheckboxChange(option)}
                className="form-checkbox h-5 w-5 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                disabled={disabled}
              />
              <span className="text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  return null;
};
const SuggestionsCache = new Map();

const AISuggestions = ({ questionType, currentQuestion, nextQuestion, onSuggestionClick }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);

  const generatePrompt = (type, question) => {
    if (!question) return null;
    
    switch (type) {
      case 'shortText':
        return `Please generate 3 short, concise responses for the question: "${question}". Format each response on a new line.`;
      case 'longText':
        return `Please generate 3 detailed responses for the question: "${question}". Format each response on a new line.`;
      default:
        return null;
    }
  };

  const fetchSuggestionsForQuestion = async (type, question) => {
    const cacheKey = `${type}-${question}`;
    if (SuggestionsCache.has(cacheKey)) {
      return SuggestionsCache.get(cacheKey);
    }

    const prompt = generatePrompt(type, question);
    if (!prompt) return [];

    try {
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyCVO0SZ7YlX7uTsbwaDKuXRJsDKtnO7pts',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from API');
      }

      const text = data.candidates[0].content.parts[0].text;
      const suggestions = text.split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('•') && !line.match(/^\d+\./))
        .slice(0, 3);

      SuggestionsCache.set(cacheKey, suggestions);
      return suggestions;
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      return [];
    }
  };

  // Prefetch suggestions for the current question
  useEffect(() => {
    const loadSuggestions = async () => {
      setSuggestions([]);
      setError(null);
      
      // Only show suggestions for shortText and longText
      if (!['shortText', 'longText'].includes(questionType) || !currentQuestion?.question) {
        return;
      }

      try {
        // Use the cached suggestions if available
        const currentSuggestions = await fetchSuggestionsForQuestion(
          questionType, 
          currentQuestion.question
        );
        setSuggestions(currentSuggestions);
      } catch (err) {
        setError('Failed to load suggestions');
      }
    };

    loadSuggestions();
  }, [questionType, currentQuestion?.question]);

  // Prefetch suggestions for the next question
  useEffect(() => {
    const prefetchNextSuggestions = async () => {
      if (nextQuestion?.question && ['shortText', 'longText'].includes(nextQuestion.type)) {
        try {
          // Just fetch to cache, don't need to store the result
          await fetchSuggestionsForQuestion(
            nextQuestion.type,
            nextQuestion.question
          );
        } catch (err) {
          console.error('Error prefetching next suggestions:', err);
        }
      }
    };

    prefetchNextSuggestions();
  }, [nextQuestion]);

  // Only render for shortText and longText
  if (!['shortText', 'longText'].includes(questionType)) {
    return null;
  }

  // Don't render if no suggestions available
  if (!suggestions.length) {
    return null;
  }

  return (
    <>
      <div className="my-4 border-t border-gray-200" /> {/* Visual break */}
      <div className="space-y-2">
        <p className="text-sm text-gray-500 mb-2">Suggested responses:</p>
        {error ? (
          <div className="text-sm text-red-500 p-2 bg-red-50 rounded">{error}</div>
        ) : (
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSuggestionClick(suggestion)}
                className="block w-full text-left p-3 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 border border-gray-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};


// Message Component
// Message Component





const Application = ({ programId }) => {
  const [inputValue, setInputValue] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(-1);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [programTitle, setProgramTitle] = useState('');
  const [messages, setMessages] = useState([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasSeenTypewriter, setHasSeenTypewriter] = useState(false);
  const typewriterText = "This application is the first step towards turning vision into innovation. Let's begin!";
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [isStartupNameQuestion, setIsStartupNameQuestion] = useState(true);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize Web Speech API
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        
        recognitionInstance.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
          
          setInputValue(transcript);
        };

        recognitionInstance.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
        };

        recognitionInstance.onend = () => {
          setIsRecording(false);
        };

        setRecognition(recognitionInstance);
      }
    }
  }, []);
 // ... (keep all the imports and other components)

 const Message = ({ message, onOptionSelect, isLoading }) => {
  const renderQuestionInput = () => {
    if (message.type !== 'bot') return null;

    switch (message.questionType) {
      case 'multipleChoice':
      case 'checkbox':
        return message.options && message.options.length > 0 ? (
          <QuestionOptions
            type={message.questionType}
            options={message.options}
            onSelect={onOptionSelect}
            disabled={isLoading}
          />
        ) : null;

      case 'shortText':
      case 'longText':
        return (
          <AISuggestions
            questionType={message.questionType}
            currentQuestion={{
              question: message.content,
              type: message.questionType
            }}
            nextQuestion={questions[currentQuestion + 1]}
            onSuggestionClick={(suggestion) => {
              if (suggestion) onOptionSelect(suggestion);
            }}
          />
        );

      case 'date':
        return (
          <div className="mt-4">
            <input
              type="date"
              onChange={(e) => onOptionSelect(e.target.value)}
              className="p-2 border rounded-lg focus:outline-none focus:border-blue-500"
              disabled={isLoading}
            />
          </div>
        );

      case 'time':
        return (
          <div className="mt-4">
            <input
              type="time"
              onChange={(e) => onOptionSelect(e.target.value)}
              className="p-2 border rounded-lg focus:outline-none focus:border-blue-500"
              disabled={isLoading}
            />
          </div>
        );

      case 'rating':
        return (
          <div className="mt-4">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => onOptionSelect(rating.toString())}
                  disabled={isLoading}
                  className={`
                    w-10 h-10 rounded-full border 
                    flex items-center justify-center
                    hover:bg-blue-50 hover:border-blue-500
                    transition-colors duration-200
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>
        );

     

      default:
        return null;
    }
  };

  return (
    <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-2 max-w-[80%]`}>
        {message.type === 'user' ? (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
            <User size={20} />
          </div>
        ) : (
          <BotAvatar />
        )}
        <div>
          <div className={`rounded-lg p-3 ${
            message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'
          }`}>
            <div className="whitespace-pre-line">{message.content}</div>
          </div>
          {renderQuestionInput()}
          <div className="text-xs text-gray-500 mt-1">{message.timestamp}</div>
        </div>
      </div>
    </div>
  );
};

// ... (keep the rest of your updated component code that fixes the duplicate questions)
  const handleVoiceRecord = () => {
    if (!recognition) {
      console.error('Speech recognition not supported in this browser');
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      try {
        recognition.start();
        setIsRecording(true);
      } catch (err) {
        if (err.message === 'Failed to execute \'start\' on \'SpeechRecognition\': recognition has already started.') {
          recognition.stop();
        } else {
          console.error('Error starting speech recognition:', err);
        }
      }
    }
  };

  const getCurrentQuestionType = () => {
    if (currentQuestion >= 0 && questions[currentQuestion]) {
      return questions[currentQuestion].type;
    }
    return null;
  };

  const handleFileUpload = (event) => {
    // Only process the file if we're on a file-type question
    if (getCurrentQuestionType() === 'fileUpload') {
      const file = event.target.files[0];
      if (file) {
        setInputValue(`File selected: ${file.name}`);
      }
    }
  };


  // Add feedback toast component
  const Toast = ({ message, isVisible }) => {
    if (!isVisible) return null;
    
    return (
      <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg shadow-lg">
        {message}
      </div>
    );
  };

  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);

  const showToast = (message) => {
    setToastMessage(message);
    setIsToastVisible(true);
    setTimeout(() => setIsToastVisible(false), 3000);
  };

  useEffect(() => {
    if (!recognition && typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        showToast('Speech recognition is not supported in this browser');
      }
    }
  }, [recognition]);
  useEffect(() => {
    const fetchProgramData = async () => {
      try {
        const programQuery = query(
          collection(db, 'programmes'),
          where('id', '==', programId)
        );
        const programSnapshot = await getDocs(programQuery);
    
        if (programSnapshot.empty) throw new Error('Program not found');
    
        const programDoc = programSnapshot.docs[0];
        setProgramTitle(programDoc.data().title);
    
        const questionsSnapshot = await getDocs(
          collection(db, 'programmes', programDoc.id, 'form')
        );
    
        const fetchedQuestions = [];
        
        questionsSnapshot.forEach((doc) => {
          const questionData = doc.data();
          if (Array.isArray(questionData.questions)) {
            questionData.questions.forEach((q) => {
              // Process options
              let processedOptions = [];
              if (q.options) {
                if (Array.isArray(q.options)) {
                  processedOptions = q.options;
                } else if (typeof q.options === 'object') {
                  processedOptions = Object.values(q.options);
                }
              }

              // Create a unique ID using both the document ID and question title
              const questionId = `${doc.id}_${q.title}`;
              
              fetchedQuestions.push({
                id: questionId,
                question: q.title,
                type: q.type || 'shortText', // Default to shortText if type is missing
                options: processedOptions,
                required: q.required || false,
                description: q.description || ''
              });
            });
          }
        });

        console.log('Fetched questions:', fetchedQuestions);
        setQuestions(fetchedQuestions);
      } catch (error) {
        console.error('Error fetching program data:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    fetchProgramData();
  }, [programId]);

  const handleTypewriterComplete = () => {
    setHasSeenTypewriter(true);
    // Add initial greeting message only once
    addMessage(
      "Strap in! 🚀 Drop your startup name or idea, and let's kickstart this ride! 💡",
      'bot'
    );
  };

  const moveToNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      const nextIndex = currentQuestion + 1;
      setCurrentQuestion(nextIndex);
      const nextQuestion = questions[nextIndex];
      addMessage(nextQuestion.question, 'bot', nextQuestion);
    } else {
      addMessage(
        "Thank you for completing your application! We'll review it and get back to you soon.",
        'bot'
      );
    }
  };

  // Add questionId to message structure when creating bot messages
 // Update addMessage to handle the startup name question separately
// Update addMessage function
// Update the addMessage function to properly pass options
const addMessage = (content, type, questionData = null) => {
  const timestamp = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  setMessages(prev => {
    // Don't add if the last message is identical
    const lastMessage = prev[prev.length - 1];
    if (lastMessage?.content === content && lastMessage?.type === type) {
      return prev;
    }

    // Create new message object
    const newMessage = {
      type,
      content,
      timestamp,
      ...(questionData && {
        questionId: questionData.id,
        questionType: questionData.type,
        options: questionData.options,
      })
    };

    return [...prev, newMessage];
  });
};

const handleSubmit = (e) => {
  if (e?.preventDefault) {
    e.preventDefault();
  }

  if (!inputValue || isLoading || isInitializing || !hasSeenTypewriter) return;

  setIsLoading(true);
  const userResponse = inputValue;

  // Add user's message first
  addMessage(userResponse, 'user');
  setInputValue('');

  setTimeout(() => {
    if (isStartupNameQuestion) {
      // Save startup name
      setAnswers(prev => ({
        ...prev,
        startupName: userResponse
      }));
      setIsStartupNameQuestion(false);
      
      // Move to first question if available
      if (questions.length > 0) {
        setCurrentQuestion(0);
        const firstQuestion = questions[0];
        // Add first question with full question data
        addMessage(firstQuestion.question, 'bot', firstQuestion);
      }
    } else {
      // Handle regular questions
      if (currentQuestion >= 0 && currentQuestion < questions.length) {
        const currentQuestionData = questions[currentQuestion];
        
        // Save the answer
        setAnswers(prev => ({
          ...prev,
          [currentQuestionData.id]: userResponse
        }));

        // Move to next question
        moveToNextQuestion();
      }
    }
    setIsLoading(false);
  }, 1000);
};



// Update the Message component to properly check for options

const handleOptionSelect = (answer) => {
  if (Array.isArray(answer)) {
    // For checkbox selections, join with commas
    setInputValue(answer.join(', '));
  } else {
    // For single option/suggestion selections, ensure we're handling strings
    setInputValue(answer?.toString() || '');
  }
};






  if (isInitializing) {
    return (
      <div className="md:px-56 h-screen flex flex-col items-center justify-center">
        <LoadingDots />
      </div>
    );
  }

  return (
    <div className="md:px-56 h-screen flex flex-col">
      <div className="text-left mb-8">
        <h1 className="text-4xl font-bold font-sans-serif mb-8">{programTitle}</h1>
        <div className="flex border-b border-gray-300 justify-left mt-4" />
      </div>
      <div className="mb-8">
        {!hasSeenTypewriter ? (
          <Typewriter text={typewriterText} speed={20} onComplete={handleTypewriterComplete} />
        ) : (
          <div className="min-h-[2em] flex items-center">
            <h2 className="text-xl font-semibold">{typewriterText}</h2>
          </div>
        )}
      </div>

      <div className="h-[420px] border rounded-lg shadow-lg flex flex-col bg-white">
        <div className="flex-1 overflow-y-auto p-4">
          {!hasSeenTypewriter ? (
            <div className="flex justify-start">
              <div className="flex items-start gap-2 max-w-[80%]">
                <BotAvatar />
                <div className="bg-gray-100 rounded-lg">
                  <LoadingDots />
                </div>
              </div>
            </div>
          ) : (
           messages.map((message, index) => (
            <Message 
              key={index} 
              message={message} 
              onOptionSelect={handleOptionSelect}
              isLoading={isLoading}
            />
          ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2 max-w-[80%]">
                <BotAvatar />
                <div className="bg-gray-100 rounded-lg">
                  <LoadingDots />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t p-4 bg-white rounded-b-lg">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
              placeholder="Type your message..."
              className="flex-grow p-3 border rounded-lg focus:outline-none focus:border-blue-500"
              disabled={isLoading || !hasSeenTypewriter}
            />
             {/* Voice Recording Button */}
             <button
            onClick={handleVoiceRecord}
            className={`p-3 bg-white border rounded-full hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 transition-colors duration-200 ${
              isRecording ? 'border-red-500 text-red-500 bg-red-50' : ''
            }`}
            disabled={isLoading || !hasSeenTypewriter || !recognition}
            title={recognition ? 'Click to start/stop voice recording' : 'Speech recognition not supported'}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="8" y="2" width="8" height="13" rx="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 20L12 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          {/* File Upload Button - Always visible but only clickable for file type questions */}
          <label 
            className={`p-3 bg-white border rounded-full ${
              getCurrentQuestionType() === 'fileUpload' && !isLoading && hasSeenTypewriter
                ? 'hover:bg-gray-50 cursor-pointer'
                : 'opacity-50 cursor-not-allowed'
            }`}
            title={getCurrentQuestionType() === 'fileUpload' ? 'Upload file' : 'File upload not available for this question'}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.44 11.05L12.25 20.24C11.1242 21.3658 9.59718 21.9983 8.005 21.9983C6.41282 21.9983 4.88584 21.3658 3.76 20.24C2.63416 19.1142 2.00166 17.5872 2.00166 15.995C2.00166 14.4028 2.63416 12.8758 3.76 11.75L12.33 3.18C13.0806 2.42935 14.0991 2.00001 15.16 2.00001C16.2209 2.00001 17.2394 2.42935 17.99 3.18C18.7406 3.93065 19.17 4.94913 19.17 6.01C19.17 7.07087 18.7406 8.08935 17.99 8.84L9.41 17.42C9.03468 17.7953 8.52541 18.0047 7.995 18.0047C7.46459 18.0047 6.95532 17.7953 6.58 17.42C6.20468 17.0447 5.99527 16.5354 5.99527 16.005C5.99527 15.4746 6.20468 14.9653 6.58 14.59L14.54 6.63" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              disabled={getCurrentQuestionType() !== 'fileUpload' || isLoading || !hasSeenTypewriter}
              onClick={(e) => {
                if (getCurrentQuestionType() !== 'fileUpload') {
                  e.preventDefault();
                }
              }}
            />
          </label>

            <button
              onClick={handleSubmit}
              className="p-3 bg-white border rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
              disabled={isLoading || !inputValue.trim() || !hasSeenTypewriter}
            >
              <Send className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Application;
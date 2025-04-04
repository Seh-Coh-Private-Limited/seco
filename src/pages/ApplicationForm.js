import { getAuth } from 'firebase/auth';
import { collection, doc, getDocs, query, setDoc, where,getDoc,deleteDoc } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { Send, User, Lightbulb } from "lucide-react";
import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
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
const Typewriter = memo(({ text, speed = 50, onComplete }) => {
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
});

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

const QuestionOptions = memo(({ type, options, onSelect, disabled, selectedValue }) => {
  const [selectedOptions, setSelectedOptions] = useState(new Set());
  useEffect(() => {
    // Initialize with saved value if it exists
    if (selectedValue) {
      if (type === 'checkbox') {
        const values = selectedValue.split(', ');
        setSelectedOptions(new Set(values));
      } else {
        setSelectedOptions(new Set([selectedValue]));
      }
    } else {
      setSelectedOptions(new Set());
    }
  }, [type, options, selectedValue]);
  useEffect(() => {
    setSelectedOptions(new Set());
  }, [type, options]);

  if (!options || !Array.isArray(options) || options.length === 0 || 
      !['multipleChoice', 'checkbox'].includes(type) || disabled) {
    return null;
  }

  const handleCheckboxChange = (option) => {
    const newSelection = new Set(selectedOptions);
    if (newSelection.has(option)) newSelection.delete(option);
    else newSelection.add(option);
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
});

const SuggestionsCache = new Map();

const AISuggestions = memo(({ inputValue, onSuggestionAccept, onReset, questionType, currentQuestion }) => {
  const [suggestion, setSuggestion] = useState('');
  const [originalInput, setOriginalInput] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const generatePrompt = useCallback((type, input, question) => {
    if (!input || typeof input !== 'string' || !question) return null;
    return `Question: "${question.question}"\nQuestion Type: ${type}\nInput: "${input}"\n\nPlease provide one natural, conversational rephrased version of the input that:\n1. Matches the question type\n2. Is specific and actionable\n3. Uses natural, conversational language\n4. Relates to the original question context`;
  }, []);

  const fetchSuggestion = useCallback(async (input) => {
    setIsLoading(true);
    setError(null);

    try {
      const prompt = generatePrompt(questionType, input, currentQuestion);
      if (!prompt) throw new Error('No valid input or question provided');

      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyC4XSyDhbh7P-9oyibbHR0Zp8_z5fWgD6A',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        }
      );

      if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
      const data = await response.json();
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) throw new Error('Invalid response format from API');

      const text = data.candidates[0].content.parts[0].text.trim();
      setSuggestion(text);
      setOriginalInput(input);
      setIsVisible(true);
      onSuggestionAccept(text); // Directly overwrite the input
    } catch (err) {
      console.error('Error fetching suggestion:', err);
      setError('Failed to load suggestion');
    } finally {
      setIsLoading(false);
    }
  }, [questionType, currentQuestion, onSuggestionAccept]);

  const handleRefine = () => {
    if (inputValue && typeof inputValue === 'string' && inputValue.trim()) {
      fetchSuggestion(inputValue);
    }
  };

  const handleRephrase = () => {
    if (inputValue && typeof inputValue === 'string' && inputValue) {
      fetchSuggestion(originalInput); // Use original input for new rephrase
    }
  };

  const handleReset = () => {
    onReset(originalInput);
    setIsVisible(false);
    setSuggestion('');
  };

  if (!inputValue || typeof inputValue !== 'string' || !inputValue || 
      questionType === 'fileUpload' || !['shortText', 'longText'].includes(questionType) ||
      !currentQuestion) {
    return null;
  }

  return (
    <div className="mt-2">
      {!isVisible ? (
        <button
          onClick={handleRefine}
          disabled={isLoading}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
        >
          <Lightbulb size={16} />
          {isLoading ? "Refining..." : "Refine my response"}
        </button>
      ) : (
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <Lightbulb size={16} />
            <span>Refined by AI</span>
          </div>
          {error ? (
            <div className="text-red-500 p-2 bg-red-50 rounded">{error}</div>
          ) : (
            <>
              <button
                onClick={handleRephrase}
                disabled={isLoading}
                className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
              >
                {isLoading ? "Rephrasing..." : "Rephrase"}
              </button>
              <button
                onClick={handleReset}
                className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Reset
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
});
const Message = memo(({ message, onOptionSelect, isLoading, hasSubmitted, questions, currentQuestion,answers = {} }) => {
  const isRequired = questions[currentQuestion]?.required || false;

  const renderQuestionInput = () => {
    if (message.type !== 'bot') return null;

    // Check if there's a saved answer for this question
    const savedAnswer = questions[currentQuestion]?.id ? answers[questions[currentQuestion].id] : null;

    switch (message.questionType) {
      case 'multipleChoice':
      case 'checkbox':
        return message.options && message.options.length > 0 ? (
          <>
           {savedAnswer && (
              <div className="">
                {/* <p className="text-sm text-gray-600">Previously entered:</p> */}
                {/* <p className="text-sm">{savedAnswer}</p> */}
              </div>
            )}
            <QuestionOptions
              type={message.questionType}
              options={message.options}
              onSelect={onOptionSelect}
              disabled={isLoading}
              selectedValue={savedAnswer} // Pass saved answer to QuestionOptions
            />
            {!isRequired && !hasSubmitted && (
              <button
                onClick={() => onOptionSelect(null)} // Pass null to indicate skipping
                disabled={isLoading}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
              >
                Skip this question
              </button>
            )}
          </>
        ) : null;

      case 'shortText':
      case 'longText':
        return (
          <>
            {savedAnswer && (
              <div className="">
                {/* <p className="text-sm text-gray-600">Previously entered:</p>
                <p className="text-sm">{savedAnswer}</p> */}
              </div>
            )}
            <AISuggestions
              questionType={message.questionType}
              currentQuestion={{
                question: message.content,
                type: message.questionType
              }}
              nextQuestion={questions && currentQuestion >= 0 && currentQuestion + 1 < questions.length ? questions[currentQuestion + 1] : null}
              onSuggestionClick={(suggestion) => {
                if (suggestion) onOptionSelect(suggestion);
              }}
            />
            {!isRequired && !hasSubmitted && (
              <button
                onClick={() => onOptionSelect(null)}
                disabled={isLoading}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
              >
                Skip this question
              </button>
            )}
          </>
        );

      case 'date':
        return (
          <div className="mt-4">
            {savedAnswer && (
              <div className="">
                {/* <p className="text-sm text-gray-600">Previously entered:</p>
                <p className="text-sm">{savedAnswer}</p> */}
              </div>
            )}
            <input
              type="date"
              onChange={(e) => onOptionSelect(e.target.value)}
              className="p-2 border rounded-lg focus:outline-none focus:border-blue-500"
              disabled={isLoading}
            />
            {!isRequired && !hasSubmitted && (
              <button
                onClick={() => onOptionSelect(null)}
                disabled={isLoading}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
              >
                Skip this question
              </button>
            )}
          </div>
        );

      case 'time':
        return (
          <div className="mt-4">
            {savedAnswer && (
              <div className="mb-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                {/* <p className="text-sm text-gray-600">Previously entered:</p>
                <p className="text-sm">{savedAnswer}</p> */}
              </div>
            )}
            <input
              type="time"
              onChange={(e) => onOptionSelect(e.target.value)}
              className="p-2 border rounded-lg focus:outline-none focus:border-blue-500"
              disabled={isLoading}
            />
            {!isRequired && !hasSubmitted && (
              <button
                onClick={() => onOptionSelect(null)}
                disabled={isLoading}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
              >
                Skip this question
              </button>
            )}
          </div>
        );

      case 'rating':
        return (
          <div className="mt-4">
            {savedAnswer && (
              <div className="">
                {/* <p className="text-sm text-gray-600">Previously entered:</p>
                <p className="text-sm">{savedAnswer}</p> */}
              </div>
            )}
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => onOptionSelect(rating.toString())}
                  disabled={isLoading}
                  className={`w-10 h-10 rounded-full border flex items-center justify-center hover:bg-blue-50 hover:border-blue-500 transition-colors duration-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {rating}
                </button>
              ))}
            </div>
            {!isRequired && !hasSubmitted && (
              <button
                onClick={() => onOptionSelect(null)}
                disabled={isLoading}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
              >
                Skip this question
              </button>
            )}
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
          <div className={`rounded-lg p-3 ${message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'}`}>
            <div className="whitespace-pre-line">{message.content}</div>
          </div>
          {renderQuestionInput()}
          <div className="text-xs text-gray-500 mt-1">{message.timestamp}</div>
        </div>
      </div>
    </div>
  );
});

const AutoResizeTextarea = memo(({ value, onChange, onKeyPress, placeholder, disabled }) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;

    if (document.activeElement === textarea) {
      textarea.focus();
      console.log('Textarea focus retained');
    }
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    console.log('New value:', newValue);

    const textarea = textareaRef.current;
    if (textarea) textarea.focus();
  };

  console.log('AutoResizeTextarea rendered');

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          onKeyPress?.(e);
        }
      }}
      placeholder={placeholder}
      disabled={disabled}
      rows={1}
      className="flex-grow p-3 border rounded-lg focus:outline-none focus:border-blue-500 resize-none min-h-[48px] max-h-[150px] overflow-y-auto w-full"
      style={{
        lineHeight: '24px',
        padding: '11px 12px',
        transition: 'height 0.2s ease-out',
      }}
    />
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.value === nextProps.value &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.placeholder === nextProps.placeholder
  );
});

const ChatInput = memo(({ 
  inputValue, 
  setInputValue, 
  handleSubmit, 
  isLoading, 
  hasSeenTypewriter, 
  handleVoiceRecord, 
  handleFileUpload, 
  getCurrentQuestionType, 
  recognition, 
  hasSubmitted,
  isRecording,
  currentQuestion,
  questions,
  saveDraft ,// Add saveDraft as a pro
  answers 
}) => {
  const handleKeyPress = useCallback((e) => {
    if (!isLoading && inputValue && hasSeenTypewriter && !hasSubmitted) {
      handleSubmit(e);
    }
  }, [isLoading, inputValue, hasSeenTypewriter, hasSubmitted, handleSubmit]);

  const handleSuggestionAccept = (suggestion) => {
    setInputValue(suggestion);
    const newAnswers = { ...answers, [questions[currentQuestion]?.id]: suggestion };
    saveDraft(newAnswers); // Save draft when suggestion is accepted
  };

  const handleReset = (original) => {
    setInputValue(original);
    const newAnswers = { ...answers, [questions[currentQuestion]?.id]: original };
    saveDraft(newAnswers); // Save draft when reset
  };

  const handleInputChange = (value) => {
    setInputValue(value);
    const newAnswers = { ...answers, [questions[currentQuestion]?.id]: value };
    saveDraft(newAnswers); // Save draft on every input change
  };
  return (
    <div className="p-4 border-t">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <AutoResizeTextarea
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading || !hasSeenTypewriter || hasSubmitted}
          />
        </div>
        <AISuggestions
          inputValue={inputValue}
          onSuggestionAccept={handleSuggestionAccept}
          onReset={handleReset}
          questionType={getCurrentQuestionType()}
          currentQuestion={currentQuestion >= 0 && questions[currentQuestion] ? questions[currentQuestion] : null}
        />
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={handleVoiceRecord}
              className={`p-3 bg-white border rounded-full transition-colors duration-200 ${isRecording ? 'border-red-500 text-red-500 bg-red-50' : 'hover:bg-gray-50'} ${!hasSeenTypewriter || !recognition || hasSubmitted ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isLoading || !hasSeenTypewriter || !recognition || hasSubmitted}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="8" y="2" width="8" height="13" rx="4" />
                <path d="M20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12" />
                <path d="M12 20L12 24" />
              </svg>
            </button>
            <label
              className={`p-3 bg-white border rounded-full transition-colors duration-200 ${getCurrentQuestionType() === 'fileUpload' && !isLoading && hasSeenTypewriter && !hasSubmitted ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
            >
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                disabled={getCurrentQuestionType() !== 'fileUpload' || isLoading || !hasSeenTypewriter || hasSubmitted}
                onClick={(e) => getCurrentQuestionType() !== 'fileUpload' && e.preventDefault()}
              />
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.44 11.05L12.25 20.24C9.5 23 5 23 2.25 20.24C-0.5 17.5 -0.5 13 2.25 10.24L12.33 3.18C14.5 1 17.5 1 19.67 3.18C21.83 5.36 21.83 8.36 19.67 10.52L9.41 17.42C8.23 18.6 6.27 18.6 5.09 17.42C3.91 16.24 3.91 14.28 5.09 13.1L14.54 6.63" />
              </svg>
            </label>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !inputValue || !hasSeenTypewriter || hasSubmitted}
            className={`p-3 bg-white border rounded-lg transition-colors duration-200 ${!isLoading && inputValue && hasSeenTypewriter && !hasSubmitted ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'}`}
          >
            <Send className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.inputValue === nextProps.inputValue &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.hasSeenTypewriter === nextProps.hasSeenTypewriter &&
    prevProps.hasSubmitted === nextProps.hasSubmitted &&
    prevProps.recognition === nextProps.recognition &&
    prevProps.isRecording === nextProps.isRecording &&
    prevProps.getCurrentQuestionType() === nextProps.getCurrentQuestionType() &&
    prevProps.currentQuestion === nextProps.currentQuestion &&
    prevProps.questions === nextProps.questions &&
    prevProps.answers === nextProps.answers 
  );
});
const QuestionTypeIcons = {
  shortText: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 5h18v2H3V5zm0 6h12v2H3v-2zm0 6h18v2H3v-2z" />
    </svg>
  ),
  longText: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 5h18v2H3V5zm0 4h18v2H3V9zm0 4h18v2H3v-2zm0 4h18v2H3v-2z" />
    </svg>
  ),
  multipleChoice: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 7a2 2 0 11-4 0 2 2 0 014 0zm-2 6a2 2 0 100-4 2 2 0 000 4zm0 6a2 2 0 100-4 2 2 0 000 4zm4-12h12v2H9V7zm0 6h12v2H9v-2zm0 6h12v2H9v-2z" />
    </svg>
  ),
  checkbox: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 7h2v2H5V7zm4 0h12v2H9V7zm-4 6h2v2H5v-2zm4 0h12v2H9v-2zm-4 6h2v2H5v-2zm4 0h12v2H9v-2z" />
    </svg>
  ),
  date: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
    </svg>
  ),
  time: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm1-13h-2v6l5.2 3.2 1-1.7-4.2-2.5V7z" />
    </svg>
  ),
  rating: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6L12 2z" />
    </svg>
  ),
  fileUpload: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h6v6h6v10H6z" />
    </svg>
  )
};
const Application = ({ programId, onFormSubmitSuccess }) => {
  const [inputValue, setInputValue] = useState("");
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [nextQuestionIndex, setNextQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [programTitle, setProgramTitle] = useState('');
  const [messages, setMessages] = useState([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasSeenTypewriter, setHasSeenTypewriter] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const auth = getAuth();
  const [currentQuestion, setCurrentQuestion] = useState(-1);

  const getCurrentQuestionType = useCallback(() => {
    const activeQuestion = questions.find(q => q.id === activeQuestionId);
    return activeQuestion?.type || null;
  }, [activeQuestionId, questions]);

  const addMessage = useCallback((content, type, questionData = null) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => {
      if (questionData && type === 'bot' && prev.some(m => m.questionId === questionData.id && m.type === 'bot')) {
        return prev;
      }
      return [...prev, { type, content, timestamp, ...(questionData && { questionId: questionData.id, questionType: questionData.type, options: questionData.options }) }];
    });
  }, []);

  const saveDraft = useCallback(async (customAnswers) => {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const draftData = {
      userId,
      programId,
      responses: customAnswers || answers, // Default to the full answers state
      updatedAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'drafts', `${userId}_${programId}`), draftData, { merge: true });
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  }, [auth, programId, answers]);

  const loadDraft = useCallback(async (userId) => {
    try {
      const draftDoc = await getDoc(doc(db, 'drafts', `${userId}_${programId}`));
      if (draftDoc.exists()) {
        const draftData = draftDoc.data();
        setAnswers(draftData.responses || {});
        setDraftLoaded(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading draft:', error);
      return false;
    }
  }, [programId]);

  useEffect(() => {
    const fetchProgramData = async () => {
      try {
        const programQuery = query(collection(db, 'programmes'), where('id', '==', programId));
        const programSnapshot = await getDocs(programQuery);
        if (programSnapshot.empty) throw new Error('Program not found');

        const programDoc = programSnapshot.docs[0];
        setProgramTitle(programDoc.data().name);

        const userId = auth.currentUser?.uid;
        if (userId) {
          const submissionQuery = query(collection(db, 'programmes', programDoc.id, 'formResponses'), where('userId', '==', userId));
          const submissionSnapshot = await getDocs(submissionQuery);
          if (!submissionSnapshot.empty) {
            setHasSubmitted(true);
            setAnswers(submissionSnapshot.docs[0].data().responses.reduce((acc, r) => ({ ...acc, [r.questionId]: r.answer }), {}));
            setHasSeenTypewriter(true);
            setIsInitializing(false);
            return;
          }

          const fetchedQuestions = [];
          const seenQuestions = new Set();
          const questionsSnapshot = await getDocs(collection(db, 'programmes', programDoc.id, 'form'));
          questionsSnapshot.forEach(doc => {
            const questionData = doc.data();
            if (Array.isArray(questionData.questions)) {
              questionData.questions.forEach(q => {
                const questionId = `${doc.id}_${q.title}`;
                if (!seenQuestions.has(q.title)) {
                  seenQuestions.add(q.title);
                  fetchedQuestions.push({
                    id: questionId,
                    question: q.title,
                    type: q.type || 'shortText',
                    options: Array.isArray(q.options) ? q.options : [],
                    required: q.required || false,
                  });
                }
              });
            }
          });
          setQuestions(fetchedQuestions);

          const hasDraft = await loadDraft(userId);
          if (hasDraft && fetchedQuestions.length > 0) {
            setHasSeenTypewriter(true);
            setIsInitializing(false);
            return;
          }

          if (fetchedQuestions.length > 0 && !hasSubmitted) {
            setActiveQuestionId(fetchedQuestions[0].id);
            setCurrentQuestion(0);
            addMessage(fetchedQuestions[0].question, 'bot', fetchedQuestions[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching program data:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    fetchProgramData();
  }, [programId, auth.currentUser, addMessage, loadDraft]);

  const handleQuestionSelect = useCallback((questionId) => {
    if (isLoading || hasSubmitted) return;
    
    setActiveQuestionId(questionId);
    const idx = questions.findIndex(q => q.id === questionId);
    setNextQuestionIndex(idx);
    setCurrentQuestion(idx);
    const question = questions.find(q => q.id === questionId);
  
    const savedAnswer = answers[questionId];
    setInputValue(savedAnswer !== undefined ? savedAnswer : '');
  
    if (!messages.some(m => m.questionId === questionId && m.type === 'bot')) {
      addMessage(question.question, 'bot', question);
    }
    
    saveDraft(answers); // Pass the full answers state explicitly
  }, [isLoading, hasSubmitted, questions, answers, addMessage, saveDraft]);
  useEffect(() => {
    const handleBeforeUnload = () => saveDraft();
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveDraft]);
 
  const submitFormResponses = useCallback(async () => {
    if (!auth.currentUser) return;
    setIsLoading(true);
    try {
      const userId = auth.currentUser.uid;
      const userStartupData = await getUserStartupData(userId);
      const programQuery = query(collection(db, 'programmes'), where('id', '==', programId));
      const programSnapshot = await getDocs(programQuery);
      const programData = programSnapshot.docs[0].data();
  
      await saveDraft(answers);
  
      const questionMap = questions.reduce((acc, q) => { acc[q.id] = q.question; return acc; }, {});
      const formResponses = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        question: questionMap[questionId],
        answer: uploadedFiles[questionId] || answer,
        timestamp: new Date().toISOString(),
      }));
  
      const formData = {
        userId,
        startupName: answers.startupName || 'N/A',
        responses: formResponses,
        startupData: { ...userStartupData },
        submittedAt: new Date().toISOString(),
      };
      const sessionEmail = auth.currentUser.email;
      const usersCollection = collection(db, 'users');
      const userQuery = query(usersCollection, where('email', '==', sessionEmail));
      const userSnapshot = await getDocs(userQuery);
  
      if (!userSnapshot.empty) {
        const userDocId = userSnapshot.docs[0].id;
        const programIdStr = String(programId);
        await setDoc(doc(db, 'users', userDocId, 'applications', programIdStr), {
          programId: programIdStr,
          programTitle: programData.name,
          appliedAt: new Date().toISOString(),
          status: 'submitted',
        });
        await setDoc(doc(db, 'users', userDocId, 'formResponses', programIdStr), formData);
      }
      await setDoc(doc(db, 'programmes', programSnapshot.docs[0].id, 'formResponses', userId), formData);
      await deleteDoc(doc(db, 'drafts', `${userId}_${programId}`));
      setHasSubmitted(true);
      if (onFormSubmitSuccess) onFormSubmitSuccess();
    } catch (error) {
      console.error('Error submitting form:', error);
      addMessage('Error submitting your application. Try again.', 'bot');
    } finally {
      setIsLoading(false);
    }
  }, [auth, programId, answers, questions, uploadedFiles, addMessage, onFormSubmitSuccess]);

  const moveToNextQuestion = useCallback(() => {
    let nextIdx = nextQuestionIndex + 1;
    while (nextIdx < questions.length && answers[questions[nextIdx].id] !== undefined) {
      nextIdx++;
    }
  
    if (nextIdx < questions.length) {
      setActiveQuestionId(questions[nextIdx].id);
      setNextQuestionIndex(nextIdx);
      setCurrentQuestion(nextIdx);
      const nextQuestion = questions[nextIdx];
      if (!messages.some(m => m.questionId === nextQuestion.id && m.type === 'bot')) {
        addMessage(nextQuestion.question, 'bot', nextQuestion);
      }
    } else {
      setActiveQuestionId(null);
    }
  }, [nextQuestionIndex, questions, answers, addMessage, messages]);

  const handleOptionSelect = useCallback((answer) => {
    const activeQuestion = questions.find(q => q.id === activeQuestionId);
    if (!activeQuestion) return;
  
    setIsLoading(true);
    if (answer === null && activeQuestion.required) {
      addMessage("This question is required and cannot be skipped.", 'bot', { id: activeQuestionId });
      setIsLoading(false);
      return;
    }
  
    const processedAnswer = Array.isArray(answer) ? answer.join(', ') : answer;
    addMessage(processedAnswer || 'Skipped', 'user', { id: activeQuestionId });
  
    const newAnswers = { ...answers, [activeQuestion.id]: processedAnswer };
    setAnswers(newAnswers);
    saveDraft(newAnswers);
  
    setInputValue('');
    setTimeout(() => {
      moveToNextQuestion();
      setIsLoading(false);
    }, 500);
  }, [activeQuestionId, questions, addMessage, moveToNextQuestion, saveDraft, answers]);

  const handleSubmit = useCallback((e) => {
    if (e?.preventDefault) e.preventDefault();
    if (hasSubmitted || !inputValue || isLoading || !hasSeenTypewriter || !activeQuestionId) return;
  
    setIsLoading(true);
    const userResponse = inputValue;
    addMessage(userResponse, 'user', { id: activeQuestionId });
    setInputValue('');
  
    const activeQuestion = questions.find(q => q.id === activeQuestionId);
    if (userResponse.toLowerCase() === 'skip' && activeQuestion.required) {
      addMessage("This question is required and cannot be skipped.", 'bot', { id: activeQuestionId });
      setIsLoading(false);
    } else {
      const newAnswer = userResponse.toLowerCase() === 'skip' ? null : userResponse;
      const newAnswers = { ...answers, [activeQuestion.id]: newAnswer };
      setAnswers(newAnswers);
      saveDraft(newAnswers);
  
      setTimeout(() => {
        if (answers[activeQuestionId] === undefined) {
          moveToNextQuestion();
        }
        setIsLoading(false);
      }, 500);
    }
  }, [hasSubmitted, inputValue, isLoading, hasSeenTypewriter, activeQuestionId, questions, addMessage, moveToNextQuestion, saveDraft, answers]);

  const allQuestionsAnswered = questions.every(q => answers[q.id] !== undefined);

  useEffect(() => {
    if (allQuestionsAnswered && !hasSubmitted) {
      setShowToast(true);
    }
  }, [allQuestionsAnswered, hasSubmitted]);

  const handleTypewriterComplete = useCallback(() => {
    setHasSeenTypewriter(true);
  }, []);

  const getUserStartupData = useCallback(async (uid) => {
    try {
      const usersCollection = collection(db, 'users');
      const q = query(usersCollection, where('uid', '==', uid));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) return querySnapshot.docs[0].data();
      return null;
    } catch (error) {
      console.error('Error fetching user data by UID:', error);
      throw error;
    }
  }, []);

  const handleVoiceRecord = useCallback(() => {
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
        console.error('Error starting speech recognition:', err);
      }
    }
  }, [recognition, isRecording]);
  const CustomToast = ({ title, description, actionText = "OK", onAction, onClose }) => {
    return (
      <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-xl shadow-lg z-50 min-w-[400px] flex flex-row items-center justify-between gap-4 animate-fade-in">
        <div className="flex flex-col gap-1">
          <div className="font-bold text-base">{title}</div>
          <div className="text-sm">{description}</div>
        </div>
        <button 
          className="text-white bg-black border-none px-4 py-2 rounded-full cursor-pointer font-bold w-fit"
          onClick={() => {
            onAction?.();
            onClose();
          }}
        >
          {actionText}
        </button>
      </div>
    );
  };
  
  const uploadFileToStorage = useCallback(async (file, questionId) => {
    const storage = getStorage();
    const fileRef = ref(storage, `form-uploads/${auth.currentUser.uid}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(fileRef, file);
    return await getDownloadURL(snapshot.ref);
  }, [auth]);

  const handleFileUpload = useCallback(async (event) => {
    if (getCurrentQuestionType() !== 'fileUpload') return;

    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const currentQuestionData = questions[currentQuestion];
      const downloadURL = await uploadFileToStorage(file, currentQuestionData.id);
      setUploadedFiles(prev => ({ ...prev, [currentQuestionData.id]: downloadURL }));
      handleOptionSelect(`File uploaded: ${file.name}`);
    } catch (error) {
      console.error('Error handling file upload:', error);
      addMessage('Failed to upload file. Please try again.', 'bot');
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentQuestionType, questions, currentQuestion, uploadFileToStorage, handleOptionSelect, addMessage]);

  const QuestionSidebar = () => (
    <div className="w-80 border-l bg-gray-50 p-4 overflow-y-auto" style={{ height: '650px' }}>
      <h3 className="text-lg font-semibold mb-4">Application Questions</h3>
      {questions.length > 0 ? (
        <div className="space-y-3">
          {questions.map(q => {
            const Icon = QuestionTypeIcons[q.type] || QuestionTypeIcons.shortText;
            const isActive = q.id === activeQuestionId;
            const isAnswered = answers[q.id] !== undefined;
            return (
              <div
                key={q.id}
                onClick={() => handleQuestionSelect(q.id)}
                className={`p-3 rounded-lg transition-colors cursor-pointer ${
                  isActive ? 'bg-blue-100 border-blue-500' : 
                  isAnswered ? 'bg-green-50 border-green-500' : 
                  'bg-white border-gray-200'
                } border`}
              >
                <div className="flex items-center gap-2">
                  <Icon />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{q.question}</p>
                    <p className="text-xs text-gray-500 capitalize">{q.type.replace(/([A-Z])/g, ' $1').trim()}</p>
                  </div>
                  {isAnswered && (
                    <svg className="w-4 h-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No questions available.</p>
      )}
    </div>
  );

  if (isInitializing) return <div className="md:px-36 h-screen flex flex-col items-center justify-center"><LoadingDots /></div>;

  // Generate messages for all questions and answers when all are answered
  const allQuestionsMessages = allQuestionsAnswered && !hasSubmitted
    ? questions.flatMap(q => {
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return [
          { type: 'bot', content: q.question, timestamp, questionId: q.id, questionType: q.type, options: q.options },
          { type: 'user', content: answers[q.id] || 'Skipped', timestamp, questionId: q.id }
        ];
      })
    : [];

  const filteredMessages = activeQuestionId
    ? messages.filter(m => m.questionId === activeQuestionId || !m.questionId)
    : allQuestionsAnswered && !hasSubmitted
    ? allQuestionsMessages
    : [];

  return (
    <div className="md:px-36 h-screen flex flex-col relative">
      <div className="text-left mb-8">
        <h1 className="text-4xl font-bold font-sans-serif mb-8">{programTitle}</h1>
        <div className="flex border-b border-gray-300 justify-left mt-4" />
      </div>
      <div className="mb-8">
        {!hasSeenTypewriter ? <Typewriter text="" speed={20} onComplete={handleTypewriterComplete} /> : <div className="min-h-[2em] flex items-center"><h2 className="text-xl font-semibold"></h2></div>}
      </div>
      <div className="flex-1 flex gap-4 relative">
        <div className="flex-1 h-[650px] border rounded-lg shadow-lg flex flex-col bg-white scrollbar-hide">
          {/* Chat Area */}
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
) : activeQuestionId || (allQuestionsAnswered && !hasSubmitted) ? (
  <>
    {allQuestionsAnswered && !hasSubmitted && showToast && (
      <CustomToast
        title="All questions answered"
        description="You can submit your responses or edit them by clicking on a question in the sidebar."
        actionText="Got it"
        onAction={() => {}}
        onClose={() => setShowToast(false)}
      />
    )}
    {filteredMessages.length > 0 ? (
      filteredMessages.map((message, index) => (
        <Message
          key={index}
          message={message}
          onOptionSelect={handleOptionSelect}
          isLoading={isLoading}
          hasSubmitted={hasSubmitted}
          questions={questions}
          currentQuestion={questions.findIndex(q => q.id === (message.questionId || activeQuestionId))}
          answers={answers}
        />
      ))
    ) : (
      <div className="text-gray-500 text-center">
        No messages for this question yet.
      </div>
    )}
  </>
) : (
  <div className="text-gray-500 text-center">
    Select a question from the sidebar to continue.
  </div>
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

          <div className="border-t p-0 bg-white rounded-b-lg">
            <ChatInput
              inputValue={inputValue}
              setInputValue={setInputValue}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              hasSeenTypewriter={hasSeenTypewriter}
              handleVoiceRecord={handleVoiceRecord}
              handleFileUpload={handleFileUpload}
              getCurrentQuestionType={getCurrentQuestionType}
              recognition={recognition}
              hasSubmitted={hasSubmitted}
              isRecording={isRecording}
              currentQuestion={questions.findIndex(q => q.id === activeQuestionId)}
              questions={questions}
              saveDraft={saveDraft}
              answers={answers}
            />
            {allQuestionsAnswered && !hasSubmitted && (
              <div className="p-4">
                <button
                  onClick={submitFormResponses}
                  disabled={isLoading}
                  className={`w-full p-3 bg-blue-500 text-white rounded-lg transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
                >
                  {isLoading ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            )}
          </div>
        </div>
        <QuestionSidebar />
        {hasSubmitted && (
          <div
            className="absolute top-0 left-0 right-0 bottom-0 bg-gray-900 bg-opacity-50 flex items-center justify-center rounded-lg z-10"
            style={{ height: '650px' }}
          >
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <svg className="w-12 h-12 text-green-500 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Form Submitted</h2>
              <p className="text-gray-600">
                Your application has been successfully submitted. You can view it in the{' '}
                <a className="text-blue-500 hover:underline">Applications section</a>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Application;


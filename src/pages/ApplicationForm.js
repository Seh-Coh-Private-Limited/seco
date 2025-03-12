import { getAuth } from 'firebase/auth';
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
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

const QuestionOptions = memo(({ type, options, onSelect, disabled }) => {
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
  const [suggestions, setSuggestions] = useState([]);
  const [originalInput, setOriginalInput] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const generatePrompt = useCallback((type, input) => {
    if (!input || typeof input !== 'string') return null;
    return `Question Type: ${type}\nInput: "${input}"\n\nPlease rephrase the following input into 3 different, natural, and conversational suggestions that:\n1. Match the question type\n2. Are specific and actionable\n3. Use natural, conversational language\nFormat each suggestion on a new line.`;
  }, []);

  const fetchSuggestions = useCallback(async (input) => {
    setIsLoading(true);
    setError(null);

    try {
      const prompt = generatePrompt(questionType, input);
      if (!prompt) throw new Error('No valid input provided');

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

      const text = data.candidates[0].content.parts[0].text;
      const suggestions = text.split('\n').map(line => line.trim()).filter(line => line).slice(0, 3);
      setSuggestions(suggestions);
      setOriginalInput(input);
      setIsVisible(true);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setError('Failed to load suggestions');
    } finally {
      setIsLoading(false);
    }
  }, [questionType]);

  const handleRefine = () => {
    if (inputValue && typeof inputValue === 'string' && inputValue.trim()) {
      fetchSuggestions(inputValue);
    }
  };

  const handleRephrase = () => {
    if (inputValue && typeof inputValue === 'string' && inputValue.trim()) {
      fetchSuggestions(inputValue);
    }
  };

  const handleReset = () => {
    onReset(originalInput);
    setIsVisible(false);
    setSuggestions([]);
  };

  const handleOkay = (suggestion) => {
    onSuggestionAccept(suggestion);
    setIsVisible(false);
  };

  // Safeguard against undefined or non-string inputValue
  if (!inputValue || typeof inputValue !== 'string' || !inputValue.trim() || 
      questionType === 'fileUpload' || !['shortText', 'longText'].includes(questionType)) {
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
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Lightbulb size={16} />
            <span>Refined suggestions:</span>
          </div>
          {error ? (
            <div className="text-sm text-red-500 p-2 bg-red-50 rounded">{error}</div>
          ) : (
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-center justify-between p-3 text-sm text-gray-700 bg-gray-50 rounded-lg border border-gray-200">
                  <span>{suggestion}</span>
                  <button
                    onClick={() => handleOkay(suggestion)}
                    className="text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Okay
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <button
                  onClick={handleRephrase}
                  disabled={isLoading}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
                >
                  {isLoading ? "Rephrasing..." : "Rephrase"}
                </button>
                <button
                  onClick={handleReset}
                  className="text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

const Message = memo(({ message, onOptionSelect, isLoading, hasSubmitted, questions, currentQuestion }) => {
  const isRequired = questions[currentQuestion]?.required || false;

  const renderQuestionInput = () => {
    if (message.type !== 'bot') return null;

    switch (message.questionType) {
      case 'multipleChoice':
      case 'checkbox':
        return message.options && message.options.length > 0 ? (
          <>
            <QuestionOptions
              type={message.questionType}
              options={message.options}
              onSelect={onOptionSelect}
              disabled={isLoading}
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
  questions
}) => {
  const handleKeyPress = useCallback((e) => {
    if (!isLoading && inputValue.trim() && hasSeenTypewriter && !hasSubmitted) {
      handleSubmit(e);
    }
  }, [isLoading, inputValue, hasSeenTypewriter, hasSubmitted, handleSubmit]);

  const handleSuggestionAccept = (suggestion) => {
    setInputValue(suggestion);
  };

  const handleReset = (original) => {
    setInputValue(original);
  };

  console.log('ChatInput rendered');

  return (
    <div className="p-4 border-t">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <AutoResizeTextarea
            value={inputValue}
            onChange={setInputValue}
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
            disabled={isLoading || !inputValue.trim() || !hasSeenTypewriter || hasSubmitted}
            className={`p-3 bg-white border rounded-lg transition-colors duration-200 ${!isLoading && inputValue.trim() && hasSeenTypewriter && !hasSubmitted ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'}`}
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
    prevProps.questions === nextProps.questions
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
  const [currentQuestion, setCurrentQuestion] = useState(-1);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [programTitle, setProgramTitle] = useState('');
  const [messages, setMessages] = useState([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasSeenTypewriter, setHasSeenTypewriter] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [isStartupNameQuestion, setIsStartupNameQuestion] = useState(true);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const auth = getAuth();

  // Define foundational functions first
  const getCurrentQuestionType = useCallback(() => {
    if (currentQuestion >= 0 && questions[currentQuestion]) {
      return questions[currentQuestion].type;
    }
    return null;
  }, [currentQuestion, questions]);

  const addMessage = useCallback((content, type, questionData = null) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage?.content === content && lastMessage?.type === type) return prev;
      return [...prev, { type, content, timestamp, ...(questionData && { questionId: questionData.id, questionType: questionData.type, options: questionData.options }) }];
    });
  }, []);

  // Define getUserStartupData before submitFormResponses
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
  const QuestionSidebar = () => (
    <div className="w-80 border-l bg-gray-50 p-4 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4">Application Questions</h3>
      <div className="space-y-3">
        {questions.map((q, index) => {
          const Icon = QuestionTypeIcons[q.type] || QuestionTypeIcons.shortText;
          const isCurrent = index === currentQuestion;
          const isAnswered = answers[q.id] !== undefined;
          
          return (
            <div
              key={q.id}
              className={`p-3 rounded-lg transition-colors ${
                isCurrent 
                  ? 'bg-blue-100 border-blue-500' 
                  : isAnswered 
                    ? 'bg-green-50 border-green-500' 
                    : 'bg-white border-gray-200'
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
    </div>
  );
  const submitFormResponses = useCallback(async () => {
    if (!auth.currentUser) {
      console.error('No authenticated user');
      return;
    }
  
    setIsLoading(true);
    try {
      const userId = auth.currentUser.uid;
      const userStartupData = await getUserStartupData(userId);
      if (!userStartupData) throw new Error('User startup data not found');
  
      const programQuery = query(collection(db, 'programmes'), where('id', '==', programId));
      const programSnapshot = await getDocs(programQuery);
      const programData = programSnapshot.docs[0].data();
  
      const questionMap = questions.reduce((acc, q) => {
        acc[q.id] = q.question;
        return acc;
      }, {});
  
      console.log('Question Map:', questionMap); // Log to verify IDs
      console.log('Answers:', answers); // Log to verify answers
  
      const formResponses = Object.entries(answers).map(([questionId, answer]) => ({
        questionId, // Store the ID for reference
        question: questionMap[questionId] || 'Unknown Question', // Fallback if ID not found
        answer: uploadedFiles[questionId] || answer,
        timestamp: new Date().toISOString()
      }));
  
      console.log('Form Responses:', formResponses); // Log form responses
  
      const formData = {
        userId,
        startupName: answers.startupName,
        responses: formResponses,
        startupData: { ...userStartupData },
        submittedAt: new Date().toISOString()
      };
  
      console.log('Form Data:', formData); // Log form data
  
      await setDoc(doc(db, 'programmes', programSnapshot.docs[0].id, 'formResponses', userId), formData);
  
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
  
      addMessage('Your application has been successfully submitted! We will review it and get back to you soon.', 'bot');
      setHasSubmitted(true);
      if (onFormSubmitSuccess) onFormSubmitSuccess();
    } catch (error) {
      console.error('Error submitting form responses:', error);
      addMessage('There was an error submitting your application. Please try again.', 'bot');
    } finally {
      setIsLoading(false);
    }
  }, [auth, programId, answers, questions, uploadedFiles, getUserStartupData, onFormSubmitSuccess, addMessage]);
  const moveToNextQuestion = useCallback(() => {
    if (currentQuestion < questions.length - 1) {
      const nextIndex = currentQuestion + 1;
      setCurrentQuestion(nextIndex);
      const nextQuestion = questions[nextIndex];
      addMessage(nextQuestion.question, 'bot', nextQuestion);
    } else {
      submitFormResponses();
    }
  }, [currentQuestion, questions, submitFormResponses, addMessage]);

  // Define handleOptionSelect after moveToNextQuestion
  const handleOptionSelect = useCallback((answer) => {
    const currentQuestionType = getCurrentQuestionType();
    const isRequired = currentQuestion >= 0 && questions[currentQuestion]?.required;
  
    if (answer === null) {  // Skip was selected
      if (isRequired) {
        addMessage("This question is required and cannot be skipped.", 'bot');
        return;
      }
      setIsLoading(true);
      addMessage("Skipped", 'user');
      setTimeout(() => {
        if (currentQuestion >= 0 && currentQuestion < questions.length) {
          moveToNextQuestion();
        }
        setIsLoading(false);
      }, 1000);
      return;
    }
  
    // Process the answer for all question types
    setIsLoading(true);
    const processedAnswer = Array.isArray(answer) ? answer.join(', ') : answer;
    addMessage(processedAnswer, 'user');
  
    setTimeout(() => {
      if (currentQuestion >= 0 && currentQuestion < questions.length) {
        const currentQuestionData = questions[currentQuestion];
        setAnswers(prev => ({ ...prev, [currentQuestionData.id]: processedAnswer }));
        moveToNextQuestion();
      }
      setIsLoading(false);
    }, 1000);
  
    // Clear inputValue after processing
    setInputValue('');
  }, [getCurrentQuestionType, currentQuestion, questions, moveToNextQuestion, addMessage]);
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
  // Define handleSubmit after moveToNextQuestion
  const handleSubmit = useCallback((e) => {
    if (e?.preventDefault) e.preventDefault();
    if (hasSubmitted || !inputValue || isLoading || isInitializing || !hasSeenTypewriter) return;
  
    setIsLoading(true);
    const userResponse = inputValue;
  
    addMessage(userResponse, 'user');
    setInputValue('');
  
    setTimeout(() => {
      if (currentQuestion >= 0 && currentQuestion < questions.length) {
        const currentQuestionData = questions[currentQuestion];
        if (userResponse.toLowerCase() === 'skip' && currentQuestionData.required) {
          addMessage("This question is required and cannot be skipped.", 'bot');
        } else if (userResponse.toLowerCase() === 'skip') {
          moveToNextQuestion();
        } else {
          setAnswers(prev => ({ ...prev, [currentQuestionData.id]: userResponse }));
          moveToNextQuestion();
        }
      }
      setIsLoading(false);
    }, 1000);
  }, [hasSubmitted, inputValue, isLoading, isInitializing, hasSeenTypewriter, currentQuestion, questions, addMessage, moveToNextQuestion]);
  // Define remaining callbacks
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
        if (err.message.includes('already started')) recognition.stop();
      }
    }
  }, [recognition, isRecording]);

  const handleTypewriterComplete = useCallback(() => {
    setHasSeenTypewriter(true);
    addMessage("Strap in! 🚀 Drop your startup name or idea, and let's kickstart this ride! 💡", 'bot');
  }, [addMessage]);

  // useEffect hooks
  useEffect(() => {
    console.log("inputValue updated:", inputValue);
  }, [inputValue]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
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

        recognitionInstance.onend = () => setIsRecording(false);

        setRecognition(recognitionInstance);
      }
    }
  }, []);

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
            const submissionData = submissionSnapshot.docs[0].data();
            setAnswers(submissionData.responses.reduce((acc, response) => {
              acc[response.question] = response.answer; // This assumes question IDs are stored in responses
              return acc;
            }, {}));
            addMessage('Your application has been successfully submitted! You can view your application status in your dashboard.', 'bot');
            setHasSeenTypewriter(true);
            setIsStartupNameQuestion(false);
            return;
          }
        }
  
        // Add startupName as the first question
        const fetchedQuestions = [
          {
            id: 'startupName',
            question: 'What is your startup name?',
            type: 'shortText',
            required: true,
            options: [],
            description: 'Please provide the name of your startup.'
          }
        ];
  
        const questionsSnapshot = await getDocs(collection(db, 'programmes', programDoc.id, 'form'));
        questionsSnapshot.forEach((doc) => {
          const questionData = doc.data();
          if (Array.isArray(questionData.questions)) {
            questionData.questions.forEach((q) => {
              const questionId = `${doc.id}_${q.title}`;
              fetchedQuestions.push({
                id: questionId,
                question: q.title,
                type: q.type || 'shortText',
                options: Array.isArray(q.options) ? q.options : (typeof q.options === 'object' ? Object.values(q.options) : []),
                required: q.required || false,
                description: q.description || ''
              });
            });
          }
        });
  
        console.log('Fetched Questions:', fetchedQuestions); // Log to verify IDs
        setQuestions(fetchedQuestions);
        setCurrentQuestion(0); // Start with the first question (startupName)
      } catch (error) {
        console.error('Error fetching program data:', error);
      } finally {
        setIsInitializing(false);
      }
    };
  
    fetchProgramData();
  }, [programId, auth.currentUser, addMessage]);

  console.log('Application rendered');

  if (isInitializing) {
    return (
      <div className="md:px-36 h-screen flex flex-col items-center justify-center">
        <LoadingDots />
      </div>
    );
  }

  return (
    <div className="md:px-36 h-screen flex flex-col">
      <div className="text-left mb-8">
        <h1 className="text-4xl font-bold font-sans-serif mb-8">{programTitle}</h1>
        <div className="flex border-b border-gray-300 justify-left mt-4" />
      </div>
      <div className="mb-8">
        {!hasSeenTypewriter ? (
          <Typewriter text="" speed={20} onComplete={handleTypewriterComplete} />
        ) : (
          <div className="min-h-[2em] flex items-center">
            <h2 className="text-xl font-semibold"></h2>
          </div>
        )}
      </div>
      <div className="flex-1 flex gap-4">
        <div className="flex-1 h-[650px] border rounded-lg shadow-lg flex flex-col bg-white scrollbar-hide">
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
                  hasSubmitted={hasSubmitted}
                  questions={questions}
                  currentQuestion={currentQuestion}
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
              currentQuestion={currentQuestion}
              questions={questions}
            />
          </div>
        </div>
        <QuestionSidebar />
      </div>
    </div>
  );
};

export default Application;
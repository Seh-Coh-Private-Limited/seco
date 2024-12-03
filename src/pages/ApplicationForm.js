import { Send } from "lucide-react";
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
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
const Typewriter = ({ text, speed = 50 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);

    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text[index]);
        index += 1;
      } else {
        clearInterval(interval);
        setIsComplete(true);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <h2 className={`text-xl font-semibold ${isComplete ? 'cursor-default' : 'animate-pulse'}`}>
      {displayedText}
      {!isComplete && <span className="ml-1 animate-pulse">|</span>}
    </h2>
  );
};

const Application = ({ programId }) => {
  const [inputValue, setInputValue] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(-1);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [programTitle, setProgramTitle] = useState('');
  const [messages, setMessages] = useState([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [typewriterText, setTypewriterText] = useState(
    "This application is the first step towards turning vision into innovation. Let's begin!"
  );

  // Fetch program and questions data
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

        const fetchedQuestions = questionsSnapshot.docs.flatMap((doc) =>
          doc.data().questions.map((q) => ({
            id: doc.id,
            question: q.title,
          }))
        );

        setQuestions(fetchedQuestions);

        setMessages([
          {
            type: 'bot',
            content:
              "Buckle up! I'm your guide on this application ride. 🎢 Drop your startup name or idea, and let's get this party started! 💡",
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        ]);
      } catch (error) {
        console.error('Error fetching program data:', error);
        setMessages([
          {
            type: 'bot',
            content: 'Error loading program questions. Please try again later.',
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        ]);
      } finally {
        setIsInitializing(false);
      }
    };

    fetchProgramData();
  }, [programId]);

  // Add a message to the chat
  const addMessage = (content, type) => {
    setMessages((prev) => [
      ...prev,
      {
        type,
        content,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ]);
  };

  // Handle user input submission
  const handleSubmit = () => {
    if (!inputValue.trim() || isLoading || isInitializing) return;

    addMessage(inputValue, 'user');
    const userResponse = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    setTimeout(() => {
      if (currentQuestion === -1) {
        setCurrentQuestion(0);
        addMessage(questions[0]?.question || 'No questions available.', 'bot');
      } else {
        setAnswers((prev) => ({
          ...prev,
          [questions[currentQuestion]?.id]: userResponse,
        }));

        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
          addMessage(questions[currentQuestion + 1].question, 'bot');
        } else {
          addMessage(
            "Thank you for completing your registration! We'll review your application and get back to you soon.",
            'bot'
          );
        }
      }
      setIsLoading(false);
    }, 1500);
  };

  // Message component
  const Message = ({ message }) => (
    <div
      className={`flex ${
        message.type === 'user' ? 'justify-end' : 'justify-start'
      } mb-4`}
    >
      <div
        className={`flex ${
          message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
        } items-start gap-2 max-w-[80%]`}
      >
        <div
          className={`w-8 h-8 flex items-center justify-center rounded-full ${
            message.type === 'user'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-500 text-white'
          }`}
        >
          {message.type === 'user' ? 'U' : 'B'}
        </div>
        <div>
          <div
            className={`rounded-lg p-3 ${
              message.type === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            {message.content}
          </div>
          <div className="text-xs text-gray-500 mt-1">{message.timestamp}</div>
        </div>
      </div>
    </div>
  );

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
        <Typewriter text={typewriterText} speed={20} />
      </div>

      <div className="h-[420px] border rounded-lg shadow-lg flex flex-col bg-white">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((message, index) => (
            <Message key={index} message={message} />
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2 max-w-[80%]">
                <div className="w-8 h-8 flex items-center justify-center bg-gray-500 text-white rounded-full">B</div>
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
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              type="text"
              className="flex-grow p-3 border rounded-lg focus:outline-none focus:border-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSubmit}
              className="p-3 bg-white border rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
              disabled={isLoading || !inputValue.trim()}
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

import React, { useState } from 'react';
import { Send } from "lucide-react";

const LoadingDots = () => (
  <div className="flex items-center space-x-1 p-2">
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
  </div>
);

const Application = () => {
  const [inputValue, setInputValue] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: 'Welcome to the Startup Incubator Program Registration! I\'ll help you complete your application. Let\'s get started!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const questions = [
    { id: 'founderName', question: "What's your full name?", type: 'text' },
    { id: 'email', question: "What's your email address?", type: 'email' },
    { id: 'startupName', question: "What's the name of your startup?", type: 'text' },
    { id: 'industry', question: "Which industry does your startup operate in?", type: 'text' },
    { id: 'stage', question: "What stage is your startup in? (Idea, MVP, Early Revenue, Growth)", type: 'text' },
    { id: 'problem', question: "What problem does your startup solve? Please be specific.", type: 'longtext' },
    { id: 'solution', question: "How does your solution address this problem?", type: 'longtext' },
    { id: 'marketSize', question: "What's your estimated market size and target audience?", type: 'longtext' },
    { id: 'funding', question: "Have you received any funding so far? If yes, please specify the amount and source.", type: 'text' },
    { id: 'teamSize', question: "How many team members do you have? Please list their key roles.", type: 'longtext' },
    { id: 'expectations', question: "What do you expect to gain from our incubator program?", type: 'longtext' }
  ];

  const addMessage = (content, type) => {
    const newMessage = {
      type,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSubmit = () => {
    if (inputValue.trim() === '' || isLoading) return;

    addMessage(inputValue, 'user');
    setAnswers((prev) => ({
      ...prev,
      [questions[currentQuestion].id]: inputValue
    }));

    setInputValue('');
    setIsLoading(true);

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
        addMessage(questions[currentQuestion + 1].question, 'bot');
      } else {
        addMessage("Thank you for completing your registration! We'll review your application and get back to you soon.", 'bot');
      }
      setIsLoading(false);
    }, 1500);
  };

  const Message = ({ message }) => (
    <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-2 max-w-[80%]`}>
        <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
          message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'
        }`}>
          {message.type === 'user' ? 'U' : 'B'}
        </div>
        <div>
          <div className={`rounded-lg p-3 ${
            message.type === 'user'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}>
            {message.content}
          </div>
          <div className="text-xs text-gray-500 mt-1">{message.timestamp}</div>
        </div>
      </div>
    </div>
  );

  React.useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      addMessage(questions[0].question, 'bot');
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="md:px-56 overflow-auto">
      <div className="text-left mb-8">
        <h1 className="text-4xl font-bold font-sans-serif">Program Title</h1>
        <div className="flex border-b border-gray-300 justify-left mt-4">
          {/* <span className="font-medium text-blue-600">Registration Form</span> */}
        </div>
      </div>

      <div className="border rounded-lg shadow-lg min-h-[600px] flex flex-col bg-white">
        <div className="bg-gray-100 p-4 border-b">
          <h2 className="text-xl font-bold">Registration Chat Assistant</h2>
          <p className="text-sm text-gray-500">Please answer all questions to complete your registration</p>
        </div>

        <div className="flex-grow p-4 overflow-auto">
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

        <div className="border-t p-4">
          <div className="flex flex-col gap-2">
            {questions[currentQuestion].type === 'longtext' ? (
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your answer here..."
                className="min-h-[100px] p-2 border rounded-md"
                disabled={isLoading}
                rows="4"
              />
            ) : (
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your answer here..."
                type={questions[currentQuestion].type}
                className="p-2 border rounded-md"
                disabled={isLoading}
              />
            )}
            <button
              onClick={handleSubmit}
              className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
              disabled={isLoading || !inputValue.trim()}
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Application;

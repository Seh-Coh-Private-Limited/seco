import React, { useState } from 'react';
import { 
  Trash2, 
  GripVertical, 
  Plus, 
  Settings, 
  Copy,
  Type,
  CheckSquare,
  Circle,
  Calendar,
  Upload,
  Star,
  AlignLeft,
  Clock,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { db, collection, addDoc,firebase,firestore } from '../firebase'; // Import the Firestore functions
// Card components remain the same
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-4 ${className}`}>
    {children}
  </div>
);

const questionTypes = [
  { id: 'shortText', icon: <Type className="w-4 h-4" />, label: 'Short Text' },
  { id: 'longText', icon: <AlignLeft className="w-4 h-4" />, label: 'Long Text' },
  { id: 'multipleChoice', icon: <Circle className="w-4 h-4" />, label: 'Multiple Choice' },
  { id: 'checkbox', icon: <CheckSquare className="w-4 h-4" />, label: 'Checkboxes' },
  { id: 'date', icon: <Calendar className="w-4 h-4" />, label: 'Date' },
  { id: 'time', icon: <Clock className="w-4 h-4" />, label: 'Time' },
  { id: 'fileUpload', icon: <Upload className="w-4 h-4" />, label: 'File Upload' },
  { id: 'rating', icon: <Star className="w-4 h-4" />, label: 'Rating' }
];

const FormBuilder = () => {
  const [formTitle, setFormTitle] = useState('Enter your Form title');
  const [formDescription, setFormDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [currentStep, setCurrentStep] = useState('edit'); // 'edit' or 'review'

  // Previous functions remain the same
  const addQuestion = (type) => {
    const newQuestion = {
      id: Date.now(),
      type,
      title: 'Question',
      description: '',
      required: false,
      options: type === 'multipleChoice' || type === 'checkbox' ? ['Option 1'] : [],
    };
    setQuestions([...questions, newQuestion]);
    setSelectedQuestion(newQuestion.id);
  };

  const updateQuestion = (id, updates) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, ...updates } : q
    ));
  };

  const deleteQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
    if (selectedQuestion === id) {
      setSelectedQuestion(null);
    }
  };

  const addOption = (questionId) => {
    const question = questions.find(q => q.id === questionId);
    if (question) {
      const newOptions = [...question.options, `Option ${question.options.length + 1}`];
      updateQuestion(questionId, { options: newOptions });
    }
  };
  const handleFormLaunch = async () => {
    try {
      // Create the form object including the title, description, and questions
      const formData = {
        title: formTitle,
        description: formDescription,
        questions: questions.map(q => ({
          id: q.id,
          type: q.type,
          title: q.title,
          description: q.description,
          required: q.required,
          options: q.options,
        })),
        createdAt: db.FieldValue.serverTimestamp(),  // Correct usage of Firestore FieldValue
      };
  
      // Save the form data in the "programmes" collection
      const docRef = await db.collection('programmes').add(formData);
  
      console.log("Form successfully created with ID:", docRef.id);
    } catch (error) {
      console.error("Error creating form:", error);
    }
  };
  const QuestionCard = ({ question, isReview = false }) => {
    const isSelected = selectedQuestion === question.id;

    if (isReview) {
      return (
        <Card className="mb-4">
          <CardContent>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{question.title}</h3>
              {question.type === 'multipleChoice' || question.type === 'checkbox' ? (
                <div className="space-y-2 pl-4">
                  {question.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {question.type === 'multipleChoice' ? (
                        <Circle className="w-4 h-4" />
                      ) : (
                        <CheckSquare className="w-4 h-4" />
                      )}
                      <span>{option}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 italic">
                  {question.type === 'shortText' && 'Short answer text field'}
                  {question.type === 'longText' && 'Long answer text field'}
                  {question.type === 'date' && 'Date picker'}
                  {question.type === 'time' && 'Time picker'}
                  {question.type === 'fileUpload' && 'File upload field'}
                  {question.type === 'rating' && 'Rating selector'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    // Original QuestionCard rendering for edit mode
    return (
      <Card className={`mb-4 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="cursor-move text-gray-400">
              <GripVertical className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={question.title}
                onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
                className="w-full text-lg font-medium mb-2 border-none focus:outline-none focus:ring-0"
                placeholder="Question"
              />
              {question.type === 'multipleChoice' || question.type === 'checkbox' ? (
                <div className="space-y-2">
                  {question.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {question.type === 'multipleChoice' ? (
                        <Circle className="w-4 h-4" />
                      ) : (
                        <CheckSquare className="w-4 h-4" />
                      )}
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...question.options];
                          newOptions[index] = e.target.value;
                          updateQuestion(question.id, { options: newOptions });
                        }}
                        className="flex-1 border-none focus:outline-none focus:ring-0"
                        placeholder={`Option ${index + 1}`}
                      />
                      <button
                        onClick={() => {
                          const newOptions = question.options.filter((_, i) => i !== index);
                          updateQuestion(question.id, { options: newOptions });
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addOption(question.id)}
                    className="text-blue-600 text-sm flex items-center gap-1 mt-2"
                  >
                    <Plus className="w-4 h-4" /> Add Option
                  </button>
                </div>
              ) : (
                <div className="text-gray-400 text-sm">
                  {question.type === 'shortText' && 'Short answer text'}
                  {question.type === 'longText' && 'Long answer text'}
                  {question.type === 'date' && 'Date'}
                  {question.type === 'time' && 'Time'}
                  {question.type === 'fileUpload' && 'File upload'}
                  {question.type === 'rating' && 'Rating'}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const questionCopy = {...questions.find(q => q.id === question.id)};
                  questionCopy.id = Date.now();
                  setQuestions([...questions, questionCopy]);
                }}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteQuestion(question.id)}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedQuestion(isSelected ? null : question.id)}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ReviewSection = () => (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <Card className="mb-6">
          <CardContent>
            <h2 className="text-2xl font-semibold mb-2">{formTitle}</h2>
            <p className="text-gray-600">{formDescription}</p>
          </CardContent>
        </Card>
        
        {questions.map(question => (
          <QuestionCard key={question.id} question={question} isReview={true} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-1">
        {/* Main form editing area */}
        {currentStep === 'edit' ? (
          <>
            <div className="flex-1 p-6 bg-gray-50">
              <div className="max-w-3xl mx-auto">
                {/* Form header */}
                <Card className="mb-6">
                  <CardContent>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full text-2xl font-semibold mb-2 border-none focus:outline-none focus:ring-0"
                      placeholder="Form Title"
                    />
                    <input
                      type="text"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="w-full text-gray-600 border-none focus:outline-none focus:ring-0"
                      placeholder="Form Description"
                    />
                  </CardContent>
                </Card>

                {/* Questions */}
                {questions.map(question => (
                  <QuestionCard key={question.id} question={question} />
                ))}
              </div>
            </div>

            {/* Right sidebar with question types */}
            <div className="w-64 border-l border-gray-200 p-4 bg-white">
              <h3 className="text-sm font-medium text-gray-600 mb-4">Add Question</h3>
              <div className="grid grid-cols-2 gap-2">
                {questionTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => addQuestion(type.id)}
                    className="p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md flex flex-col items-center gap-1"
                  >
                    {type.icon}
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <ReviewSection />
        )}
      </div>

      {/* Footer with navigation buttons */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="max-w-3xl mx-auto flex justify-between">
          {currentStep === 'review' && (
            <button
              onClick={() => setCurrentStep('edit')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Edit
            </button>
          )}
          <div className="ml-auto">
            {currentStep === 'edit' ? (
              <button
                onClick={() => setCurrentStep('review')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Review & Launch <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFormLaunch}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Launch Form <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;
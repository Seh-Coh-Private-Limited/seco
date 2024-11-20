import React, { useState, useEffect } from 'react';
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
  ArrowRight,
  FolderPlus
} from 'lucide-react';
import { db,serverTimestamp,collection,query,addDoc,where,getDocs } from '../firebase';

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

const FormBuilder = ({ programId }) => {
  const [formTitle, setFormTitle] = useState('Enter your Form title');
  const [formDescription, setFormDescription] = useState('');
  const [sections, setSections] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [currentStep, setCurrentStep] = useState('edit');
  const [selectedSection, setSelectedSection] = useState(null);

  // Add a new section
  const addSection = () => {
    const newSection = {
      id: Date.now(),
      title: 'New Section',
      description: '',
      questions: []
    };
    setSections([...sections, newSection]);
  };

  // Update section details
  const updateSection = (sectionId, updates) => {
    setSections(sections.map(section =>
      section.id === sectionId ? { ...section, ...updates } : section
    ));
  };

  // Delete section
  const deleteSection = (sectionId) => {
    setSections(sections.filter(section => section.id !== sectionId));
  };

  // Add question to a specific section
  const addQuestion = (sectionId, type) => {
    const newQuestion = {
      id: Date.now(),
      type,
      title: 'Question',
      description: '',
      required: false,
      options: type === 'multipleChoice' || type === 'checkbox' ? ['Option 1'] : [],
    };
    
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: [...section.questions, newQuestion]
        };
      }
      return section;
    }));
    setSelectedQuestion(newQuestion.id);
    setSelectedSection(sectionId);
  };

  // Update question within a section
  const updateQuestion = (sectionId, questionId, updates) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.map(q =>
            q.id === questionId ? { ...q, ...updates } : q
          )
        };
      }
      return section;
    }));
  };

  // Delete question from a section
  const deleteQuestion = (sectionId, questionId) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.filter(q => q.id !== questionId)
        };
      }
      return section;
    }));
    if (selectedQuestion === questionId) {
      setSelectedQuestion(null);
    }
  };

  // Add option to a question
  const addOption = (sectionId, questionId) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.map(q => {
            if (q.id === questionId) {
              return {
                ...q,
                options: [...q.options, `Option ${q.options.length + 1}`]
              };
            }
            return q;
          })
        };
      }
      return section;
    }));
  };

  const handleFormLaunch = async () => {
    try {
      // Validate form fields
      if (!formTitle.trim()) {
        alert('Please enter a form title');
        return;
      }
  
      if (!programId) {
        alert('Invalid program ID. Please check and try again.');
        return;
      }
  
      if (sections.length === 0) {
        alert('Please add at least one section to the form');
        return;
      }
  
      // Construct the simplified form data structure without IDs
      const formData = {
        title: formTitle,
        description: formDescription || "", 
        sections: sections.map(section => ({
          title: section.title,
          description: section.description || "",
          questions: section.questions.map(q => ({
            type: q.type,
            title: q.title,
            description: q.description || "",
            required: q.required || false,
            options: q.options || [], // Only included for multiple choice/checkbox questions
          })),
        })),
        createdAt: serverTimestamp(),
        programId,
      };
  
      // Reference to the "programmes" collection and query by program ID
      const programmesRef = collection(db, "programmes");
      const q = query(programmesRef, where("id", "==", programId));
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        alert('No matching program found. Please check the program ID.');
        return;
      }
  
      const docRef = querySnapshot.docs[0].ref;
  
      // Add the simplified form to the "form" subcollection
      const formRef = await addDoc(collection(docRef, "form"), formData);
  
      console.log("Form successfully created with ID:", formRef.id);
      alert('Form successfully launched!');
    } catch (error) {
      console.error("Error creating form:", error.message || error);
      alert('Failed to launch form. Please try again.');
    }
  };
  const QuestionCard = ({ section, question, isReview = false }) => {
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
                onChange={(e) => updateQuestion(section.id, question.id, { title: e.target.value })}
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
                          updateQuestion(section.id, question.id, { options: newOptions });
                        }}
                        className="flex-1 border-none focus:outline-none focus:ring-0"
                        placeholder={`Option ${index + 1}`}
                      />
                      <button
                        onClick={() => {
                          const newOptions = question.options.filter((_, i) => i !== index);
                          updateQuestion(section.id, question.id, { options: newOptions });
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addOption(section.id, question.id)}
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
                  const questionCopy = {...question};
                  questionCopy.id = Date.now();
                  updateSection(section.id, {
                    questions: [...section.questions, questionCopy]
                  });
                }}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteQuestion(section.id, question.id)}
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

  const SectionCard = ({ section, isReview = false }) => (
    <Card className="mb-6">
      <CardContent>
        {!isReview && (
          <div className="flex justify-between mb-4">
            <input
              type="text"
              value={section.title}
              onChange={(e) => updateSection(section.id, { title: e.target.value })}
              className="text-xl font-semibold border-none focus:outline-none focus:ring-0"
              placeholder="Section Title"
            />
            <button
              onClick={() => deleteSection(section.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
        {isReview && (
          <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
        )}
        {section.questions.map(question => (
          <QuestionCard 
            key={question.id} 
            section={section}
            question={question} 
            isReview={isReview} 
          />
        ))}
        {!isReview && (
          <div className="mt-4">
            <div className="grid grid-cols-4 gap-2">
              {questionTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => addQuestion(section.id, type.id)}
                  className="p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md flex flex-col items-center gap-1"
                >
                  {type.icon}
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const ReviewSection = () => (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <Card className="mb-6">
          <CardContent>
            <h2 className="text-2xl font-semibold mb-2">{formTitle}</h2>
            <p className="text-gray-600">{formDescription}</p>
          </CardContent>
        </Card>
        
        {sections.map(section => (
          <SectionCard key={section.id} section={section} isReview={true} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        {currentStep === 'edit' ? (
          <div className="p-6 bg-gray-50">
            <div className="max-w-3xl mx-auto">
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
                    placeholder="Form Description"/>
                    </CardContent>
                  </Card>
    
                  {sections.map(section => (
                    <SectionCard key={section.id} section={section} />
                  ))}
    
                  <button
                    onClick={addSection}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2"
                  >
                    <FolderPlus className="w-5 h-5" />
                    Add New Section
                  </button>
                </div>
              </div>
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
                    onClick={() => setCurrentStep('3')}
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
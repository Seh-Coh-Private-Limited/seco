import {
  AlignLeft,
  ArrowRight,
  Calendar,
  CheckSquare,
  Circle,
  Clock,
  Copy,
  GripVertical,
  HelpCircle,
  Plus,
  Settings,
  Star,
  Trash2,
  Type,
  Upload,
  X
} from 'lucide-react';
import { default as React, useCallback, useEffect, useState ,useRef} from 'react';
import FProgramDetailPage from '../components/Reviewsection';
import { addDoc, collection, db, doc, getDoc, getDocs, query, updateDoc, where } from '../firebase';
import RegistrationInfo from './ri';

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

const FormBuilder = ({ programId,userId,currentStep, setCurrentStep,setShowCreateEvent,onFormLaunchSuccess,eventData }) => {
  const [formTitle, setFormTitle] = useState('Registration Questions');
  const [formDescription, setFormDescription] = useState('We will ask guests the following questions when they register for the event.');
  const [sections, setSections] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  // const [currentStep, setCurrentStep] = useState(2);
  const [selectedSection, setSelectedSection] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionDescription, setNewSectionDescription] = useState('');
  const [modalQuestions, setModalQuestions] = useState([]);
  const [selectedModalQuestion, setSelectedModalQuestion] = useState(null);
  const [programStatus, setProgramStatus] = useState(null);
  const [existingQuestions, setExistingQuestions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkProgramStatus = async () => {
      if (!userId) return;
      console.log('Program ID in FormBuilder:', programId);
      try {
        // Get user's program status
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProgramStatus(userData.programStatus);

          // If program is active, fetch existing questions
          if (['active', 'draft'].includes(userData.programStatus)){
            const programRef = collection(db, "programmes");
            const programQuery = query(programRef, where("id", "==", programId));
            const programSnapshot = await getDocs(programQuery);

            if (!programSnapshot.empty) {
              const programDoc = programSnapshot.docs[0];
              const formCollectionRef = collection(programDoc.ref, "form");
              const formSnapshot = await getDocs(formCollectionRef);

              if (!formSnapshot.empty) {
                const formData = formSnapshot.docs[0].data();
                
                // Transform questions into sections format
                const transformedQuestions = {
                  id: Date.now(),
                  title: '',
                  description: '',
                  questions: formData.questions.map(q => ({
                    ...q,
                    id: Date.now() + Math.random(),
                  }))
                };
                
                setSections([transformedQuestions]);
                setExistingQuestions(formData.questions);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error checking program status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkProgramStatus();
  }, [userId, programId]);
  const resetModalState = () => {
    setNewSectionTitle('');
    setNewSectionDescription('');
    setModalQuestions([]);
    setSelectedModalQuestion(null);
  };

  // Modified handleAddSection to include questions
  const handleAddSection = () => {
    if (sections.length > 0) {
      // Append to the existing section
      const updatedSection = {
        ...sections[0],
        questions: [...sections[0].questions, ...modalQuestions]
      };
      setSections([updatedSection]);
    } else {
      // Create a new section
      const newSection = {
        id: Date.now(),
        title: newSectionTitle,
        description: newSectionDescription,
        questions: modalQuestions
      };
      setSections([newSection]);
    }
    submitQuestions(); 
    setIsModalOpen(false);
    resetModalState();
    // Call submitQuestions after updating the sections
  };
  // Add question within modal
  const addModalQuestion = (type) => {
    const newQuestion = {
      id: Date.now(),
      type,
      title: 'Write text here',
      description: '',
      required: false,
      options: (type === 'multipleChoice' || type === 'checkbox') ? ['Option 1'] : [],
    };
  
    // Use functional form to prevent stale state
    setModalQuestions((prevQuestions) => [...prevQuestions, newQuestion]);
    setSelectedModalQuestion(newQuestion.id);
  };
  

  // Update question within modal
  const updateModalQuestion = useCallback((questionId, updates) => {
    setModalQuestions(prevQuestions => {
      return prevQuestions.map(question => {
        if (question.id === questionId) {
          return {
            ...question,
            ...updates
          };
        }
        return question;
      });
    });
  }, []);
  

  // Delete question within modal
  const deleteModalQuestion = (questionId) => {
    setModalQuestions(modalQuestions.filter(q => q.id !== questionId));
    if (selectedModalQuestion === questionId) {
      setSelectedModalQuestion(null);
    }
  };

  // Add option to a question within modal
  const addModalOption = (questionId) => {
    setModalQuestions(modalQuestions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          options: [...q.options, `Option ${q.options.length + 1}`]
        };
      }
      return q;
    }));
  };

  // Modal Question Card component
  const OptionInput = ({ option, index, questionId, questionType, onUpdate, onDelete }) => {
    const [localOption, setLocalOption] = useState(option);
    const [isFocused, setIsFocused] = useState(false);
  
    return (
      <div className="flex items-center gap-2">
        {questionType === 'multipleChoice' ? (
          <Circle className="w-4 h-4" />
        ) : (
          <CheckSquare className="w-4 h-4" />
        )}
        <input
          type="text"
          value={isFocused ? localOption : localOption || `Option ${index + 1}`}
          onChange={(e) => {
            setLocalOption(e.target.value);
          }}
          onFocus={() => {
            setIsFocused(true);
            setLocalOption('');
          }}
          onBlur={() => {
            setIsFocused(false);
            onUpdate(index, localOption);
          }}
          className="flex-1 border-none focus:outline-none focus:ring-0"
          placeholder={isFocused ? '' : `Option ${index + 1}`}
        />
        <button
          onClick={() => onDelete(index)}
          className="text-gray-400 hover:text-gray-600"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  };
  
  const ModalQuestionCard = ({ question }) => {
    const isSelected = selectedModalQuestion === question.id;
    const [localTitle, setLocalTitle] = useState(question.title);
    const questionRef = useRef(null);
  
    useEffect(() => {
      if (isSelected && questionRef.current) {
        questionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, [isSelected]);
  
    const handleTitleChange = (e) => {
      setLocalTitle(e.target.value);
    };
  
    const handleTitleBlur = () => {
      setModalQuestions(prevQuestions =>
        prevQuestions.map(q =>
          q.id === question.id ? { ...q, title: localTitle } : q
        )
      );
    };
  
    const handleOptionUpdate = (index, newValue) => {
      setModalQuestions(prevQuestions =>
        prevQuestions.map(q => {
          if (q.id === question.id) {
            const newOptions = [...q.options];
            newOptions[index] = newValue;
            return { ...q, options: newOptions };
          }
          return q;
        })
      );
    };
  
    const handleOptionDelete = (index) => {
      setModalQuestions(prevQuestions =>
        prevQuestions.map(q => {
          if (q.id === question.id) {
            const newOptions = q.options.filter((_, i) => i !== index);
            return { ...q, options: newOptions };
          }
          return q;
        })
      );
    };
  
    return (
      <div
      ref={questionRef}
      className={`bg-white rounded-lg shadow mb-4 p-4 ${isSelected ? "ring-2 ring-blue-500" : ""}`}
    >
      <div className="flex items-start gap-4">
        {/* Drag Handle */}
        <div className="cursor-move text-gray-400 flex items-center">
          <GripVertical className="w-6 h-6 "style={{ marginTop: "0.1rem" }} />
        </div>
    
        {/* Question Input and Options */}
        <div className="flex-1">
          <input
            type="text"
            value={localTitle}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onFocus={() => setLocalTitle((prev) => (prev === "Write text here" ? "" : prev))}
            className="w-full text-lg font-medium mb-2 border-none focus:outline-none focus:ring-0"
            placeholder={localTitle ? "" : "Write text here"}
          />
    
          {/* Options Section */}
          {(question.type === "multipleChoice" || question.type === "checkbox") && (
            <div className="space-y-2">
              {question.options.map((option, index) => (
                <OptionInput
                  key={`${question.id}-option-${index}`}
                  option={option}
                  index={index}
                  questionId={question.id}
                  questionType={question.type}
                  onUpdate={handleOptionUpdate}
                  onDelete={handleOptionDelete}
                />
              ))}
    
              <button
                onClick={() => {
                  setModalQuestions((prevQuestions) =>
                    prevQuestions.map((q) => {
                      if (q.id === question.id) {
                        return {
                          ...q,
                          options: [...q.options, `Option ${q.options.length + 1}`],
                        };
                      }
                      return q;
                    })
                  );
                }}
                className="text-blue-600 text-sm flex items-center gap-1 mt-2"
              >
                <Plus className="w-4 h-4" /> Add Option
              </button>
            </div>
          )}
        </div>
    
        {/* Right Section (Required Checkbox & Buttons) */}
        <div className="flex items-center gap-4">
          {/* Required Checkbox */}
          <div className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={question.required || false}
              onChange={(e) => updateModalQuestion(question.id, { required: e.target.checked })}
              className="w-4 h-4"
            />
            <label className="text-sm text-gray-600">Required</label>
          </div>
    
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button onClick={() => deleteModalQuestion(question.id)} className="p-2 hover:bg-gray-100 rounded-md">
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedModalQuestion(isSelected ? null : question.id)}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
    
    );
  };

  // Enhanced Modal component
  const AddSectionModal = () => {
    const [questions, setQuestions] = useState([]);

    if (!isModalOpen) return null;

    const addQuestion = (typeId) => {
        const newQuestion = addModalQuestion(typeId);
        setQuestions([...questions, newQuestion]);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Questions</h2>
                        <button
    onClick={() => {
        setIsModalOpen(false);
        resetModalState();
    }}
    className="text-gray-500 hover:text-gray-700 hover:bg-transparent focus:outline"
>
    <X className="w-5 h-5" />
</button>

                    </div>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    <div className="space-y-6">
                        {modalQuestions.map(question => (
                            <ModalQuestionCard key={question.id} question={question} />
                        ))}
                        
                        <h3 className="text-lg font-medium mb-4">Add Questions</h3>
                        
                        <div className="grid grid-cols-4 gap-2 mt-4">
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
                </div>

                <div className="p-6 border-t bg-gray-50">
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => {
                                setIsModalOpen(false);
                                resetModalState();
                            }}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                        >
                            Cancel
                        </button>
                        <button
  onClick={() => {
    try {
      handleAddSection();
      // submitQuestions();
    } catch (error) {
      console.error('Error in button click handler:', error);
    }
  }}
  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
  disabled={!modalQuestions.length}
>
  Save Questions
</button>

                    </div>
                </div>
            </div>
        </div>
    );
};

  

  // Add a new section
  const addSection = () => {
    const newSection = {
      id: Date.now(),
      title: '',
      description: '',
      questions: []
    };
    setSections([...sections, newSection]);
  };


  // const handleAddSection = () => {
  //   const newSection = {
  //     id: Date.now(),
  //     title: '',
  //     description: '',
  //     questions: []
  //   };
  //   setSections([...sections, newSection]);
  //   setIsModalOpen(false);
  // };
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
      title: 'Write text here',
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
  const submitQuestions = async () => {
    try {
      if (!formTitle.trim()) {
        alert('Please enter a form title');
        return;
      }

      if (!programId) {
       
        alert('Invalid program ID. Please check and try again.');
        return;
      }

      if (sections.length === 0) {
        // alert('Please add at least one section to the form');
        return;
      }

      const formData = {
        questions: sections.flatMap(section =>
          section.questions.map(q => ({
            type: q.type,
            title: q.title,
            description: q.description || "",
            required: q.required || false,
            options: q.options || [],
          }))
        ),
      };

      const programmesRef = collection(db, "programmes");
      const q = query(programmesRef, where("id", "==", programId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert('No matching program found. Please check the program ID.');
        return;
      }

      const docRef = querySnapshot.docs[0].ref;

      // If there are existing questions, update them instead of creating new ones
      if (existingQuestions) {
        const formCollectionRef = collection(docRef, "form");
        const formSnapshot = await getDocs(formCollectionRef);
        
        if (!formSnapshot.empty) {
          const formDoc = formSnapshot.docs[0];
          await updateDoc(formDoc.ref, formData);
        } else {
          await addDoc(collection(docRef, "form"), formData);
        }
      } else {
        await addDoc(collection(docRef, "form"), formData);
      }

      setIsModalOpen(false);
      resetModalState();
      // alert('Form successfully ' + (existingQuestions ? 'updated!' : 'launched!'));
    //  alert('Form successfully ' + (existingQuestions ? 'updated!' : 'launched!'));
      // Move to next step after successful submission
      // setCurrentStep(3);
    } catch (error) {
      console.error("Error saving form:", error.message || error);
      alert('Failed to save form. Please try again.');
    }
  };
  const createToast = ({ title, description, actionText, actionCallback }) => {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #333; /* Dark background */
      color: #fff; /* White text */
      padding: 16px 24px;
      border-radius: 12px; /* Smooth rounded edges */
      box-shadow: 0 4px 6px rgba(0,0,0,0.2);
      z-index: 1000;
      min-width: 320px; /* Adjusted width */
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      font-family: Arial, sans-serif;
    `;
  
    // Text container
    const textContainer = document.createElement('div');
    textContainer.style.display = 'flex';
    textContainer.style.flexDirection = 'column';
  
    const titleEl = document.createElement('div');
    titleEl.textContent = title;
    titleEl.style.fontWeight = 'bold';
    titleEl.style.fontSize = '16px';
  
    const descEl = document.createElement('div');
    descEl.textContent = description;
    descEl.style.fontSize = '14px';
  
    textContainer.appendChild(titleEl);
    textContainer.appendChild(descEl);
  
    // Action button
    const actionBtn = document.createElement('button');
    actionBtn.textContent = actionText || "OK";
    actionBtn.style.cssText = `
      background: #fff; /* White button */
      color: #333; /* Dark text */
      border: none;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: bold;
    `;
    actionBtn.addEventListener('click', () => {
      document.body.removeChild(toast);
      if (actionCallback) actionCallback();
    });
  
    // Append elements
    toast.appendChild(textContainer);
    toast.appendChild(actionBtn);
    document.body.appendChild(toast);
  
    // Auto-remove after 4 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        document.body.removeChild(toast);
      }
    }, 4000);
  };
  
  const handleFormLaunch = async () => {
    try {
      // Validate inputs
      if (!programId) {
        createToast({
          title: "Error",
          description: "Invalid program ID. Please check and try again.",
          actionText: "OK"
        });
        return;
      }
      if (!userId) {
        createToast({
          title: "Error",
          description: "Invalid user ID. Please check and try again.",
          actionText: "OK"
        });
        return;
      }
  
      console.log('Launching form with:', { userId, programId });
  
      // Update program status
      const programmesRef = collection(db, 'programmes');
      const programQuery = query(programmesRef, where('id', '==', programId));
      const programSnapshot = await getDocs(programQuery);
  
      if (!programSnapshot.empty) {
        const docRef = doc(db, 'programmes', programSnapshot.docs[0].id);
        await updateDoc(docRef, {
          programStatus: 'completed',
          updatedAt: new Date(),
        });
        console.log('Program updated successfully');
      } else {
        console.warn('No program found for ID:', programId);
      }
  
      // Update user status
      const usersRef = collection(db, 'users');
      const userQuery = query(usersRef, where('uid', '==', userId));
      const userSnapshot = await getDocs(userQuery);
  
      if (userSnapshot.empty) {
        console.error('No user found for userId:', userId);
        createToast({
          title: "Error",
          description: "No user found with the given user ID.",
          actionText: "OK"
        });
        return;
      }
  
      const userDocRef = userSnapshot.docs[0].ref;
      await updateDoc(userDocRef, {
        programStatus: 'completed',
        programid: null,
      });
      console.log('User updated successfully');
  
      // Update UI state
      setCurrentStep(1);
      setShowCreateEvent(false);
  
      createToast({
        title: "Success",
        description: "Form successfully launched!",
        actionText: "OK"
      });
  
      if (onFormLaunchSuccess) {
        onFormLaunchSuccess();
      }
    } catch (error) {
      console.error('Error in handleFormLaunch:', error.code, error.message, error.stack);
      createToast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        actionText: "OK"
      });
    }
  };
  
  
  const QuestionCard = ({ section, question, isReview = false }) => {
    const isSelected = selectedQuestion === question.id;
// Add local state for the title
const [localTitle, setLocalTitle] = useState(question.title || '');

// Sync local state with prop changes
useEffect(() => {
  setLocalTitle(question.title || '');
}, [question.title]);

const handleTitleChange = (e) => {
  setLocalTitle(e.target.value);
};

const handleTitleBlur = () => {
  updateQuestion(section.id, question.id, { title: localTitle });
};
    if (isReview) {
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
                  value={localTitle}
                  onChange={handleTitleChange}
                  onBlur={handleTitleBlur}
                  className="w-full text-lg font-medium mb-2 border-none focus:outline-none focus:ring-0"
                  placeholder="Write text here"
                />
                {question.required && (
                  <span className="text-red-500 text-sm">*</span>
                )}
                {(question.type === 'multipleChoice' || question.type === 'checkbox') && (
                  <div className="space-y-2">
                    {question.options && question.options.map((option, index) => (
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
                      </div>
                    ))}
                  </div>
                )}
                {(!question.type || (question.type !== 'multipleChoice' && question.type !== 'checkbox')) && (
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
              <GripVertical className="w-6 h-6 " style={{ marginTop: "0.1rem" }}/>
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={localTitle}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
                className="w-full text-lg font-medium mb-2 border-none focus:outline-none focus:ring-0"
                placeholder="Write text here"
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
            <div className="mt-1 flex items-center gap-2">
              <input
                type="checkbox"
                checked={question.required || false}
                onChange={(e) => updateQuestion(section.id, question.id, { required: e.target.checked })}
                className="w-4 h-4"
              />
              <label className="text-sm text-gray-600">Required</label>
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
            {/* <input
              type="text"
              value={section.title}
              
              onChange={(e) => updateSection(section.id, { title: e.target.value })}
              className="text-xl font-semibold border-none focus:outline-none focus:ring-0"
              placeholder="Section Title(if any)"
            /> */}
            {/* <button
              onClick={() => deleteSection(section.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Trash2 className="w-4 h-4" />
            </button> */}
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
            {/* <div className="grid grid-cols-4 gap-2">
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
            </div> */}
          </div>
        )}
      </CardContent>
    </Card>
  );

  // const ReviewSection = () => (
  //   <div className="flex-1 p-6 bg-gray-50">
  //     <div className="max-w-3xl mx-auto">
  //       <Card className="mb-6">
  //         <CardContent>
  //           <h2 className="text-2xl font-semibold mb-2">{formTitle}</h2>
  //           <p className="text-gray-600">{formDescription}</p>
  //         </CardContent>
  //       </Card>
        
  //       {sections.map(section => (
  //         <SectionCard key={section.id} section={section} isReview={true} />
  //       ))}
  //     </div>
  //   </div>
  // );

  return (
    <div className="flex flex-col h-full">
      <AddSectionModal />
      <div className="flex-1 overflow-y-auto">
        {currentStep === 2 ? (
          <div className="p-6 bg-gray-50">
            <div className="mx-auto">
              <RegistrationInfo />
              
              

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-orange-100 p-2 rounded-lg">
                    <HelpCircle className="w-5 h-5 text-orange-500" />
                  </span>
                  <h2 className="text-xl font-semibold">Custom Section of Questions</h2>
                </div>
                
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                >
                  <Plus className="w-4 h-4" />
                  Add Questions
                </button>
              </div>
              {sections.map(section => (
                <SectionCard key={section.id} section={section} />
              ))}
            </div>
          </div>
        ) : (
          <div className="">
            
          <FProgramDetailPage programId={programId} eventData={eventData}/>
          </div>
        )}
      </div>
    
          {/* Footer with navigation buttons */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <div className=" mx-auto flex justify-between">
              
              <div className="ml-auto">
                {currentStep === 2 ? (
                 <button
                 onClick={() => {
                   submitQuestions(); // Call the submitQuestions function
                   setCurrentStep(3); // Move to the next step
                 }}
                 className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
               >
                 Review & Launch <ArrowRight className="w-4 h-4" />
               </button>
               
                ) : (
                  <button
                 
                  onClick={handleFormLaunch}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 mt-auto"
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
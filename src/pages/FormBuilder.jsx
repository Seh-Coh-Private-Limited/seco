// // import {
// //   AlignLeft,
// //   ArrowLeft,
// //   ArrowRight,
// //   Calendar,
// //   CheckSquare,
// //   Circle,
// //   Clock,
// //   Copy,
// //   GripVertical,
// //   HelpCircle,
// //   Plus,
// //   Settings,
// //   Star,
// //   Trash2,
// //   Type,
// //   Upload,
// //   X
// // } from 'lucide-react';
// // import React, { useState } from 'react';
// // import { addDoc, collection, db, getDocs, query, serverTimestamp, where } from '../firebase';
// // import RegistrationInfo from './ri';
// // const Card = ({ children, className = '' }) => (
// //   <div className={`bg-white rounded-lg shadow ${className}`}>
// //     {children}
// //   </div>
// // );

// // const CardContent = ({ children, className = '' }) => (
// //   <div className={`p-4 ${className}`}>
// //     {children}
// //   </div>
// // );

// // const questionTypes = [
// //   { id: 'shortText', icon: <Type className="w-4 h-4" />, label: 'Short Text' },
// //   { id: 'longText', icon: <AlignLeft className="w-4 h-4" />, label: 'Long Text' },
// //   { id: 'multipleChoice', icon: <Circle className="w-4 h-4" />, label: 'Multiple Choice' },
// //   { id: 'checkbox', icon: <CheckSquare className="w-4 h-4" />, label: 'Checkboxes' },
// //   { id: 'date', icon: <Calendar className="w-4 h-4" />, label: 'Date' },
// //   { id: 'time', icon: <Clock className="w-4 h-4" />, label: 'Time' },
// //   { id: 'fileUpload', icon: <Upload className="w-4 h-4" />, label: 'File Upload' },
// //   { id: 'rating', icon: <Star className="w-4 h-4" />, label: 'Rating' }
// // ];

// // const FormBuilder = ({ programId }) => {
// //   const [formTitle, setFormTitle] = useState('Registration Questions');
// //   const [formDescription, setFormDescription] = useState('We will ask guests the following questions when they register for the event.');
// //   const [sections, setSections] = useState([]);
// //   const [selectedQuestion, setSelectedQuestion] = useState(null);
// //   const [currentStep, setCurrentStep] = useState('edit');
// //   const [selectedSection, setSelectedSection] = useState(null);
// //   const [isModalOpen, setIsModalOpen] = useState(false);
// //   const [newSectionTitle, setNewSectionTitle] = useState('');
// //   const [newSectionDescription, setNewSectionDescription] = useState('');
// //   const [modalQuestions, setModalQuestions] = useState([]);
// //   const [selectedModalQuestion, setSelectedModalQuestion] = useState(null);

// //   const resetModalState = () => {
// //     setNewSectionTitle('');
// //     setNewSectionDescription('');
// //     setModalQuestions([]);
// //     setSelectedModalQuestion(null);
// //   };

// //   // Modified handleAddSection to include questions
// //   const handleAddSection = () => {
// //     const newSection = {
// //       id: Date.now(),
// //       title: newSectionTitle,
// //       description: newSectionDescription,
// //       questions: modalQuestions
// //     };
// //     setSections([...sections, newSection]);
// //     setIsModalOpen(false);
// //     resetModalState();
// //   };

// //   // Add question within modal
// //   const addModalQuestion = (type) => {
// //     const newQuestion = {
// //       id: Date.now(),
// //       type,
// //       title: 'Question',
// //       description: '',
// //       required: false,
// //       options: type === 'multipleChoice' || type === 'checkbox' ? ['Option 1'] : [],
// //     };
// //     setModalQuestions([...modalQuestions, newQuestion]);
// //     setSelectedModalQuestion(newQuestion.id);
// //   };

// //   // Update question within modal
// //   const updateModalQuestion = (questionId, updates) => {
// //     setModalQuestions(modalQuestions.map(q =>
// //       q.id === questionId ? { ...q, ...updates } : q
// //     ));
// //   };

// //   // Delete question within modal
// //   const deleteModalQuestion = (questionId) => {
// //     setModalQuestions(modalQuestions.filter(q => q.id !== questionId));
// //     if (selectedModalQuestion === questionId) {
// //       setSelectedModalQuestion(null);
// //     }
// //   };

// //   // Add option to a question within modal
// //   const addModalOption = (questionId) => {
// //     setModalQuestions(modalQuestions.map(q => {
// //       if (q.id === questionId) {
// //         return {
// //           ...q,
// //           options: [...q.options, `Option ${q.options.length + 1}`]
// //         };
// //       }
// //       return q;
// //     }));
// //   };

// //   // Modal Question Card component
// //   const ModalQuestionCard = ({ question }) => {
// //     const isSelected = selectedModalQuestion === question.id;

// //     return (
// //       <div className={`bg-white rounded-lg shadow mb-4 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
// //         <div className="p-4">
// //           <div className="flex items-start gap-4">
// //             <div className="cursor-move text-gray-400">
// //               <GripVertical className="w-6 h-6" />
// //             </div>
// //             <div className="flex-1">
// //               <input
// //                 type="text"
// //                 value={question.title}
// //                 onChange={(e) => updateModalQuestion(question.id, { title: e.target.value })}
// //                 className="w-full text-lg font-medium mb-2 border-none focus:outline-none focus:ring-0"
// //                 placeholder="Question"
// //               />
// //               {(question.type === 'multipleChoice' || question.type === 'checkbox') && (
// //                 <div className="space-y-2">
// //                   {question.options.map((option, index) => (
// //                     <div key={index} className="flex items-center gap-2">
// //                       {question.type === 'multipleChoice' ? (
// //                         <Circle className="w-4 h-4" />
// //                       ) : (
// //                         <CheckSquare className="w-4 h-4" />
// //                       )}
// //                       <input
// //                         type="text"
// //                         value={option}
// //                         onChange={(e) => {
// //                           const newOptions = [...question.options];
// //                           newOptions[index] = e.target.value;
// //                           updateModalQuestion(question.id, { options: newOptions });
// //                         }}
// //                         className="flex-1 border-none focus:outline-none focus:ring-0"
// //                         placeholder={`Option ${index + 1}`}
// //                       />
// //                       <button
// //                         onClick={() => {
// //                           const newOptions = question.options.filter((_, i) => i !== index);
// //                           updateModalQuestion(question.id, { options: newOptions });
// //                         }}
// //                         className="text-gray-400 hover:text-gray-600"
// //                       >
// //                         <Trash2 className="w-4 h-4" />
// //                       </button>
// //                     </div>
// //                   ))}
// //                   <button
// //                     onClick={() => addModalOption(question.id)}
// //                     className="text-blue-600 text-sm flex items-center gap-1 mt-2"
// //                   >
// //                     <Plus className="w-4 h-4" /> Add Option
// //                   </button>
// //                 </div>
// //               )}
// //             </div>
// //             <div className="flex items-center gap-2">
// //               <button
// //                 onClick={() => deleteModalQuestion(question.id)}
// //                 className="p-2 hover:bg-gray-100 rounded-md"
// //               >
// //                 <Trash2 className="w-4 h-4" />
// //               </button>
// //               <button
// //                 onClick={() => setSelectedModalQuestion(isSelected ? null : question.id)}
// //                 className="p-2 hover:bg-gray-100 rounded-md"
// //               >
// //                 <Settings className="w-4 h-4" />
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   };

// //   // Enhanced Modal component
// //   const AddSectionModal = () => {
// //     const [showQuestionTypes, setShowQuestionTypes] = useState(false);
  
// //     if (!isModalOpen) return null;
  
// //     return (
// //       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
// //         <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
// //           <div className="p-6 border-b">
// //             <div className="flex justify-between items-center">
// //               <h2 className="text-xl font-semibold">Add New Section</h2>
// //               <button
// //                 onClick={() => {
// //                   setIsModalOpen(false);
// //                   resetModalState();
// //                   setShowQuestionTypes(false);
// //                 }}
// //                 className="text-gray-500 hover:text-gray-700"
// //               >
// //                 <X className="w-5 h-5" />
// //               </button>
// //             </div>
// //           </div>
          
// //           <div className="p-6 flex-1 overflow-y-auto">
// //             <div className="space-y-6">
// //             <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-1">
// //                   Section Title
// //                 </label>
// //                 <input
// //                   type="text"
// //                   value={newSectionTitle}
// //                   onChange={(e) => setNewSectionTitle(e.target.value)}
// //                   className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
// //                   placeholder="Enter section title"
// //                 />
// //               </div>
// //               <div>
// //                 <h3 className="text-lg font-medium mb-4">Questions</h3>
// //                 {modalQuestions.map(question => (
// //                   <ModalQuestionCard key={question.id} question={question} />
// //                 ))}
                
// //                 {!showQuestionTypes ? (
// //                   <button
// //                     onClick={() => setShowQuestionTypes(true)}
// //                     className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 flex items-center justify-center gap-2"
// //                   >
// //                     <Plus className="w-5 h-5" />
// //                     Add Question
// //                   </button>
// //                 ) : (
// //                   <div className="grid grid-cols-4 gap-2 mt-4">
// //                     {questionTypes.map(type => (
// //                       <button
// //                         key={type.id}
// //                         onClick={() => {
// //                           addModalQuestion(type.id);
// //                           setShowQuestionTypes(false);
// //                         }}
// //                         className="p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md flex flex-col items-center gap-1"
// //                       >
// //                         {type.icon}
// //                         <span>{type.label}</span>
// //                       </button>
// //                     ))}
// //                   </div>
// //                 )}
// //               </div>
// //             </div>
// //           </div>
  
// //           <div className="p-6 border-t bg-gray-50">
// //             <div className="flex justify-end gap-3">
// //               <button
// //                 onClick={() => {
// //                   setIsModalOpen(false);
// //                   resetModalState();
// //                   setShowQuestionTypes(false);
// //                 }}
// //                 className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
// //               >
// //                 Cancel
// //               </button>
// //               <button
// //                 onClick={() => {
// //                   handleAddSection();
// //                   setShowQuestionTypes(false);
// //                 }}
// //                 className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
// //                 disabled={!modalQuestions.length}
// //               >
// //                 Add Section
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   };
  

// //   // Add a new section
// //   const addSection = () => {
// //     const newSection = {
// //       id: Date.now(),
// //       title: '',
// //       description: '',
// //       questions: []
// //     };
// //     setSections([...sections, newSection]);
// //   };


// //   // const handleAddSection = () => {
// //   //   const newSection = {
// //   //     id: Date.now(),
// //   //     title: '',
// //   //     description: '',
// //   //     questions: []
// //   //   };
// //   //   setSections([...sections, newSection]);
// //   //   setIsModalOpen(false);
// //   // };
// //   // Update section details
// //   const updateSection = (sectionId, updates) => {
// //     setSections(sections.map(section =>
// //       section.id === sectionId ? { ...section, ...updates } : section
// //     ));
// //   };

// //   // Delete section
// //   const deleteSection = (sectionId) => {
// //     setSections(sections.filter(section => section.id !== sectionId));
// //   };

// //   // Add question to a specific section
// //   const addQuestion = (sectionId, type) => {
// //     const newQuestion = {
// //       id: Date.now(),
// //       type,
// //       title: 'Question',
// //       description: '',
// //       required: false,
// //       options: type === 'multipleChoice' || type === 'checkbox' ? ['Option 1'] : [],
// //     };
    
// //     setSections(sections.map(section => {
// //       if (section.id === sectionId) {
// //         return {
// //           ...section,
// //           questions: [...section.questions, newQuestion]
// //         };
// //       }
// //       return section;
// //     }));
// //     setSelectedQuestion(newQuestion.id);
// //     setSelectedSection(sectionId);
// //   };

// //   // Update question within a section
// //   const updateQuestion = (sectionId, questionId, updates) => {
// //     setSections(sections.map(section => {
// //       if (section.id === sectionId) {
// //         return {
// //           ...section,
// //           questions: section.questions.map(q =>
// //             q.id === questionId ? { ...q, ...updates } : q
// //           )
// //         };
// //       }
// //       return section;
// //     }));
// //   };

// //   // Delete question from a section
// //   const deleteQuestion = (sectionId, questionId) => {
// //     setSections(sections.map(section => {
// //       if (section.id === sectionId) {
// //         return {
// //           ...section,
// //           questions: section.questions.filter(q => q.id !== questionId)
// //         };
// //       }
// //       return section;
// //     }));
// //     if (selectedQuestion === questionId) {
// //       setSelectedQuestion(null);
// //     }
// //   };

// //   // Add option to a question
// //   const addOption = (sectionId, questionId) => {
// //     setSections(sections.map(section => {
// //       if (section.id === sectionId) {
// //         return {
// //           ...section,
// //           questions: section.questions.map(q => {
// //             if (q.id === questionId) {
// //               return {
// //                 ...q,
// //                 options: [...q.options, `Option ${q.options.length + 1}`]
// //               };
// //             }
// //             return q;
// //           })
// //         };
// //       }
// //       return section;
// //     }));
// //   };

// //   const handleFormLaunch = async () => {
// //     try {
// //       // Validate form fields
// //       if (!formTitle.trim()) {
// //         alert('Please enter a form title');
// //         return;
// //       }
  
// //       if (!programId) {
// //         alert('Invalid program ID. Please check and try again.');
// //         return;
// //       }
  
// //       if (sections.length === 0) {
// //         alert('Please add at least one section to the form');
// //         return;
// //       }
  
// //       // Construct the simplified form data structure without IDs
// //       const formData = {
// //         title: formTitle,
// //         description: formDescription || "", 
// //         sections: sections.map(section => ({
// //           title: section.title,
// //           description: section.description || "",
// //           questions: section.questions.map(q => ({
// //             type: q.type,
// //             title: q.title,
// //             description: q.description || "",
// //             required: q.required || false,
// //             options: q.options || [], // Only included for multiple choice/checkbox questions
// //           })),
// //         })),
// //         createdAt: serverTimestamp(),
// //         programId,
// //       };
  
// //       // Reference to the "programmes" collection and query by program ID
// //       const programmesRef = collection(db, "programmes");
// //       const q = query(programmesRef, where("id", "==", programId));
// //       const querySnapshot = await getDocs(q);
  
// //       if (querySnapshot.empty) {
// //         alert('No matching program found. Please check the program ID.');
// //         return;
// //       }
  
// //       const docRef = querySnapshot.docs[0].ref;
  
// //       // Add the simplified form to the "form" subcollection
// //       const formRef = await addDoc(collection(docRef, "form"), formData);
  
// //       console.log("Form successfully created with ID:", formRef.id);
// //       alert('Form successfully launched!');
// //     } catch (error) {
// //       console.error("Error creating form:", error.message || error);
// //       alert('Failed to launch form. Please try again.');
// //     }
// //   };
// //   const QuestionCard = ({ section, question, isReview = false }) => {
// //     const isSelected = selectedQuestion === question.id;

// //     if (isReview) {
// //       return (
// //         <Card className="mb-4">
// //           <CardContent>
// //             <div className="space-y-4">
// //               <h3 className="text-lg font-medium">{question.title}</h3>
// //               {question.type === 'multipleChoice' || question.type === 'checkbox' ? (
// //                 <div className="space-y-2 pl-4">
// //                   {question.options.map((option, index) => (
// //                     <div key={index} className="flex items-center gap-2">
// //                       {question.type === 'multipleChoice' ? (
// //                         <Circle className="w-4 h-4" />
// //                       ) : (
// //                         <CheckSquare className="w-4 h-4" />
// //                       )}
// //                       <span>{option}</span>
// //                     </div>
// //                   ))}
// //                 </div>
// //               ) : (
// //                 <div className="text-gray-500 italic">
// //                   {question.type === 'shortText' && 'Short answer text field'}
// //                   {question.type === 'longText' && 'Long answer text field'}
// //                   {question.type === 'date' && 'Date picker'}
// //                   {question.type === 'time' && 'Time picker'}
// //                   {question.type === 'fileUpload' && 'File upload field'}
// //                   {question.type === 'rating' && 'Rating selector'}
// //                 </div>
// //               )}
// //             </div>
// //           </CardContent>
// //         </Card>
// //       );
// //     }

// //     return (
// //       <Card className={`mb-4 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
// //         <CardContent>
// //           <div className="flex items-start gap-4">
// //             <div className="cursor-move text-gray-400">
// //               <GripVertical className="w-6 h-6" />
// //             </div>
// //             <div className="flex-1">
// //               <input
// //                 type="text"
// //                 value={question.title}
// //                 onChange={(e) => updateQuestion(section.id, question.id, { title: e.target.value })}
// //                 className="w-full text-lg font-medium mb-2 border-none focus:outline-none focus:ring-0"
// //                 placeholder="Question"
// //               />
// //               {question.type === 'multipleChoice' || question.type === 'checkbox' ? (
// //                 <div className="space-y-2">
// //                   {question.options.map((option, index) => (
// //                     <div key={index} className="flex items-center gap-2">
// //                       {question.type === 'multipleChoice' ? (
// //                         <Circle className="w-4 h-4" />
// //                       ) : (
// //                         <CheckSquare className="w-4 h-4" />
// //                       )}
// //                       <input
// //                         type="text"
// //                         value={option}
// //                         onChange={(e) => {
// //                           const newOptions = [...question.options];
// //                           newOptions[index] = e.target.value;
// //                           updateQuestion(section.id, question.id, { options: newOptions });
// //                         }}
// //                         className="flex-1 border-none focus:outline-none focus:ring-0"
// //                         placeholder={`Option ${index + 1}`}
// //                       />
// //                       <button
// //                         onClick={() => {
// //                           const newOptions = question.options.filter((_, i) => i !== index);
// //                           updateQuestion(section.id, question.id, { options: newOptions });
// //                         }}
// //                         className="text-gray-400 hover:text-gray-600"
// //                       >
// //                         <Trash2 className="w-4 h-4" />
// //                       </button>
// //                     </div>
// //                   ))}
// //                   <button
// //                     onClick={() => addOption(section.id, question.id)}
// //                     className="text-blue-600 text-sm flex items-center gap-1 mt-2"
// //                   >
// //                     <Plus className="w-4 h-4" /> Add Option
// //                   </button>
// //                 </div>
// //               ) : (
// //                 <div className="text-gray-400 text-sm">
// //                   {question.type === 'shortText' && 'Short answer text'}
// //                   {question.type === 'longText' && 'Long answer text'}
// //                   {question.type === 'date' && 'Date'}
// //                   {question.type === 'time' && 'Time'}
// //                   {question.type === 'fileUpload' && 'File upload'}
// //                   {question.type === 'rating' && 'Rating'}
// //                 </div>
// //               )}
// //             </div>
// //             <div className="flex items-center gap-2">
// //               <button
// //                 onClick={() => {
// //                   const questionCopy = {...question};
// //                   questionCopy.id = Date.now();
// //                   updateSection(section.id, {
// //                     questions: [...section.questions, questionCopy]
// //                   });
// //                 }}
// //                 className="p-2 hover:bg-gray-100 rounded-md"
// //               >
// //                 <Copy className="w-4 h-4" />
// //               </button>
// //               <button
// //                 onClick={() => deleteQuestion(section.id, question.id)}
// //                 className="p-2 hover:bg-gray-100 rounded-md"
// //               >
// //                 <Trash2 className="w-4 h-4" />
// //               </button>
// //               <button
// //                 onClick={() => setSelectedQuestion(isSelected ? null : question.id)}
// //                 className="p-2 hover:bg-gray-100 rounded-md"
// //               >
// //                 <Settings className="w-4 h-4" />
// //               </button>
// //             </div>
// //           </div>
// //         </CardContent>
// //       </Card>
// //     );
// //   };

// //   const SectionCard = ({ section, isReview = false }) => (
// //     <Card className="mb-6">
// //       <CardContent>
// //         {!isReview && (
// //           <div className="flex justify-between mb-4">
// //             <input
// //               type="text"
// //               value={section.title}
              
// //               onChange={(e) => updateSection(section.id, { title: e.target.value })}
// //               className="text-xl font-semibold border-none focus:outline-none focus:ring-0"
// //               placeholder="Section Title(if any)"
// //             />
// //             <button
// //               onClick={() => deleteSection(section.id)}
// //               className="text-gray-400 hover:text-gray-600"
// //             >
// //               <Trash2 className="w-4 h-4" />
// //             </button>
// //           </div>
// //         )}
// //         {isReview && (
// //           <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
// //         )}
// //         {section.questions.map(question => (
// //           <QuestionCard 
// //             key={question.id} 
// //             section={section}
// //             question={question} 
// //             isReview={isReview} 
// //           />
// //         ))}
// //         {!isReview && (
// //           <div className="mt-4">
// //             {/* <div className="grid grid-cols-4 gap-2">
// //               {questionTypes.map(type => (
// //                 <button
// //                   key={type.id}
// //                   onClick={() => addQuestion(section.id, type.id)}
// //                   className="p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md flex flex-col items-center gap-1"
// //                 >
// //                   {type.icon}
// //                   <span>{type.label}</span>
// //                 </button>
// //               ))}
// //             </div> */}
// //           </div>
// //         )}
// //       </CardContent>
// //     </Card>
// //   );

// //   const ReviewSection = () => (
// //     <div className="flex-1 p-6 bg-gray-50">
// //       <div className="max-w-3xl mx-auto">
// //         <Card className="mb-6">
// //           <CardContent>
// //             <h2 className="text-2xl font-semibold mb-2">{formTitle}</h2>
// //             <p className="text-gray-600">{formDescription}</p>
// //           </CardContent>
// //         </Card>
        
// //         {sections.map(section => (
// //           <SectionCard key={section.id} section={section} isReview={true} />
// //         ))}
// //       </div>
// //     </div>
// //   );

// //   return (
// //     <div className="flex flex-col h-full">
// //       <AddSectionModal />
// //       <div className="flex-1">
// //         {currentStep === 'edit' ? (
// //           <div className="p-6 bg-gray-50">
// //             <div className="max-w-3xl mx-auto">
// //               <RegistrationInfo />
              
// //               {sections.map(section => (
// //                 <SectionCard key={section.id} section={section} />
// //               ))}

// //               <div className="bg-gray-50 p-4 rounded-lg">
// //                 <div className="flex items-center gap-2 mb-4">
// //                   <span className="bg-orange-100 p-2 rounded-lg">
// //                     <HelpCircle className="w-5 h-5 text-orange-500" />
// //                   </span>
// //                   <h2 className="text-xl font-semibold">Custom Section of Questions</h2>
// //                 </div>
                
// //                 <button
// //                   onClick={() => setIsModalOpen(true)}
// //                   className="inline-flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
// //                 >
// //                   <Plus className="w-4 h-4" />
// //                   Add Section
// //                 </button>
// //               </div>
// //             </div>
// //           </div>
// //         ) : (
// //           <ReviewSection />
// //         )}
// //       </div>
    
// //           {/* Footer with navigation buttons */}
// //           <div className="border-t border-gray-200 p-4 bg-white">
// //             <div className="max-w-3xl mx-auto flex justify-between">
// //               {currentStep === 'review' && (
// //                 <button
// //                   onClick={() => setCurrentStep('edit')}
// //                   className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
// //                 >
// //                   <ArrowLeft className="w-4 h-4" /> Back to Edit
// //                 </button>
// //               )}
// //               <div className="ml-auto">
// //                 {currentStep === 'edit' ? (
// //                   <button
// //                     onClick={() => setCurrentStep('3')}
// //                     className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
// //                   >
// //                     Review & Launch <ArrowRight className="w-4 h-4" />
// //                   </button>
// //                 ) : (
// //                   <button
// //                     onClick={handleFormLaunch}
// //                     className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
// //                   >
// //                     Launch Form <ArrowRight className="w-4 h-4" />
// //                   </button>
// //                 )}
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       );
// //     };
    
// //     export default FormBuilder;


// import {
//   AlignLeft,
//   ArrowLeft,
//   ArrowRight,
//   Calendar,
//   CheckSquare,
//   Circle,
//   Clock,
//   Copy,
//   GripVertical,
//   HelpCircle,
//   Plus,
//   Settings,
//   Star,
//   Trash2,
//   Type,
//   Upload,
//   X
// } from 'lucide-react';
// import React, { useState } from 'react';
// import { v4 as uuidv4 } from 'uuid';
// import { addDoc, collection, db, serverTimestamp } from '../firebase';
// import RegistrationInfo from './ri';
// const Card = ({ children, className = '' }) => (
//   <div className={`bg-white rounded-lg shadow ${className}`}>
//     {children}
//   </div>
// );

// const CardContent = ({ children, className = '' }) => (
//   <div className={`p-4 ${className}`}>
//     {children}
//   </div>
// );

// const questionTypes = [
//   { id: 'shortText', icon: <Type className="w-4 h-4" />, label: 'Short Text' },
//   { id: 'longText', icon: <AlignLeft className="w-4 h-4" />, label: 'Long Text' },
//   { id: 'multipleChoice', icon: <Circle className="w-4 h-4" />, label: 'Multiple Choice' },
//   { id: 'checkbox', icon: <CheckSquare className="w-4 h-4" />, label: 'Checkboxes' },
//   { id: 'date', icon: <Calendar className="w-4 h-4" />, label: 'Date' },
//   { id: 'time', icon: <Clock className="w-4 h-4" />, label: 'Time' },
//   { id: 'fileUpload', icon: <Upload className="w-4 h-4" />, label: 'File Upload' },
//   { id: 'rating', icon: <Star className="w-4 h-4" />, label: 'Rating' }
// ];

// const FormBuilder = ({ programId }) => {
//   const [formTitle, setFormTitle] = useState('Registration Questions');
//   const [formDescription, setFormDescription] = useState('We will ask guests the following questions when they register for the event.');
//   const [sections, setSections] = useState([]);
//   const [selectedQuestion, setSelectedQuestion] = useState(null);
//   const [currentStep, setCurrentStep] = useState('edit');
//   const [selectedSection, setSelectedSection] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [newSectionTitle, setNewSectionTitle] = useState('');
//   const [newSectionDescription, setNewSectionDescription] = useState('');
//   const [modalQuestions, setModalQuestions] = useState([]);
//   const [selectedModalQuestion, setSelectedModalQuestion] = useState(null);

//   const resetModalState = () => {
//     setNewSectionTitle('');
//     setNewSectionDescription('');
//     setModalQuestions([]);
//     setSelectedModalQuestion(null);
//   };

//   // Modified handleAddSection to include questions
//   const handleAddSection = () => {
//     const newSection = {
//       id: Date.now(),
//       title: newSectionTitle,
//       description: newSectionDescription,
//       questions: modalQuestions
//     };
//     setSections([...sections, newSection]);
//     setIsModalOpen(false);
//     resetModalState();
//   };

//   // Add question within modal
//   const addModalQuestion = (type) => {
//     const newQuestion = {
//       id: Date.now(),
//       type,
//       title: 'Question',
//       description: '',
//       required: false,
//       options: type === 'multipleChoice' || type === 'checkbox' ? ['Option 1'] : [],
//     };
//     setModalQuestions([...modalQuestions, newQuestion]);
//     setSelectedModalQuestion(newQuestion.id);
//   };

//   // Update question within modal
//   const updateModalQuestion = (questionId, updates) => {
//     setModalQuestions(modalQuestions.map(q =>
//       q.id === questionId ? { ...q, ...updates } : q
//     ));
//   };

//   // Delete question within modal
//   const deleteModalQuestion = (questionId) => {
//     setModalQuestions(modalQuestions.filter(q => q.id !== questionId));
//     if (selectedModalQuestion === questionId) {
//       setSelectedModalQuestion(null);
//     }
//   };

//   // Add option to a question within modal
//   const addModalOption = (questionId) => {
//     setModalQuestions(modalQuestions.map(q => {
//       if (q.id === questionId) {
//         return {
//           ...q,
//           options: [...q.options, `Option ${q.options.length + 1}`]
//         };
//       }
//       return q;
//     }));
//   };

//   // Modal Question Card component
//   const ModalQuestionCard = ({ question }) => {
//     const isSelected = selectedModalQuestion === question.id;

//     return (
//       <div className={`bg-white rounded-lg shadow mb-4 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
//         <div className="p-4">
//           <div className="flex items-start gap-4">
//             <div className="cursor-move text-gray-400">
//               <GripVertical className="w-6 h-6" />
//             </div>
//             <div className="flex-1">
//               <input
//                 type="text"
//                 value={question.title}
//                 onChange={(e) => updateModalQuestion(question.id, { title: e.target.value })}
//                 className="w-full text-lg font-medium mb-2 border-none focus:outline-none focus:ring-0"
//                 placeholder="Question"
//               />
//               {(question.type === 'multipleChoice' || question.type === 'checkbox') && (
//                 <div className="space-y-2">
//                   {question.options.map((option, index) => (
//                     <div key={index} className="flex items-center gap-2">
//                       {question.type === 'multipleChoice' ? (
//                         <Circle className="w-4 h-4" />
//                       ) : (
//                         <CheckSquare className="w-4 h-4" />
//                       )}
//                       <input
//                         type="text"
//                         value={option}
//                         onChange={(e) => {
//                           const newOptions = [...question.options];
//                           newOptions[index] = e.target.value;
//                           updateModalQuestion(question.id, { options: newOptions });
//                         }}
//                         className="flex-1 border-none focus:outline-none focus:ring-0"
//                         placeholder={`Option ${index + 1}`}
//                       />
//                       <button
//                         onClick={() => {
//                           const newOptions = question.options.filter((_, i) => i !== index);
//                           updateModalQuestion(question.id, { options: newOptions });
//                         }}
//                         className="text-gray-400 hover:text-gray-600"
//                       >
//                         <Trash2 className="w-4 h-4" />
//                       </button>
//                     </div>
//                   ))}
//                   <button
//                     onClick={() => addModalOption(question.id)}
//                     className="text-blue-600 text-sm flex items-center gap-1 mt-2"
//                   >
//                     <Plus className="w-4 h-4" /> Add Option
//                   </button>
//                 </div>
//               )}
//             </div>
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => deleteModalQuestion(question.id)}
//                 className="p-2 hover:bg-gray-100 rounded-md"
//               >
//                 <Trash2 className="w-4 h-4" />
//               </button>
//               <button
//                 onClick={() => setSelectedModalQuestion(isSelected ? null : question.id)}
//                 className="p-2 hover:bg-gray-100 rounded-md"
//               >
//                 <Settings className="w-4 h-4" />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Enhanced Modal component
//   const AddSectionModal = () => {
//     const [showQuestionTypes, setShowQuestionTypes] = useState(false);
  
//     if (!isModalOpen) return null;
  
//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//         <div className="absolute bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col left-[500px] top-[200px]">
//           <div className="p-6 border-b">
//             <div className="flex justify-between items-center">
//               <h2 className="text-xl font-semibold">Add Questions</h2>
//               <button
//                 onClick={() => {
//                   setIsModalOpen(false);
//                   resetModalState();
//                   setShowQuestionTypes(false);
//                 }}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>
//           </div>
          
//           <div className="p-6 flex-1 overflow-y-auto">
//             <div className="space-y-6">
           
//               <div>
//                 <h3 className="text-lg font-medium mb-4">Questions</h3>
//                 {modalQuestions.map(question => (
//                   <ModalQuestionCard key={question.id} question={question} />
//                 ))}
                
//                 {!showQuestionTypes ? (
//                   <button
//                     onClick={() => setShowQuestionTypes(true)}
//                     className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 flex items-center justify-center gap-2"
//                   >
//                     <Plus className="w-5 h-5" />
//                     Add Question
//                   </button>
//                 ) : (
//                   <div className="grid grid-cols-4 gap-2 mt-4">
//                     {questionTypes.map(type => (
//                       <button
//                         key={type.id}
//                         onClick={() => {
//                           addModalQuestion(type.id);
//                           setShowQuestionTypes(false);
//                         }}
//                         className="p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md flex flex-col items-center gap-1"
//                       >
//                         {type.icon}
//                         <span>{type.label}</span>
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
  
//           <div className="p-6 border-t bg-gray-50">
//             <div className="flex justify-end gap-3">
//               <button
//                 onClick={() => {
//                   setIsModalOpen(false);
//                   resetModalState();
//                   setShowQuestionTypes(false);
//                 }}
//                 className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={() => {
//                   handleAddSection();
//                   setShowQuestionTypes(false);
//                 }}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//                 disabled={!modalQuestions.length}
//               >
//                 Add Questions
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };
  

//   // Add a new section
//   const addSection = () => {
//     const newSection = {
//       id: Date.now(),
//       title: '',
//       description: '',
//       questions: []
//     };
//     setSections([...sections, newSection]);
//   };


//   // const handleAddSection = () => {
//   //   const newSection = {
//   //     id: Date.now(),
//   //     title: '',
//   //     description: '',
//   //     questions: []
//   //   };
//   //   setSections([...sections, newSection]);
//   //   setIsModalOpen(false);
//   // };
//   // Update section details
//   const updateSection = (sectionId, updates) => {
//     setSections(sections.map(section =>
//       section.id === sectionId ? { ...section, ...updates } : section
//     ));
//   };

//   // Delete section
//   const deleteSection = (sectionId) => {
//     setSections(sections.filter(section => section.id !== sectionId));
//   };

//   // Add question to a specific section
//   const addQuestion = (sectionId, type) => {
//     const newQuestion = {
//       id: Date.now(),
//       type,
//       title: 'Question',
//       description: '',
//       required: false,
//       options: type === 'multipleChoice' || type === 'checkbox' ? ['Option 1'] : [],
//     };
    
//     setSections(sections.map(section => {
//       if (section.id === sectionId) {
//         return {
//           ...section,
//           questions: [...section.questions, newQuestion]
//         };
//       }
//       return section;
//     }));
//     setSelectedQuestion(newQuestion.id);
//     setSelectedSection(sectionId);
//   };

//   // Update question within a section
//   const updateQuestion = (sectionId, questionId, updates) => {
//     setSections(sections.map(section => {
//       if (section.id === sectionId) {
//         return {
//           ...section,
//           questions: section.questions.map(q =>
//             q.id === questionId ? { ...q, ...updates } : q
//           )
//         };
//       }
//       return section;
//     }));
//   };

//   // Delete question from a section
//   const deleteQuestion = (sectionId, questionId) => {
//     setSections(sections.map(section => {
//       if (section.id === sectionId) {
//         return {
//           ...section,
//           questions: section.questions.filter(q => q.id !== questionId)
//         };
//       }
//       return section;
//     }));
//     if (selectedQuestion === questionId) {
//       setSelectedQuestion(null);
//     }
//   };

//   // Add option to a question
//   const addOption = (sectionId, questionId) => {
//     setSections(sections.map(section => {
//       if (section.id === sectionId) {
//         return {
//           ...section,
//           questions: section.questions.map(q => {
//             if (q.id === questionId) {
//               return {
//                 ...q,
//                 options: [...q.options, `Option ${q.options.length + 1}`]
//               };
//             }
//             return q;
//           })
//         };
//       }
//       return section;
//     }));
//   };

//   const handleFormLaunch = async () => {
//     try {
//       // Generate a random programme ID if not provided
//       const currentProgramId = programId || uuidv4();
  
//       // Validate form fields
//       if (!formTitle.trim()) {
//         alert('Please enter a form title');
//         return;
//       }
  
//       if (!sections.length) {
//         alert('Please add at least one section with questions');
//         return;
//       }
  
//       // Validate each section has required fields
//       for (const section of sections) {
//         if (!section.title.trim()) {
//           alert('All sections must have a title');
//           return;
//         }
//         if (!section.questions || section.questions.length === 0) {
//           // alert(Section "${section.title}" must have at least one question);
//           return;
//         }
//       }
  
//       // Create the form document in Firestore
//       const formData = {
//         title: formTitle,
//         description: formDescription,
//         createdAt: serverTimestamp(),
//         programmeId: currentProgramId, // Use the generated or provided ID
//         sections: sections.map(section => ({
//           title: section.title,
//           description: section.description || '',
//           questions: section.questions.map(question => ({
//             type: question.type,
//             title: question.title,
//             description: question.description || '',
//             required: question.required || false,
//             options: question.options || [],
//           }))
//         }))
//       };
  
//       // Add the form directly to Firestore without checking for an existing programme
//       const formRef = collection(db, 'forms');
//       const docRef = await addDoc(formRef, formData);
  
//       console.log('Form created successfully with ID:', docRef.id);
//       alert('Form has been successfully created!');
  
//       // Optional: Redirect to a success page or reset the form
//       setCurrentStep('edit');
//       setSections([]);
//       setFormTitle('');
//       setFormDescription('');
  
//     } catch (error) {
//       console.error('Error creating form:', error);
//       // alert(Failed to create form: ${error.message});
//     }
//   };
  
//   // Helper function to validate questions
//   const validateQuestion = (question) => {
//     if (!question.title.trim()) {
//       throw new Error('All questions must have a title');
//     }
    
//     if (question.type === 'multipleChoice' || question.type === 'checkbox') {
//       if (!question.options || question.options.length < 2) {
//         throw new Error(`Question "${question.title}" must have at least 2 options`);
//       }
      
//       for (const option of question.options) {
//         if (!option.trim()) {
//           throw new Error(`All options in question "${question.title}" must have content`);
//         }
//       }
//     }
//   };
//   const QuestionCard = ({ section, question, isReview = false }) => {
//     const isSelected = selectedQuestion === question.id;

//     if (isReview) {
//       return (
//         <Card className="mb-4">
//           <CardContent>
//             <div className="space-y-4">
//               <h3 className="text-lg font-medium">{question.title}</h3>
//               {question.type === 'multipleChoice' || question.type === 'checkbox' ? (
//                 <div className="space-y-2 pl-4">
//                   {question.options.map((option, index) => (
//                     <div key={index} className="flex items-center gap-2">
//                       {question.type === 'multipleChoice' ? (
//                         <Circle className="w-4 h-4" />
//                       ) : (
//                         <CheckSquare className="w-4 h-4" />
//                       )}
//                       <span>{option}</span>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="text-gray-500 italic">
//                   {question.type === 'shortText' && 'Short answer text field'}
//                   {question.type === 'longText' && 'Long answer text field'}
//                   {question.type === 'date' && 'Date picker'}
//                   {question.type === 'time' && 'Time picker'}
//                   {question.type === 'fileUpload' && 'File upload field'}
//                   {question.type === 'rating' && 'Rating selector'}
//                 </div>
//               )}
//             </div>
//           </CardContent>
//         </Card>
//       );
//     }

//     return (
//       <Card className={`mb-4 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
//         <CardContent>
//           <div className="flex items-start gap-4">
//             <div className="cursor-move text-gray-400">
//               <GripVertical className="w-6 h-6" />
//             </div>
//             <div className="flex-1">
//               <input
//                 type="text"
//                 value={question.title}
//                 onChange={(e) => updateQuestion(section.id, question.id, { title: e.target.value })}
//                 className="w-full text-lg font-medium mb-2 border-none focus:outline-none focus:ring-0"
//                 placeholder="Question"
//               />
//               {question.type === 'multipleChoice' || question.type === 'checkbox' ? (
//                 <div className="space-y-2">
//                   {question.options.map((option, index) => (
//                     <div key={index} className="flex items-center gap-2">
//                       {question.type === 'multipleChoice' ? (
//                         <Circle className="w-4 h-4" />
//                       ) : (
//                         <CheckSquare className="w-4 h-4" />
//                       )}
//                       <input
//                         type="text"
//                         value={option}
//                         onChange={(e) => {
//                           const newOptions = [...question.options];
//                           newOptions[index] = e.target.value;
//                           updateQuestion(section.id, question.id, { options: newOptions });
//                         }}
//                         className="flex-1 border-none focus:outline-none focus:ring-0"
//                         placeholder={`Option ${index + 1}`}
//                       />
//                       <button
//                         onClick={() => {
//                           const newOptions = question.options.filter((_, i) => i !== index);
//                           updateQuestion(section.id, question.id, { options: newOptions });
//                         }}
//                         className="text-gray-400 hover:text-gray-600"
//                       >
//                         <Trash2 className="w-4 h-4" />
//                       </button>
//                     </div>
//                   ))}
//                   <button
//                     onClick={() => addOption(section.id, question.id)}
//                     className="text-blue-600 text-sm flex items-center gap-1 mt-2"
//                   >
//                     <Plus className="w-4 h-4" /> Add Option
//                   </button>
//                 </div>
//               ) : (
//                 <div className="text-gray-400 text-sm">
//                   {question.type === 'shortText' && 'Short answer text'}
//                   {question.type === 'longText' && 'Long answer text'}
//                   {question.type === 'date' && 'Date'}
//                   {question.type === 'time' && 'Time'}
//                   {question.type === 'fileUpload' && 'File upload'}
//                   {question.type === 'rating' && 'Rating'}
//                 </div>
//               )}
//             </div>
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => {
//                   const questionCopy = {...question};
//                   questionCopy.id = Date.now();
//                   updateSection(section.id, {
//                     questions: [...section.questions, questionCopy]
//                   });
//                 }}
//                 className="p-2 hover:bg-gray-100 rounded-md"
//               >
//                 <Copy className="w-4 h-4" />
//               </button>
//               <button
//                 onClick={() => deleteQuestion(section.id, question.id)}
//                 className="p-2 hover:bg-gray-100 rounded-md"
//               >
//                 <Trash2 className="w-4 h-4" />
//               </button>
//               <button
//                 onClick={() => setSelectedQuestion(isSelected ? null : question.id)}
//                 className="p-2 hover:bg-gray-100 rounded-md"
//               >
//                 <Settings className="w-4 h-4" />
//               </button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   };

//   const SectionCard = ({ section, isReview = false }) => (
//     <Card className="mb-6">
//       <CardContent>
//         {!isReview && (
//           <div className="flex justify-between mb-4">
//             <input
//               type="text"
//               value={section.title}
              
//               onChange={(e) => updateSection(section.id, { title: e.target.value })}
//               className="text-xl font-semibold border-none focus:outline-none focus:ring-0"
//               placeholder="Section Title(if any)"
//             />
//             <button
//               onClick={() => deleteSection(section.id)}
//               className="text-gray-400 hover:text-gray-600"
//             >
//               <Trash2 className="w-4 h-4" />
//             </button>
//           </div>
//         )}
//         {isReview && (
//           <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
//         )}
//         {section.questions.map(question => (
//           <QuestionCard 
//             key={question.id} 
//             section={section}
//             question={question} 
//             isReview={isReview} 
//           />
//         ))}
//         {!isReview && (
//           <div className="mt-4">
//             {/* <div className="grid grid-cols-4 gap-2">
//               {questionTypes.map(type => (
//                 <button
//                   key={type.id}
//                   onClick={() => addQuestion(section.id, type.id)}
//                   className="p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md flex flex-col items-center gap-1"
//                 >
//                   {type.icon}
//                   <span>{type.label}</span>
//                 </button>
//               ))}
//             </div> */}
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );

//   const ReviewSection = () => (
//     <div className="flex-1 p-6 bg-gray-50">
//       <div className="max-w-3xl mx-auto">
//         <Card className="mb-6">
//           <CardContent>
//             <h2 className="text-2xl font-semibold mb-2">{formTitle}</h2>
//             <p className="text-gray-600">{formDescription}</p>
//           </CardContent>
//         </Card>
        
//         {sections.map(section => (
//           <SectionCard key={section.id} section={section} isReview={true} />
//         ))}
//       </div>
//     </div>
//   );

//   return (
//     <div className="flex flex-col h-full">
//       <AddSectionModal />
//       <div className="flex-1">
//         {currentStep === 'edit' ? (
//           <div className="p-6 bg-gray-50">
//             <div className="max-w-3xl mx-auto">
//               <RegistrationInfo />
              
//               {sections.map(section => (
//                 <SectionCard key={section.id} section={section} />
//               ))}

//               <div className="bg-gray-50 p-4 rounded-lg">
//                 <div className="flex items-center gap-2 mb-4">
//                   <span className="bg-orange-100 p-2 rounded-lg">
//                     <HelpCircle className="w-5 h-5 text-orange-500" />
//                   </span>
//                   <h2 className="text-xl font-semibold">Custom Section of Questions</h2>
//                 </div>
                
//                 <button
//                   onClick={() => setIsModalOpen(true)}
//                   className="inline-flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
//                 >
//                   <Plus className="w-4 h-4" />
//                   Add Questions
//                 </button>
//               </div>
//             </div>
//           </div>
//         ) : (
//           <ReviewSection />
//         )}
//       </div>
    
//           {/* Footer with navigation buttons */}
//           <div className="border-t border-gray-200 p-4 bg-white">
//             <div className="max-w-3xl mx-auto flex justify-between">
//               {currentStep === 'review' && (
//                 <button
//                   onClick={() => setCurrentStep('edit')}
//                   className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
//                 >
//                   <ArrowLeft className="w-4 h-4" /> Back to Edit
//                 </button>
//               )}
//               <div className="ml-auto">
//                 {currentStep === 'edit' ? (
//                   <button
//                     onClick={() => setCurrentStep('3')}
//                     className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//                   >
//                     Review & Launch <ArrowRight className="w-4 h-4" />
//                   </button>
//                 ) : (
//                   <button
//                     onClick={handleFormLaunch}
//                     className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
//                   >
//                     Launch Form <ArrowRight className="w-4 h-4" />
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       );
//     };
    
//     export default FormBuilder;


import {
  AlignLeft,
  ArrowLeft,
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
import { useNavigate } from 'react-router-dom';
import React, { useState,useEffect } from 'react';
import { getDoc } from 'firebase/firestore'; 
import { addDoc, collection, db, getDocs,doc, query,writeBatch, serverTimestamp, where } from '../firebase';
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

const FormBuilder = ({ programId }) => {
  const [formTitle, setFormTitle] = useState('Registration Questions');
  const [formDescription, setFormDescription] = useState('We will ask guests the following questions when they register for the event.');
  const [sections, setSections] = useState([]);
  const [programmeDetails, setProgrammeDetails] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [currentStep, setCurrentStep] = useState(3); 
  const [selectedSection, setSelectedSection] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionDescription, setNewSectionDescription] = useState('');
  const [modalQuestions, setModalQuestions] = useState([]);
  const [selectedModalQuestion, setSelectedModalQuestion] = useState(null);
  const navigate = useNavigate();
  const resetModalState = () => {
    setNewSectionTitle('');
    setNewSectionDescription('');
    setModalQuestions([]);
    setSelectedModalQuestion(null);
  };

  // Modified handleAddSection to include questions
  const handleAddSection = () => {
    const newSection = {
      id: Date.now(),
      title: newSectionTitle,
      description: newSectionDescription,
      questions: modalQuestions
    };
    setSections([...sections, newSection]);
    setIsModalOpen(false);
    resetModalState();
  };

  // Add question within modal
  const addModalQuestion = (type) => {
    const newQuestion = {
      id: Date.now(),
      type,
      title: 'Question',
      description: '',
      required: false,
      options: type === 'multipleChoice' || type === 'checkbox' ? ['Option 1'] : [],
    };
    setModalQuestions([...modalQuestions, newQuestion]);
    setSelectedModalQuestion(newQuestion.id);
  };

  // Update question within modal
  const updateModalQuestion = (questionId, updates) => {
    setModalQuestions(modalQuestions.map(q =>
      q.id === questionId ? { ...q, ...updates } : q
    ));
  };

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
  const ModalQuestionCard = ({ question }) => {
    const isSelected = selectedModalQuestion === question.id;

    return (
      <div className={`bg-white rounded-lg shadow mb-4 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
        <div className="p-4">
          <div className="flex items-start gap-4">
            <div className="cursor-move text-gray-400">
              <GripVertical className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={question.title}
                onChange={(e) => updateModalQuestion(question.id, { title: e.target.value })}
                className="w-full text-lg font-medium mb-2 border-none focus:outline-none focus:ring-0"
                placeholder="Question"
              />
              {(question.type === 'multipleChoice' || question.type === 'checkbox') && (
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
                          updateModalQuestion(question.id, { options: newOptions });
                        }}
                        className="flex-1 border-none focus:outline-none focus:ring-0"
                        placeholder={`Option ${index + 1}`}
                      />
                      <button
                        onClick={() => {
                          const newOptions = question.options.filter((_, i) => i !== index);
                          updateModalQuestion(question.id, { options: newOptions });
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addModalOption(question.id)}
                    className="text-blue-600 text-sm flex items-center gap-1 mt-2"
                  >
                    <Plus className="w-4 h-4" /> Add Option
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => deleteModalQuestion(question.id)}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
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
    const [showQuestionTypes, setShowQuestionTypes] = useState(false);
  
    if (!isModalOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Add New Question</h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetModalState();
                  setShowQuestionTypes(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
  
          {/* Main Section */}
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="space-y-6">
              <div>
                {/* Questions Section */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Questions</h3>
  
                  {/* Add Custom Question Button */}
                  <button
                    onClick={() => setShowQuestionTypes(true)}
                    className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 flex items-center justify-center gap-2 mb-4"
                  >
                    <Plus className="w-5 h-5" />
                    Add Custom Question
                  </button>
  
                  {/* User-Added Questions */}
                  {modalQuestions.length > 0 && (
                    <div>
                      {modalQuestions.map((question) => (
                        <ModalQuestionCard key={question.id} question={question} />
                      ))}
                    </div>
                  )}
  
                  {/* Question Types (if toggled) */}
                  {showQuestionTypes && (
                    <div className="grid grid-cols-4 gap-2 mt-4">
                      {questionTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => {
                            addModalQuestion(type.id);
                            setShowQuestionTypes(false);
                          }}
                          className="p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md flex flex-col items-center gap-1"
                        >
                          {type.icon}
                          <span>{type.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
  
          <div className="p-6 border-t bg-gray-50">
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetModalState();
                  setShowQuestionTypes(false);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleAddSection();
                  setShowQuestionTypes(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={!modalQuestions.length}
              >
                Add Question
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

  // You'll need to install this package first

  

  const handleFormLaunch = async () => {
    console.log('Programme ID:', programId);
  
    if (!programId) {
      console.error('No programme ID found');
      alert('Please create an event first');
      return;
    }
  
    try {
      // Prepare form data - only collect questions, removing section-specific details
      const formData = {
        title: formTitle,
        description: formDescription,
        updatedAt: serverTimestamp(),
        questions: sections.flatMap(section => 
          section.questions.map(question => ({
            type: question.type,
            title: question.title,
            description: question.description || '',
            required: question.required || false,
            options: question.options || [],
          }))
        )
      };
  
      // Rest of the function remains the same...
      const programmeRef = doc(db, 'programmes', programId);
      
      const formRef = collection(programmeRef, 'form');
      
      const existingFormsQuery = query(formRef);
      const existingFormsDocs = await getDocs(existingFormsQuery);
      
      const batch = writeBatch(db);
      existingFormsDocs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      const newFormRef = doc(formRef);
      batch.set(newFormRef, formData);
      
      await batch.commit();
  
      console.log('Form updated successfully');
      alert('Form has been successfully updated!');
  
    } catch (error) {
      console.error('Error updating form:', error);
      alert(`Failed to update form: ${error.message}`);
    }
  };
  const handleReviewAndNext = async () => {
    try {
      // Fetch the programme details using programId
      const programmeRef = doc(db, 'programmes', programId);
      const programmeDoc = await getDoc(programmeRef);
      
      if (programmeDoc.exists()) {
        const programmeData = programmeDoc.data();
        
        // Set the programme details in state or pass them to review section
        setProgrammeDetails(programmeData);
        
        // Move to review step
        setCurrentStep('review');
      } else {
        console.error('No such programme found');
        alert('Could not retrieve event details');
      }
    } catch (error) {
      console.error('Error fetching programme details:', error);
      alert(`Failed to fetch event details: ${error.message}`);
    }
  };
  // Helper function to validate questions
  const validateQuestion = (question) => {
    if (!question.title.trim()) {
      throw new Error('All questions must have a title');
    }
    
    if (question.type === 'multipleChoice' || question.type === 'checkbox') {
      if (!question.options || question.options.length < 2) {
        throw new Error(`Question "${question.title}" must have at least 2 options`);
      }
      
      for (const option of question.options) {
        if (!option.trim()) {
          throw new Error(`All options in question "${question.title}" must have content`);
        }
      }
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

  const ReviewSection = () => {
    const [programmeDetails, setProgrammeDetails] = useState(null);
    const [customFields, setCustomFields] = useState([]);
    setCurrentStep('Review & Launch');
    useEffect(() => {
      const fetchProgrammeDetails = async () => {
        try {
          const programmeRef = doc(db, 'programmes', programId);
          const programmeDoc = await getDoc(programmeRef);
          if (programmeDoc.exists()) {
            setProgrammeDetails(programmeDoc.data());
            const data = programmeDoc.data();
            if (data.customFields) {
              setCustomFields(data.customFields);
            }
          }
          
        } catch (error) {
          console.error('Error fetching programme details:', error);
        }
      };
      fetchProgrammeDetails();
    
    }, [programId]);
    setCurrentStep('3');
    if (!programmeDetails) {
      return <div>Loading event details...</div>;
    }
  
    return (
      <div className="flex-1 p-6 bg-gray-50">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Event Details Card */}
         
          <Card>
            <CardContent>
              <h2 className="text-2xl font-semibold mb-4">Event Details</h2>
              <div className="grid grid-cols-2 gap-6">
                {programmeDetails.image && (
                  <div className="col-span-1 row-span-2">
                    <img
                      src={programmeDetails.image}
                      alt="Event"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                )}
                <div>
                  <p className="text-gray-600 font-medium">Event Name</p>
                  <p className="text-lg font-medium">{programmeDetails.name}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Description</p>
                  <p>{programmeDetails.description}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Event Start Date</p>
                  <p>{programmeDetails.startDate}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Event End Date</p>
                  <p>{programmeDetails.endDate}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Sector</p>
                  <p>{programmeDetails.sector}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {customFields.length > 0 && (
          <Card>
            <CardContent>
              <h2 className="text-2xl font-semibold mb-4">Custom Additional Fields</h2>
              <div className="space-y-4">
                {customFields.map((field) => (
                  <div key={field.id} className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-600 font-medium">Name</p>
                      <p>{field.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">Date</p>
                      <p>{field.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
          {/* Form Details Card */}
          <Card className="mb-6">
            <CardContent>
              <h2 className="text-2xl font-semibold mb-2">{formTitle}</h2>
              <p className="text-gray-600 mb-4">{formDescription}</p>
            </CardContent>
          </Card>
          {sections.map((section) => (
            <SectionCard key={section.id} section={section} isReview={true} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <AddSectionModal />
      <div className="flex-1">
        {currentStep === 'edit' ? (
          <div className="p-6 bg-gray-50">
            <div className="max-w-3xl mx-auto">
              <RegistrationInfo />
              
              {sections.map(section => (
                <SectionCard key={section.id} section={section} />
              ))}

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-orange-100 p-2 rounded-lg">
                    <HelpCircle className="w-5 h-5 text-orange-500" />
                  </span>
                  <h2 className="text-xl font-semibold">Custom Questions</h2>
                </div>
                
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                >
                  <Plus className="w-4 h-4" />
                  Add Questions
                </button>
              </div>
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
                    Launch Program <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    };
    
    export default FormBuilder;
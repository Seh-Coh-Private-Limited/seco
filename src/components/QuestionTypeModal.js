import {
    Copy,
    GripVertical,
    Plus,
    Settings,
    Trash2,
    X
} from 'lucide-react';
import React, { useState } from 'react';

const QuestionTypeModal = ({ 
  isOpen, 
  onClose, 
  section,
  addSection,
  onUpdateSection,
  onDeleteQuestion,
  onAddQuestion,
  questionTypes 
}) => {
  if (!isOpen) return null;

  const QuestionCard = ({ question }) => {
    const [isSelected, setIsSelected] = useState(false);

    return (
      <div className="bg-white rounded-lg shadow mb-4">
        <div className="p-4">
          <div className="flex items-start gap-4">
            <div className="cursor-move text-gray-400">
              <GripVertical className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={question.title}
                onChange={(e) => {
                  const updatedQuestions = section.questions.map(q =>
                    q.id === question.id ? { ...q, title: e.target.value } : q
                  );
                  onUpdateSection(section.id, { questions: updatedQuestions });
                }}
                className="w-full text-lg font-medium mb-2 border-none focus:outline-none focus:ring-0"
                placeholder="Question"
              />
              {(question.type === 'multipleChoice' || question.type === 'checkbox') ? (
                <div className="space-y-2">
                  {question.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {question.type === 'multipleChoice' ? (
                        <div className="w-4 h-4 rounded-full border" />
                      ) : (
                        <div className="w-4 h-4 border rounded" />
                      )}
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...question.options];
                          newOptions[index] = e.target.value;
                          const updatedQuestions = section.questions.map(q =>
                            q.id === question.id ? { ...q, options: newOptions } : q
                          );
                          onUpdateSection(section.id, { questions: updatedQuestions });
                        }}
                        className="flex-1 border-none focus:outline-none focus:ring-0"
                        placeholder={`Option ${index + 1}`}
                      />
                      <button
                        onClick={() => {
                          const newOptions = question.options.filter((_, i) => i !== index);
                          const updatedQuestions = section.questions.map(q =>
                            q.id === question.id ? { ...q, options: newOptions } : q
                          );
                          onUpdateSection(section.id, { questions: updatedQuestions });
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const updatedQuestions = section.questions.map(q =>
                        q.id === question.id 
                          ? { ...q, options: [...q.options, `Option ${q.options.length + 1}`] }
                          : q
                      );
                      onUpdateSection(section.id, { questions: updatedQuestions });
                    }}
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
                  const questionCopy = { ...question, id: Date.now() };
                  onUpdateSection(section.id, {
                    questions: [...section.questions, questionCopy]
                  });
                }}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDeleteQuestion(section.id, question.id)}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsSelected(!isSelected)}
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50" 
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-lg w-full max-w-3xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">Section Questions</h2>
            <input
              type="text"
              value={section.title}
              onChange={(e) => onUpdateSection(section.id, { title: e.target.value })}
              className="mt-2 w-full border-none focus:outline-none focus:ring-0 text-gray-600"
              placeholder="Section Title (optional)"
            />
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Questions */}
        <div className="space-y-4 mb-6">
          {section.questions.map(question => (
            <QuestionCard 
              key={question.id} 
              question={question}
            />
          ))}
        </div>

        {/* Question Type Selection */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium mb-3">Add Question</h3>
          <div className="grid grid-cols-4 gap-2">
            {questionTypes.map(type => (
              <button
                key={type.id}
                onClick={() => addSection()}
                className="p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md flex flex-col items-center gap-1"
              >
                {type.icon}
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionTypeModal;
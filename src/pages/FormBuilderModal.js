import React from 'react';

const FormBuilderModal = ({ onClose, onOptionSelect }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Create New Event</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <h3 className="text-xl font-medium text-center mb-8">How do you want to build your form?</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Start from scratch */}
          <div 
            onClick={() => onOptionSelect('scratch')}
            className="border rounded-lg p-6 cursor-pointer hover:border-blue-500 transition-colors flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h4 className="font-medium mb-2">Start from scratch</h4>
            <p className="text-sm text-gray-600">Build from a list of ready-made form elements.</p>
          </div>

          {/* Import questions */}
          <div 
            onClick={() => onOptionSelect('import')}
            className="border rounded-lg p-6 cursor-pointer hover:border-blue-500 transition-colors flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <h4 className="font-medium mb-2">Import questions</h4>
            <p className="text-sm text-gray-600">Copy and paste questions or import from Google Forms.</p>
          </div>

          {/* Create with AI */}
          <div 
            onClick={() => onOptionSelect('ai')}
            className="border rounded-lg p-6 cursor-pointer hover:border-blue-500 transition-colors flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="font-medium mb-2">Create with AI</h4>
            <p className="text-sm text-gray-600">Use AI to help generate questions for any form.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormBuilderModal;
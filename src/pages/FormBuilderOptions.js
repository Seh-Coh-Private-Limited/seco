// FormBuilderOptions.js
import React from 'react';

const FormBuilderOptions = ({ onSelectOption }) => (
  <div className="max-w-2xl mx-auto p-4 text-center">
    <h2 className="text-xl font-semibold mb-4">How do you want to build your form?</h2>
    <div className="grid grid-cols-3 gap-4">
      <button 
        className="p-6 border rounded-lg hover:bg-gray-100" 
        onClick={() => onSelectOption('startFromScratch')}
      >
        <p className="font-medium">Start from scratch</p>
        <p className="text-sm text-gray-500">Build from a list of ready-made form elements.</p>
      </button>
      <button 
        className="p-6 border rounded-lg hover:bg-gray-100" 
        onClick={() => onSelectOption('importQuestions')}
      >
        <p className="font-medium">Import questions</p>
        <p className="text-sm text-gray-500">Copy and paste questions or import from Google Forms.</p>
      </button>
      <button 
        className="p-6 border rounded-lg hover:bg-gray-100" 
        onClick={() => onSelectOption('createWithAI')}
      >
        <p className="font-medium">Create with AI</p>
        <p className="text-sm text-gray-500">Use AI to help generate questions for any form.</p>
      </button>
    </div>
  </div>
);

export default FormBuilderOptions;

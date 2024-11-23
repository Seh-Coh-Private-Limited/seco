import React from 'react';
import { User, Mail, Phone, Building2, Globe, Share2 } from 'lucide-react';

const RegistrationInfo = () => {
  const existingFields = [
    { icon: <User className="w-4 h-4" />, label: 'Name' },
    { icon: <Mail className="w-4 h-4" />, label: 'Email' },
    { icon: <Phone className="w-4 h-4" />, label: 'Phone' },
    { icon: <Building2 className="w-4 h-4" />, label: 'Company Name' },
    { icon: <Globe className="w-4 h-4" />, label: 'Website' },
    { icon: <Share2 className="w-4 h-4" />, label: 'Social Media Links' }
  ];

  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="p-3 border-b border-gray-200">
        <h2 className="text-lg font-bold">Registration Questions</h2>
        <p className="text-gray-600 text-sm">
          We will ask guests the following questions when they register for the event.
        </p>
      </div>
      
      <div className="p-3">
        <div className="bg-gray-50 rounded-lg p-3">
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-green-600" />
            Personal Information
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {existingFields.map((field, index) => (
              <div key={index} className="flex items-center gap-2 bg-white p-2 rounded-md shadow-sm">
                <span className="text-gray-500">{field.icon}</span>
                <span className="text-sm">{field.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationInfo;
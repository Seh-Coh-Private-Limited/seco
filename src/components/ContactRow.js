import { Edit, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';

const ContactRow = ({ contact, index, onChange, onRemove, onImageUpload, onRemoveImage }) => {
  const [isEditing, setIsEditing] = useState(false);

  // Automatically open form if critical fields are empty
  useEffect(() => {
    if (!contact.firstName || !contact.lastName) {
      setIsEditing(true);
    }
  }, [contact]);

  const handleInputChange = (field, value) => {
    onChange(field, value); // Propagate changes back to the parent
  };

  if (!isEditing) {
    return (
      <div className="flex items-center justify-between bg-white p-4 rounded-lg mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
            {contact.imageUrl ? (
              <img
                src={contact.imageUrl}
                alt={`${contact.firstName} ${contact.lastName}`}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <i className="fa fa-user-circle text-gray-500 text-3xl"></i>
            )}
          </div>
          <div>
            <div className="flex space-x-2 items-center">
              <span className="font-semibold">
                {contact.firstName} {contact.lastName}
              </span>
              <span className="text-gray-500 text-sm">({contact.designation})</span>
              {contact.linkedin && (
                <a
                  href={contact.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 text-sm"
                >
                  LinkedIn
                </a>
              )}
            </div>
            <div className="text-gray-600 flex items-center space-x-4">
              <span>{contact.email}</span>
              <span className="h-4 w-px bg-gray-300"></span> {/* Spacer */}
              <span>{contact.mobile}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-500 hover:text-blue-700"
          >
            <Edit className="w-5 h-5" />
          </button>
          {onRemove && (
            <button
              onClick={onRemove}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-4 p-4 border rounded-lg">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
          {contact.imageUrl ? (
            <img
              src={contact.imageUrl}
              alt={`${contact.firstName} ${contact.lastName}`}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <i className="fa fa-user-circle text-gray-500 text-3xl"></i>
          )}
        </div>
        <div className="flex flex-col space-y-2">
          <label
            htmlFor={`contact-image-${index}`}
            className="text-blue-500 hover:text-blue-700 text-sm cursor-pointer"
          >
            Upload Image
          </label>
          <input
            type="file"
            id={`contact-image-${index}`}
            className="hidden"
            accept="image/*"
            onChange={(e) => onImageUpload(index, e.target.files[0])}
          />
          {contact.imageUrl && (
            <button
              type="button"
              onClick={onRemoveImage}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Remove Image
            </button>
          )}
        </div>
      </div>
      <div className="flex space-x-4">
        <input
          type="text"
          placeholder="First Name"
          value={contact.firstName}
          onChange={(e) => handleInputChange('firstName', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={contact.lastName}
          onChange={(e) => handleInputChange('lastName', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg"
        />
      </div>
      <input
        type="email"
        placeholder="Email"
        value={contact.email}
        onChange={(e) => handleInputChange('email', e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-lg"
      />
      <input
        type="text"
        placeholder="Mobile"
        value={contact.mobile}
        onChange={(e) => handleInputChange('mobile', e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-lg"
      />
      <input
        type="text"
        placeholder="Designation"
        value={contact.designation}
        onChange={(e) => handleInputChange('designation', e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-lg"
      />
      <input
        type="text"
        placeholder="LinkedIn"
        value={contact.linkedin}
        onChange={(e) => handleInputChange('linkedin', e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-lg"
      />
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="text-blue-500 hover:text-blue-700"
        >
          Done
        </button>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-red-500 hover:text-red-700"
          >
            Remove Contact
          </button>
        )}
      </div>
    </div>
  );
};

export default ContactRow;
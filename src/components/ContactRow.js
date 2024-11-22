import { Edit, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';

const ContactRow = ({ contact, onUpdate, onRemove }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContact, setEditedContact] = useState({ ...contact });

  // Automatically open form if critical fields are empty
  useEffect(() => {
    if (!contact.firstName || !contact.lastName) {
      setIsEditing(true);
    }
  }, [contact]);

  const handleSave = () => {
    onUpdate(editedContact);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedContact({ ...contact });
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setEditedContact(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!isEditing) {
    return (
      <div className="flex items-center justify-between bg-white p-4 rounded-lg mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
            <i className="fa fa-user-circle text-gray-500 text-3xl"></i>
          </div>
          <div>
            <div className="flex space-x-2 items-center">
              <span className="font-semibold">
                {contact.firstName} {contact.lastName}
              </span>
              <span className="text-gray-500 text-sm">({contact.designation})</span>
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
    <div className="bg-white p-0 rounded-lg mb-4 space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">First Name</label>
          <input
            type="text"
            value={editedContact.firstName || ''}
            onChange={(e) => handleChange('firstName', e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Last Name</label>
          <input
            type="text"
            value={editedContact.lastName || ''}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={editedContact.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="tel"
            value={editedContact.mobile || ''}
            onChange={(e) => handleChange('mobile', e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Designation</label>
          <input
            type="text"
            value={editedContact.designation || ''}
            onChange={(e) => handleChange('designation', e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
          />
        </div>
      </div>
      <div className="flex justify-end space-x-2 mt-4">
        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default ContactRow;

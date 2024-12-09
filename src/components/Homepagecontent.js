import CreateEventForm from '.components/CreateEventForm'; // Assuming you'll create this as a separate component
import { Plus } from 'lucide-react';
import React, { useState } from 'react';


const HomePage = () => {
  const [showCreateEvent, setShowCreateEvent] = useState(false);

  const handleCreateEvent = () => {
    setShowCreateEvent(true);
  };

  const handleCloseCreateEvent = () => {
    setShowCreateEvent(false);
  };

  if (showCreateEvent) {
    return <CreateEventForm onClose={handleCloseCreateEvent} />;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Welcome to your dashboard</h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="bg-gray-50 rounded-lg p-8 max-w-lg w-full text-center">  
          <div className="mb-4">
            <Plus className="w-12 h-12 text-gray-400 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Create your first form</h2>
          <p className="text-gray-600 mb-6">
            Get started by creating an event, program, or cohort to begin collecting responses.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleCreateEvent}
              className="px-4 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50 flex items-center gap-2"
            >
              <Plus size={16} />
              New Event
            </button>
            <button
              onClick={handleCreateEvent}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus size={16} />
              New Program
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';

const Mediator = () => {
  const { id } = useParams(); // Extract the 'id' from the URL
  alert(id);
  const location = useLocation(); // Access the location and state
  const navigate = useNavigate();

  useEffect(() => {
    // Extract the program ID from state
    const programIdFromState = location.state?.program;
    alert(programIdFromState);
    if (programIdFromState) {
      // Perform background logic or API calls
      console.log('Processing Program ID:', programIdFromState);

      // Navigate to the next route after processing
      navigate(`/next-route/${programIdFromState}`);
    } else {
      console.error('Program ID is missing from state.');
      navigate('/error'); // Redirect to an error page if state is missing
    }
  }, [id, location.state, navigate]);

  // Display only a loader while the process runs
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <ClipLoader size={50} color={'#3498db'} loading={true} />
    </div>
  );
};

export default Mediator;

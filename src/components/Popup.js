import { faArrowRight, faCopy } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProgramById } from '../components/fetchProgram'; // Adjust the import path based on your project structure
import './Popup.css'; // Ensure CSS styles for the popup
import { FaWindowClose } from 'react-icons/fa';

const Popup = ({ isOpen, onClose, programDetails }) => {
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      const program = await fetchProgramById(programDetails.id); // Use the passed id to fetch program details
      setProgram(program);
    };

    if (programDetails && programDetails.id) {
      fetchDetails();
    }
  }, [programDetails]);

  if (!program) return null; // Render nothing if data is not yet available

  const {
    title,
    image,
    description,
    location, // Assuming this is the city
    endDate,
    eligibility,
    incentives,
    organizerDetails,
    contactInfo,
  } = program;

  const formattedEndDate = new Date(endDate);

  const formatMonth = (date) => date.toLocaleString('default', { month: 'short' }).toUpperCase();
  const formatDay = (date) => date.getDate();

  const handleEventPageClick = () => {
    navigate(`/program/${programDetails.id}`, { state: { program: programDetails.id } }); // Pass the id in state
  };
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href); // Copies the current URL
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
      alert('Failed to copy the link.');
    }
  };
  

  return (
    <div className={`popup ${isOpen ? 'show' : ''}`}>
      <div className="popup-content">
      <div className="panel-header flex flex-col bg-white p-4 sticky top-8 z-20 mb-0">
  <div className="flex items-center gap-4">
    {/* Close Button */}
    <button 
      aria-label="Close" 
      onClick={onClose} 
      className="flex items-center justify-center w-8 h-8"
    >
    <i class="far fa-times-circle"></i>
     
    </button>

    {/* Event Page Button */}
    <button 
      onClick={handleEventPageClick} 
      className="flex items-center bg-gray-200 px-4 py-2 rounded-xl hover:bg-gray-300 transition"
    >
      <span className="mr-2 text-gray-700 text-sm"style={{
                    fontFamily: 'CFont',
                    
                    }}>Event Page</span>
      <FontAwesomeIcon 
        icon={faArrowRight} 
        style={{ transform: 'rotate(305deg)' }} 
      />
    </button>

    {/* Copy Link Button */}
    <button 
      onClick={handleCopyLink} 
      className="flex items-center bg-gray-200 px-4 py-2 rounded-xl hover:bg-gray-300 transition"
    >
      <span className="mr-2 text-gray-700 text-sm"style={{
                    fontFamily: 'CFont',
                    
                    }}>Copy Link</span>
      <FontAwesomeIcon 
        icon={faCopy} 
      className="w-4 h-4" 
      />
    </button>
  </div>

  {/* Manual Line */}
  <div className="w-full h-px bg-black mt-2 mb-0" style={{ marginLeft: '-32px', marginRight: '-16px' }}></div>
</div>



        {image && <img src={image} alt={title} className="popup-image mb-6 mt-14" />}
        <p className='text-4xl font-bold my-4 'style={{
                    fontFamily: 'CFont',
                    
                    }}>
              {title}
            </p>

        
        <div className="date-and-location flex justify-between items-center mt-6 mb-10">
  {/* Date Section - Left Aligned */}
  <div id="date" className="flex flex-row gap-2">
    <div className="w-10 border-2 border-slate-300 rounded-md h-10">
      <div className="bg-slate-300 text-xs text-center"style={{
                    fontFamily: 'CFont',
                    
                    }}>
        {formatMonth(formattedEndDate)}
      </div>
      <div>
        <p className="text-center text-sm"style={{
                    fontFamily: 'CFont',
                    
                    }}>{formatDay(formattedEndDate)}</p>
      </div>
    </div>
    <div>
      <p className="font-medium">
        {formattedEndDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
      <p className="text-sm text-gray-500"style={{
                    fontFamily: 'CFont',
                    
                    }}>Deadline</p>
    </div>
  </div>

  {/* Location Section - Right Aligned */}
  <div id="location" className="flex flex-row gap-2">
    <div className="w-10 border-2 border-slate-300 rounded-md h-10">
      <img
        src="../../location.png"
        alt="location"
        className="w-7 h-6 ml-1 mt-2"
      />
    </div>
    <div>
      <p className="font-medium"style={{
                    fontFamily: 'CFont',
                    
                    }}>Location</p>
      <p className="text-sm text-gray-500"style={{
                    fontFamily: 'CFont',
                    
                    }}>{location}</p>
    </div>
  </div>
</div>

        

<div
  className="about-section"
  style={{
    border: '2px solid #ccc', // Adjust the thickness and color as needed
    borderRadius: '8px', // Optional: adds rounded corners
    padding: '16px', // Optional: adds space inside the border
  }}
>
<div id='details' className='mt-6'>
              <p className='font-bold text-3xl'style={{
                    fontFamily: 'CFont',
                    
                    }}>About the Program</p>
              <hr className='my-4 border-t border-gray-300' />
              <div className='flex flex-col gap-6'style={{
                    fontFamily: 'CFont',
                    
                    }}>
                <p>{description}</p>
                
               
              </div>
            </div>

            <div id='eligibility' className='mt-6'>
              <p className='font-bold'style={{
                    fontFamily: 'CFont',
                    
                    }}>Eligibility</p>
              <hr className='my-4 border-t border-gray-300' />
              <div className='flex flex-col gap-6'>
                <p>{eligibility[0]}</p>
                <p style={{
                    fontFamily: 'CFont',
                    
                    }}>Startup Stage for Applications:</p>
                <p>
   {eligibility[1] && typeof eligibility[1] === 'string' ? eligibility[1].split('+').map((item, index) => (
     <span key={index} style={{
      fontFamily: 'CFont',
      
      }}>
       -{item}
       <br />
     </span>
   )) : null}
                </p>
                
                <p>For:</p>
                <p>
  {eligibility[2] && typeof eligibility[2] === 'string' ? (
    <div className="flex flex-wrap gap-6"> {/* Use flex layout with gap */}
      {eligibility[2].split(';').map((item, index) => (
        <span 
          key={index} 
          className="bg-slate-300 rounded-3xl p-2 inline-block"style={{
            fontFamily: 'CFont',
            
            }}
        >
          {item}
          <br />
        </span>
      ))}
    </div>
  ) : null}
</p>


              </div>
            </div>



            <div id='incentives' className='mt-6'>
              <p className='font-bold'style={{
                    fontFamily: 'CFont',
                    
                    }}>Incentives</p>
              <hr className='my-4 border-t border-gray-300' />
              <div className='flex flex-col gap-6'>
                
                <p style={{
                    fontFamily: 'CFont',
                    
                    }}>Fiscal Incentives:</p>
                <p style={{
                    fontFamily: 'CFont',
                    
                    }}>
                  -{incentives.fiscal}
                </p>
                
                <p style={{
                    fontFamily: 'CFont',
                    
                    }}>Non-Fiscal Incentives:</p>
                
                <p style={{
                    fontFamily: 'CFont',
                    
                    }}>-{incentives.nonFiscal}</p>
              </div>
            </div>

            <div className='text-sm mt-2'>
  <p className='mb-2 font-bold'style={{
                    fontFamily: 'CFont',
                    
                    }}>Contact the host</p>
  <hr className='my-4 border-t border-gray-300' />

  <div className='mb-4'> {/* Added margin for spacing */}
    <p className='font-medium mb-4'style={{
                    fontFamily: 'CFont',
                    
                    }}> {/* Added margin bottom */}
      Person In Charge: 
      <a className='text-sm text-gray-500 ml-2'style={{
                    fontFamily: 'CFont',
                    
                    }}>{contactInfo.contactPerson}</a> {/* Added margin left */}
    </p>
    <p className='font-medium mb-4'style={{
                    fontFamily: 'CFont',
                    
                    }}> {/* Added margin bottom */}
      Designation: 
      <a className='text-sm text-gray-500 ml-2'style={{
                    fontFamily: 'CFont',
                    
                    }}>{contactInfo.designation}</a> {/* Added margin left */}
    </p>
    <p className='font-medium mb-4'style={{
                    fontFamily: 'CFont',
                    
                    }}> {/* Added margin bottom */}
      Email ID:
      <a href='mailto:atoms@accel.com' className='text-sm text-gray-500 ml-2'style={{
                    fontFamily: 'CFont',
                    
                    }}> {contactInfo.email}</a> {/* Added margin left */}
    </p>
    <p className='font-medium mb-4'style={{
                    fontFamily: 'CFont',
                    
                    }}> {/* Added margin bottom */}
      Website:
      <a href='https://atoms.accel.com/' target='_blank' rel='noopener noreferrer' className='text-sm text-gray-500 ml-2'style={{
                    fontFamily: 'CFont',
                    
                    }}> {contactInfo.website}</a> {/* Added margin left */}
    </p>
  </div>

  <div className='flex flex-row gap-7 mb-4'>
      <a href={contactInfo.socialMedia.twitter} target='_blank' rel='noopener noreferrer'>
        <img src='../../twitter.png' alt='twitter' className='w-5 h-5 my-2' />
      </a>
      <a href={contactInfo.socialMedia.instagram} target='_blank' rel='noopener noreferrer'>
        <img src='../../instagram.png' alt='instagram' className='w-5 h-5 my-2' />
      </a>
      <a href={contactInfo.socialMedia.linkedin} target='_blank' rel='noopener noreferrer'>
        <img src='../../linkedin.png' alt='linkedin' className='w-5 h-5 my-2' />
      </a>
      <a href={contactInfo.socialMedia.facebook} target='_blank' rel='noopener noreferrer'>
        <img src='../../facebook.png' alt='facebook' className='w-5 h-5 my-2' />
      </a>
    </div>

  <p style={{
                    fontFamily: 'CFont',
                    
                    }}>Report Event</p>
</div>
<div className="flex justify-center mb-8"> {/* Use flex to center the button */}
  <button className='rounded-md text-xl text-slate-700 bg-slate-300 hover:text-gray-100 hover:bg-slate-700 px-10 font-medium' style={{
                    fontFamily: 'CFont',
                    
                    }}>
    Apply
  </button>
</div>

</div>

      </div>
    </div>
  );
};

export default Popup;

import { faArrowRight, faNewspaper } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DOMPurify from 'dompurify';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ffetchProgramById } from '../components/ffetchprogram';

const FPopup = ({ isOpen, onClose, programDetails ,handleTabChange}) => {
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      const program = await ffetchProgramById(programDetails.id);
      setProgram(program);
    };

    if (programDetails && programDetails.id) {
      fetchDetails();
    }
  }, [programDetails]);

  if (!program) return null;

  const {
    name,
    image,
    description,
    location,
    endDate,
    eligibility,
    incentives,
    customFields=[],
  } = program;

  const formattedEndDate = new Date(endDate);

  const formatMonth = (date) => date.toLocaleString('default', { month: 'short' }).toUpperCase();
  const formatDay = (date) => date.getDate();
  const formatCustomFieldDate = (dateString) => {
    const date = new Date(dateString);
    return {
      month: formatMonth(date),
      day: formatDay(date),
      fullDate: date.toLocaleDateString("en-US", {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      })
    };
  };
  const renderDescription = (description) => {
    // Sanitize the HTML to prevent XSS attacks
    const sanitizedDescription = DOMPurify.sanitize(description, {
      ALLOWED_TAGS: ['h1', 'h2', 'p', 'ol', 'ul', 'li', 'br', 'strong', 'em', 'u', 'a', 's'],
      ALLOWED_ATTR: ['href', 'target', 'rel','class'], // Allow attributes needed for links
    });
  
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sanitizedDescription;
  
    return Array.from(tempDiv.children).reduce((acc, element, index) => {
      if (
        (element.tagName.toLowerCase() === 'p' &&
          (!element.textContent.trim() && !element.innerHTML.trim())) ||
        (element.tagName.toLowerCase() === 'br')
      ) {
        return acc;
      }
  
      switch (element.tagName.toLowerCase()) {
        case 'h1':
          acc.push(
            <h1 key={index} className="text-2xl font-bold text-black">
              {element.textContent}
            </h1>
          );
          break;
  
        case 'h2':
          acc.push(
            <h2 key={index} className="text-xl font-bold text-black">
              {element.textContent}
            </h2>
          );
          break;
  
          case 'a':
            acc.push(
              <a
                key={index}
                href={element.href}
                target={element.target || '_blank'}
                rel={element.rel || 'noopener noreferrer'}
                className="text-blue-600 underline hover:text-blue-800 transition-colors duration-200"
              >
                {element.textContent}
              </a>
            );
            break;
  
          case 'p':
            acc.push(
              <p
                key={index}
                className="text-black leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: element.innerHTML.replace(
                    /<a\b/g,
                    '<a class="text-blue-600 underline hover:text-blue-800 transition-colors duration-200"'
                  )
                }}
              />
            );
            break;
  
        case 'ol':
          acc.push(
            <ol key={index} className="list-decimal pl-6 text-black space-y-2">
              {Array.from(element.children)
                .filter((li) => li.tagName.toLowerCase() !== 'br')
                .map((li, liIndex) => (
                  <li key={liIndex} className="mb-2" dangerouslySetInnerHTML={{ __html: li.innerHTML }} />
                ))}
            </ol>
          );
          break;
  
        case 'ul':
          acc.push(
            <ul key={index} className="list-disc pl-6 text-black space-y-2 mb-3">
              {Array.from(element.children)
                .filter((li) => li.tagName.toLowerCase() !== 'br')
                .map((li, liIndex) => (
                  <li key={liIndex} className="mb-2" dangerouslySetInnerHTML={{ __html: li.innerHTML }} />
                ))}
            </ul>
          );
          break;
  
        default:
          break;
      }
  
      return acc;
    }, []);
  };
  const handleEventPageClick = () => {
    handleTabChange('programdetailpage', programDetails.id);
    onClose();
  };

  const handleApplyClick = () => {
    handleTabChange('applicationform', programDetails.id);
    onClose();
  };


  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
      alert('Failed to copy the link.');
    }
  };

  const handleOverlayClick = () => {
    // Close the popup when the overlay is clicked
    onClose();
  };

  return (
    <div 
      className={`fixed inset-0 z-40 ${isOpen ? 'block' : 'hidden'}`}
      onClick={handleOverlayClick}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
        display: isOpen ? 'block' : 'none',
      }}
    >
      <div 
        className={`fixed inset-y-0 right-0 w-[35%] bg-white shadow-lg overflow-y-auto z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out rounded-lg scrollbar-hide`}
        onClick={(e) => e.stopPropagation()}  // Prevent click from propagating to the overlay
      >
        <div className="p-4">
          <div className="sticky top-0 bg-white z-20 pb-2 p-0">
            <div className="flex items-start gap-4 mb-2">
              <button 
                aria-label="Close" 
                onClick={onClose} 
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
              >
                <i className="far fa-times-circle text-black text-lg"></i>
              </button>

              <div className="flex space-x-2">
                 {/* Event Page Button */}
                 <button 
            onClick={handleEventPageClick}
            className="flex items-center bg-gray-200 px-2 py-1 sm:px-4 sm:py-2 rounded-xl transition duration-300 ease-in-out hover:bg-gray-300"
          >
            <span className="mr-1 text-black text-xs sm:text-sm">
              event page
            </span>
            <FontAwesomeIcon 
              icon={faArrowRight}
              style={{ transform: 'rotate(305deg)' }}
              className="w-3 h-3 sm:w-4 sm:h-4"
            />
          </button>

          <button 
            onClick={handleApplyClick}
            className="flex items-center bg-[#F99F31] hover:bg-[#FACB82] px-3 py-2 rounded-xl transition"
          >
            <span className="mr-2 text-black text-sm">apply</span>
            <FontAwesomeIcon 
              icon={faNewspaper}
              className="w-4 h-4"
            />
          </button>
                
              </div>
            </div>
            <hr className="border-t border-black" />
          </div>

          {image && <img src={image} alt={name} className="w-full h-auto object-cover mb-4" />}
          
          <h2 className="text-3xl font-bold mb-4 text-left">{name}</h2>

          <div className="flex items-start mb-4">
            <div className="flex items-center space-x-2">
              <div className="border-2 border-slate-300 rounded-md w-10 h-10 flex flex-col">
                <div className="bg-slate-300 text-xs text-center">{formatMonth(formattedEndDate)}</div>
                <div className="text-center text-sm">{formatDay(formattedEndDate)}</div>
              </div>
              <div>
                <p className="font-medium text-left">
                  {formattedEndDate.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    weekday: "long",
                  })}
                </p>
                <p className="text-sm text-gray-500 text-left">deadline</p>
              </div>
            </div>
          </div>
          {customFields && customFields.map((field, index) => {
                  if (field.date) {
                    const formattedDate = formatCustomFieldDate(field.date);
                    return (
                      <div key={index} className="flex flex-row gap-2 mt-4 mb-4">
                        <div className="w-10 border-2 border-slate-300 rounded-md h-10">
                          <div className="bg-slate-300 text-xs text-center" style={{ fontFamily: 'CFont' }}>
                            {formattedDate.month}
                          </div>
                          <div className="text-center text-sm" style={{ fontFamily: 'CFont' }}>
                            {formattedDate.day}
                          </div>
                        </div>
                        <div>
                          <p className="font-medium" style={{ fontFamily: 'CFont' }}>
                            {formattedDate.fullDate}
                          </p>
                          <p className="text-sm text-gray-500" style={{ fontFamily: 'CFont' }}>
                            {field.name}
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
          {/* <div className="flex items-center space-x-2 mb-4">
            <div className="border-2 border-slate-300 rounded-md w-10 h-10 flex items-center justify-center">
              <img src="../../location.png" alt="location" className="w-6 h-6" />
            </div>
            <div>
              <p className="font-medium text-left">{location}</p>
              <p className="text-sm text-gray-500 text-left">location</p>
            </div>
          </div> */}

          <div className="space-y-6">
            <div>
              {/* <h3 className="text-lg font-bold mb-2 text-left">about</h3> */}
              <hr className="border-t border-gray-300 mb-4" />
              <p className="text-left">{renderDescription(description)}</p>
            </div>

            {/* <div>
              <h3 className="text-lg font-bold mb-2 text-left">eligibility</h3>
              <hr className="border-t border-gray-300 mb-4" />
              <p className="text-left">{eligibility}</p>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-2 text-left">incentives</h3>
              <hr className="border-t border-gray-300 mb-4" />
              <p className="mb-2 text-left">{incentives}</p>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FPopup;

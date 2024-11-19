import React, { useState } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import FPopup from './FPopup'; // Import Popup component
import './FProgramCard.css';

const FProgramCard = ({
  id,
  title,
  image,
  description,
  category,
  location,
  orientation,
}) => {
  const [showPopup, setShowPopup] = useState(false); // State to control popup visibility

  // Function to handle card click and open the popup
  const handleCardClick = () => {
    setShowPopup(true); // Open the popup when card is clicked
  };

  // Function to close the popup
  const closePopup = () => {
    setShowPopup(false); // Close the popup
  };

  const cardClass = orientation === 'horizontal' ? 'f-program-card f-card-horizontal' : 'f-program-card f-card-vertical';
  // const firstCategory = category.includes(',') ? category.substring(0, category.indexOf(',')) : category;

  return (
    <>
      <div className={cardClass} onClick={handleCardClick}> {/* Trigger popup on click */}
        <article className="f-card-content">
          <div>
            <img alt={title} className="f-card-image" src={image} />
            <div>
              <h3 className="f-card-title" style={{
                    fontFamily: 'CFont',
                    textAlign:'left',
                    }}>{title}</h3>
              <p className="f-card-description" style={{
                    fontFamily: 'CFont',
                    fontSize: '14px',
                    textAlign:'left',
                    textTransform: 'lowercase' 
                    }}>{description}</p> {/* Description with truncation */}
            </div>
          </div>

          {/* Footer with only one category and location */}
          <div className="f-card-footer" style={{
                    fontFamily: 'CFont',
                    fontSize: '14px',
                    }}>
            <div className="f-card-meta">
              {/* {firstCategory} &bull; {location} */}
            </div>
            <div className="f-read-more">
              <FaArrowRight className="f-arrow-icon" />
            </div>
          </div>
        </article>
      </div>

      {/* Popup Component */}
      {/* {showPopup && (
        <FPopup
          isOpen={showPopup} // Ensure to pass the correct state for controlling popup visibility
          onClose={closePopup} // Close function
          programDetails={{
            id,
          }} // Pass program details to the popup
        />
      )} */}
    </>
  );
};

export default FProgramCard;

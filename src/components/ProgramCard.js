import React, { useState } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import './ProgramCard.css';
import Popup from './Popup'; // Import Popup component

const ProgramCard = ({
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

  const cardClass = orientation === 'horizontal' ? 'program-card card-horizontal' : 'program-card card-vertical';
  const firstCategory = category.includes(',') ? category.substring(0, category.indexOf(',')) : category;

  return (
    <>
      <div className={cardClass} onClick={handleCardClick}> {/* Trigger popup on click */}
        <article className="card-content">
          <div>
            <img alt={title} className="card-image" src={image} />
            <div>
              <h3 className="card-title"style={{
                    fontFamily: 'CFont',
                    fontSize: '22px',
                    textAlign:'left',
                    }}>{title}</h3>
              <p className="card-description"style={{
                    fontFamily: 'CFont',
                    fontSize: '14px',
                    textAlign:'left',
                    textTransform: 'lowercase' 
                    }}>{description}</p> {/* Description with truncation */}
            </div>
          </div>

          {/* Footer with only one category and location */}
          <div className="card-footer"style={{
                    fontFamily: 'CFont',
                    fontSize: '14px',
                    }}>
            <div className="card-meta">
              {firstCategory} &bull; {location}
            </div>
            <div className="read-more">
              <FaArrowRight className="arrow-icon" />
            </div>
          </div>
        </article>
      </div>

      {/* Popup Component */}
      {showPopup && (
        <Popup
          isOpen={showPopup} // Ensure to pass the correct state for controlling popup visibility
          onClose={closePopup} // Close function
          programDetails={{
            id,
          }} // Pass program details to the popup
        />
      )}
    </>
  );
};

export default ProgramCard;

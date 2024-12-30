import { htmlToText } from 'html-to-text'; // Import the library
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
  handleTabChange 
}) => {
  const [showPopup, setShowPopup] = useState(false); // State to control popup visibility

  // Function to handle card click and open the popup
  const handleCardClick = () => {
    setShowPopup(true); // Open the popup when card is clicked
  };
  const getSummary = (htmlContent) => {
    // Convert HTML to plain text
    const plainText = htmlToText(htmlContent, {
      wordwrap: false,
      ignoreHref: true,
      ignoreImage: true,
    });

    // Split text into lines and remove empty lines or unnecessary headings
    const lines = plainText
      .split('\n')
      .filter((line) => line.trim() && !line.toLowerCase().startsWith('about the job'));

    // Get the first meaningful line
    const firstMeaningfulLine = lines.length > 0 ? lines[0] : '';

    // Truncate the text to a specific length
    const truncatedText = firstMeaningfulLine.length > 100
      ? `${firstMeaningfulLine.substring(0, 97)}...`
      : firstMeaningfulLine;

    return truncatedText;
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
                    }}>{getSummary(description)}</p> {/* Description with truncation */}
            </div>
          </div>

          {/* Footer with only one category and location */}
          <div className="f-card-footer" style={{
                    fontFamily: 'CFont',
                    fontSize: '14px',
                    }}>
            <div className="f-card-meta">
              {category}
            </div>
            <div className="f-read-more">
              <FaArrowRight className="f-arrow-icon" />
            </div>
          </div>
        </article>
      </div>

      {/* Popup Component */}
      {showPopup && (
        <FPopup
          isOpen={showPopup}
          onClose={closePopup}
          programDetails={{ id }}
          handleTabChange={handleTabChange}
        />
      )}
    </>
  );
};

export default FProgramCard;

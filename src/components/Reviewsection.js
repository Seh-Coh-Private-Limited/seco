import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";

import DOMPurify from 'dompurify'; // Recommended for sanitizing HTML
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { ffetchProgramById } from '../components/ffetchprogram';
import { collection, db, getDocs, query, where, doc, getDoc } from '../firebase';
import { auth } from '../firebase'; // Import auth from firebase

const FProgramDetailPage = ({ programId }) => {
  const navigate = useNavigate();
  const [programDetails, setProgramDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [openIndex, setOpenIndex] = useState(null);
  const [formQuestions, setFormQuestions] = useState([]);
  const [contactInfo, setContactInfo] = useState(null);
  const [socialLinks, setSocialLinks] = useState(null);

  const toggleAnswer = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  useEffect(() => {
    
    const fetchProgram = async () => {
      try {
        if (programId) {
          const fetchedProgram = await ffetchProgramById(programId);
          
          if (!fetchedProgram) {
            console.log(programId);
            console.error('No program found with the given ID');
            // navigate('/programs');
            return;
          }
          
          setProgramDetails(fetchedProgram);
          const programmesRef = collection(db, "programmes");
  
          // Query the 'programmes' collection to find the document where 'id' matches 'programId'
          const programmeQuery = query(programmesRef, where("id", "==", programId));
          const programmeSnapshot = await getDocs(programmeQuery);
        
          if (!programmeSnapshot.empty) {
            // Get the first matching document (assuming `id` is unique)
            const programmeDoc = programmeSnapshot.docs[0];
        
            // Get the reference to the 'form' subcollection
            const formCollectionRef = collection(db, "programmes", programmeDoc.id, "form");
        
            // Fetch the 'form' subcollection
            const formSnapshot = await getDocs(formCollectionRef);
        
            // Retrieve all questions from the 'questions' field in each form document
            const questions = formSnapshot.docs.flatMap((doc) => doc.data().questions || []);
        
            console.log('Fetched Questions:', questions);
            // Set the state or handle the questions data
            setFormQuestions(questions);
          
          } else {
            console.error('No document found with the matching programId');
          }
        }
      } catch (error) {
        console.error('Error fetching program details:', error);
        navigate('/programs');
      }
    };

    const fetchContactInfo = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();

            // Fetch contacts (assuming it's an array field)
            if (userData.contacts && userData.contacts.length > 0) {
              setContactInfo(userData.contacts[0]); // Assuming you want the first contact
            }

            // Fetch social links (assuming it's a map field)
            if (userData.social) {
              setSocialLinks(userData.social);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching contact information:', error);
      }
    };

    fetchProgram();
    fetchContactInfo();
  }, [programId, navigate]);

  if (!programDetails) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <ClipLoader size={50} color={'#3498db'} loading={true} />
      </div>
    );
  }

  const {
    name,
    image,
    endDate,
    description,
    location,
    categories = [],
    customFields = [],
    startDate,
  } = programDetails;

  const formattedStartDate = new Date(startDate);
  const formattedEndDate = new Date(endDate);
  
  const formatMonth = (date) => date.toLocaleString('default', { month: 'short' }).toUpperCase();
  const formatDay = (date) => date.getDate();
  const sanitizeHTML = (html) => {
    return html?.replace(/<script.*?>.*?<\/script>/gi, ""); // Remove <script> tags
  };
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
  const handleSetActive = (to) => {
    setActiveTab(to);
  };
  const sanitizedDescription = sanitizeHTML(description);
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
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  const TabButton = ({ tab, label }) => (
    <button
      onClick={() => handleTabChange(tab)}
      className={`px-4 py-2 text-sm transition-colors duration-200 border-b-2 ${
        activeTab === tab
          ? 'text-blue-600 border-blue-600 font-medium'
          : 'text-gray-500 border-transparent hover:text-blue-600 hover:border-blue-600'
      }`}
      style={{ fontFamily: 'CFont' }}
    >
      {label}
    </button>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return (
          <div id="details" className="mt-6 mb-6">
            <hr className="my-4 border-t border-gray-300" />
            <div className="flex flex-col mt-3" style={{ fontFamily: 'CFont' }}>
              {renderDescription(description)}
            </div>
          </div>
        );
      case 'formquestions':
        return (
          <div id="formquestions" className="mt-6 mb-6">
          <hr className="my-4 border-t border-gray-300" />
          <div className="flex flex-col mt-3 space-y-4" style={{ fontFamily: 'CFont' }}>
            <h2 className="text-xl font-bold mb-4">Form Questions</h2>
            {formQuestions && formQuestions.length > 0 ? (
              formQuestions.map((question, index) => {
                // Mapping question types to display-friendly names
                const questionTypeMap = {
                  shortText: "Short Answer",
                  longText: "Long Answer",
                  multipleChoice: "Multiple Choice",
                  checkbox: "Checkbox",
                  // dropdown: "Dropdown",
                  time:"Time",
                  fileUpload:"File Upload",
                  rating:"Rating"

                };
                
                const displayType = questionTypeMap[question.type] || "Short Answer"; // Default to "Short Answer"
        
                return (
                  <div key={index} className="bg-white shadow rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <p className="text-gray-800" style={{ fontFamily: 'CFont' }}>
                        {question.title || "Question?"} {question.required ? <span className="text-red-500">*</span> : ""}
                      </p>
                      <span className="text-sm text-gray-500 ml-2">
                        Type: {displayType}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-600">No form questions available for this program.</p>
            )}
          </div>
        </div>
        
        );
      default:
        return null;
    }
  };

  const renderContactSection = () => {
    if (!contactInfo || !socialLinks) return null;

    const { designation, email, firstName, lastName, linkedin, mobile, imageUrl } = contactInfo;
    const { instagram, linkedin: socialLinkedin, tiktok, twitter, website, youtube } = socialLinks;
    if (!designation || !email || !firstName || !lastName || !linkedin || !mobile || !imageUrl) return null;

    return (


<div className='text-sm mt-2'>
        <p className='mb-2' style={{ fontFamily: 'CFont' }}>contact the host</p>
        <hr className='my-4 border-t border-gray-300' />

        <div className="flex items-center space-x-4 pt-4 rounded-lg">
        
        {/* Profile Image */}
        <img
          src={imageUrl}
          alt="profile"
          className="w-12 h-12 rounded-full border border-gray-300"
        />
        
        {/* Name & Details */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center space-x-2">
            <p className="text-lg font-semibold">
              {firstName} {lastName}
            </p>
            <span className="text-xs text-gray-500">{designation}</span>
          </div>
        
          {/* Email & LinkedIn */}
          <div className="flex items-center text-gray-500 text-sm space-x-2 mt-1">
            <a href={`mailto:${email}`} className="hover:underline">
              {email}
            </a>
            <span className="text-gray-400">|</span>
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>

        <div className='flex flex-row gap-7 mt-8 mb-4'>
          <a href={twitter} target='_blank' rel='noopener noreferrer'>
            <img src='../../twitter.png' alt='twitter' className='w-5 h-5 my-2' />
          </a>
          <a href={instagram} target='_blank' rel='noopener noreferrer'>
            <img src='../../instagram.png' alt='instagram' className='w-5 h-5 my-2' />
          </a>
          <a href={socialLinkedin} target='_blank' rel='noopener noreferrer'>
            <img src='../../linkedin.png' alt='linkedin' className='w-5 h-5 my-2' />
          </a>
          <a href={tiktok} target='_blank' rel='noopener noreferrer'>
            <img src='../../tiktok.png' alt='tiktok' className='w-5 h-5 my-2' />
          </a>
          <a href={youtube} target='_blank' rel='noopener noreferrer'>
            <img src='../../youtube.png' alt='youtube' className='w-5 h-5 my-2' />
          </a>
        </div>
      </div>



      
     
    );
};


  return (
    <div>
      
      <div className="overflow-auto">
       <div className="text-left mb-8">
       <p className='text-4xl font-bold my-4' style={{fontFamily: 'CFont'}}>
                {name}
              </p>
        <div className="flex border-b border-gray-300 justify-left mt-4"></div>
      <div className='bg-white w-full font-poppins justify-center'>
      <div className='flex justify-center mt-4'>
      <div className='w-full grid grid-cols-1 lg:grid-cols-3 gap-8'> 
            <div className='col-span-1 lg:col-span-3 order-1 lg:order-1'>
              <img
                src={image}
                className='w-full h-auto object-fit rounded-lg'
                alt={name}
              />
            </div>
            
            <div className='col-span-1 mb-0 lg:col-span-2 order-2 lg:order-2 mr-0 lg:mr-6 p-4'> 
            <nav className="bg-white rounded-3xl">
                    <div className="max-w-6xl mx-auto py-2">
                      <div className="flex justify-start space-x-6">
                        <div className="flex border-b border-gray-300 rounded-3xl">
                          <button
                            onClick={() => handleTabChange('details')}
                            className={`text-sm mx-2 transition-colors duration-200 ${
                              activeTab === 'details'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-blue-600'
                            }`}
                            style={{ fontFamily: 'CFont' }}
                          >
                            details
                          </button>
                          <button
                            onClick={() => handleTabChange('formquestions')}
                            className={`text-sm mx-2 transition-colors duration-200 ${
                              activeTab === 'formquestions'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-blue-600'
                            }`}
                            style={{ fontFamily: 'CFont' }}
                          >
                            form questions
                          </button>
                        </div>
                      </div>
                    </div>
                  </nav>

                  {renderTabContent()}
                </div>


          <div 
                className='col-span-1 order-3 lg:order-3 lg:sticky lg:top-20 h-auto overflow-y-auto overflow-x-hidden p-4'
                style={{ 
                  
                  '-ms-overflow-style': 'none',
                  scrollbarWidth: 'none'
                }}
              >
                {/* Apply and contact details sections */}
                <div className='mt-4'>
                  <div className='flex justify-between mb-4'>
                    <button
                      // onClick={() => window.location.href = 'https://getseco.com/contact-1'}
                      className="rounded-xl text-sm text-black bg-[#F99F31] hover:text-gray-100 hover:bg-[#FACB82] w-full h-12 px-8"
                      style={{ fontFamily: 'CFont' }}
                    >
                      apply
                    </button>
                  </div>
                  {/* <div className='flex justify-between mb-4'>
      <div className='flex flex-row gap-2'>
        <div className='flex justify-center items-center w-10 h-12 rounded-lg text-gray-800'>
          <span className="material-icons">group</span> 
        </div>

        <div className='flex flex-col'>
        <p className='font-medium text-md'style={{
                    fontFamily: 'CFont',
                    
                    }}>{orgname}</p>
          <p className='text-sm text-gray-500'style={{
                    fontFamily: 'CFont',
                    
                    }}>organised by</p>
          
        </div>
      </div>
   

    </div> */}

    <div id='date' className='flex flex-row gap-2 mb-6 mt-6'> {/* Added bottom margin */}
      <div className='w-10 border-2 border-slate-300 rounded-md h-10'>
        <div className='bg-slate-300 text-xs text-center'style={{
                    fontFamily: 'CFont',
                    
                    }}>{formatMonth(formattedStartDate)}</div>
        <div><p className='text-center text-sm'style={{
                    fontFamily: 'CFont',
                    
                    }}>{formatDay(formattedStartDate)}</p></div>
      </div>
      <div>
      
        <p className='font-medium'style={{
                    fontFamily: 'CFont',
                    
                    }}>
        {formattedStartDate.toLocaleDateString("en-US", {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long',
        })}</p>
        <p className='text-sm text-gray-500'style={{
                    fontFamily: 'CFont',
                    
                    }}>Start Date</p>
      </div>
    </div>

    <div id='date' className='flex flex-row gap-2 mb-6 mt-6'> {/* Added bottom margin */}
      <div className='w-10 border-2 border-slate-300 rounded-md h-10'>
        <div className='bg-slate-300 text-xs text-center'style={{
                    fontFamily: 'CFont',
                    
                    }}>{formatMonth(formattedEndDate)}</div>
        <div><p className='text-center text-sm'style={{
                    fontFamily: 'CFont',
                    
                    }}>{formatDay(formattedEndDate)}</p></div>
      </div>
      <div>
      <p className='font-medium'style={{
                    fontFamily: 'CFont',
                    
                    }}>
        {formattedEndDate.toLocaleDateString("en-US", {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long',
        })}</p>
      <p className='text-sm text-gray-500'style={{
                    fontFamily: 'CFont',
                    
                    }}>End Date</p>
      
        
      </div>
      
    </div>
    {customFields && customFields.map((field, index) => {
          if (field.date) {
            const formattedDate = formatCustomFieldDate(field.date);
            return (
              <div key={index} id='date' className='flex flex-row gap-2 mb-6 mt-6'>
                <div className='w-10 border-2 border-slate-300 rounded-md h-10'>
                  <div className='bg-slate-300 text-xs text-center' style={{ fontFamily: 'CFont' }}>
                    {formattedDate.month}
                  </div>
                  <div>
                    <p className='text-center text-sm' style={{ fontFamily: 'CFont' }}>
                      {formattedDate.day}
                    </p>
                  </div>
                </div>
                <div>
                  <p className='font-medium' style={{ fontFamily: 'CFont' }}>
                    {formattedDate.fullDate}
                  </p>
                  <p className='text-sm text-gray-500' style={{ fontFamily: 'CFont' }}>
                    {field.name}
                  </p>
                </div>
              </div>
            );
          }
          return null;
        })}
    <div id='location' className='flex  flex-row gap-2 mb-6'> 
    <div className="w-10 border-2 border-slate-300 rounded-md h-10 flex items-center justify-center"> 
  <img
    src="../../location.png"
    alt="location"
    className="w-6 h-6"
  />
</div>

      <div>
      <p className='font-medium'style={{
                    fontFamily: 'CFont',
                    
                    }}>{location}</p>
        <p className='text-sm text-gray-500'style={{
                    fontFamily: 'CFont',
                    
                    }}>location</p>
       
      </div>
    </div>

   

    <div id="Hosted" className="mb-6"> {/* Added bottom margin */}
  <p style={{ fontFamily: "CFont" }}>sectors</p>
  <hr className="my-4 border-t border-slate-300 mt-6" />
  <div className="flex flex-wrap gap-2 mt-2" style={{ fontFamily: "CFont" }}>
    {/* Loop through categories array and render each item individually */}
    {categories.map((category, index) => (
      <div key={index} className="bg-gray-200 rounded-full px-2 py-1 text-xs">
        {category}
      </div>
    ))}
  </div>
</div>

{renderContactSection()}

{/* */}


  </div>
</div>
</div>
        </div>
      </div>
     </div>
     </div>
    </div>
  );
};

export default FProgramDetailPage;
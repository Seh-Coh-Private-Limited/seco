// import React from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import './ProgramDetailPage.css';

// const ProgramDetail = () => {
//   const navigate = useNavigate();
//   const { state } = useLocation();
//   const { programDetails } = state || {};

//   if (!programDetails) {
//     return <p>No program details available.</p>;
//   }

//   const {
//     title,
//     image,
//     endDate,
//     description,
//     location,
//     startDate,
//     eligibility,
//     incentives,
//     organizerDetails,
//     logos,
//     portfolioCompanies,
//     faqs,
//     contactInfo,
//   } = programDetails;

  
//   const formattedStartDate = new Date(startDate);
//   const formattedEndDate = new Date(endDate);

//   const formatMonth = (date) => date.toLocaleString('default', { month: 'short' }).toUpperCase();
//   const formatDay = (date) => date.getDate();
//   const formatFullDate = (date) => date.toLocaleDateString('en-US', {
//     weekday: 'long',
//     year: 'numeric',
//     month: 'long',
//     day: 'numeric'
//   });

//   return (
//     <div className="program-detail-page">
//       <div className="d-content">
//         {image && <img src={image} alt={title} className="program-image" />}

//         {/* Header with left and right sections */}
//         <div className="p-header">
//         <div className="left-section">
//   <h1>{title}</h1>
//   <div className="location-and-dates">
//   <div className="p-date-and-location">
//   <div className="p-timeline-container">
//   <div className="p-date-section" style={{ display: 'flex', alignItems: 'center' }}>
//     <div className="calendar-card">
//       <div className="month">{formatMonth(formattedStartDate)}</div>
//       <div className="day">{formatDay(formattedStartDate)}</div>
//     </div>
//     <div style={{ marginLeft: '40px' }}> {/* Add some space between the card and the date text */}
//       <div className="label">Start</div>
//       <div className="date-text">
//         {formattedStartDate.toLocaleDateString("en-US", {
//           year: 'numeric',
//           month: 'long',
//           day: 'numeric'
//         })}
//       </div>
//     </div>
//   </div>

//   <div className="p-timeline-connector"></div>

//   <div className="p-date-section" style={{ display: 'flex', alignItems: 'center' }}>
//     <div className="calendar-card">
//       <div className="month">{formatMonth(formattedEndDate)}</div>
//       <div className="day">{formatDay(formattedEndDate)}</div>
//     </div>
//     <div style={{ marginLeft: '10px' }}> {/* Add some space between the card and the date text */}
//       <div className="label">End</div>
//       <div className="date-text">
//         {formattedEndDate.toLocaleDateString("en-US", {
//           year: 'numeric',
//           month: 'long',
//           day: 'numeric'
//         })}
//       </div>
//     </div>
//   </div>
// </div>


//   <div className="location">
//     <div className="location-icon">
//       <svg
//         width="38"
//         height="34"
//         viewBox="0 0 24 24"
//         fill="none"
//         stroke="currentColor"
//         strokeWidth="2"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       >
//         <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
//         <circle cx="12" cy="10" r="3" />
//       </svg>
//       <span className="loc">{location}</span>
//     </div>
//   </div>
// </div>

// </div>


// </div>


//           <div className="right-section">
            
//           <div className="about-section">
//           <h2>About Event</h2>
//           <hr />
//           <p className="event-description">{description}</p>

         

//           <h3 className="section-title">Eligibility</h3>
//           <hr />
//           <p>{eligibility}</p>


//           <h3 className="section-title">Organizer Details</h3>
//           <hr />
//           <p>{organizerDetails}</p>
          
//           <h3 className="section-title">Portfolio</h3>
//           <hr />
//           <p>{portfolioCompanies}</p>
//           <h3 className="section-title">Logos</h3>
//           <hr />
//           <p>{logos}</p>
//           {incentives && (
//             <>
//               <h3 className="section-title">FAQs</h3>
//               <hr />
//               <p><strong>Question:</strong> {faqs.Question}</p>
//               <p><strong>Answer:</strong> {faqs.Answer}</p>
//             </>
//           )}

//           {incentives && (
//             <>
//               <h3 className="section-title">Incentives</h3>
//               <hr />
//               <p><strong>Fiscal:</strong> {incentives.fiscal}</p>
//               <p><strong>Non-Fiscal:</strong> {incentives.nonFiscal}</p>
//             </>
//           )}

          

//           {contactInfo && (
//             <>
//               <h3 className="section-title">Contact Information</h3>
//               <hr />
//               <p><strong>Contact Person:</strong> {contactInfo.contactPerson}</p>
//               <p><strong>Email:</strong> <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a></p>
//               <p><strong>Website:</strong> <a href={contactInfo.website} target="_blank" rel="noopener noreferrer">{contactInfo.website}</a></p>
//             </>
//           )}
//         </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProgramDetail;




import Slider from 'react-slick';
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import './ProgramDetailPage.css';

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchProgramById } from '../components/fetchProgram';

import { Link } from 'react-scroll';
import Footer from '../components/footer';
import Header from '../components/Header';

const ProgramDetail = () => {
  const loc = useLocation(); // Get the location object
  const { program } = loc.state || {}; // Destructure the program from state
  const [programDetails, setProgramDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('Details');



  const [openIndex, setOpenIndex] = useState(null);

  const toggleAnswer = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };



  useEffect(() => {
    // Fetch the program details using the id
    const fetchProgram = async () => {
      if (program) {
        const fetchedProgram = await fetchProgramById(program); // Fetch the program using the id
        setProgramDetails(fetchedProgram); // Store the fetched program details in state
      }
    };

    fetchProgram(); // Call the fetch function
  }, [program]); // Only run this effect when the program id changes

  if (!programDetails) {
    return <p>No program details available.</p>; // Render a message if details are not available
  }

  const {
    title,
    orgname,
    tag,
    image,
    endDate,
    description,
    industry,
    location,
    startDate,
    eligibility,
    incentives,
    organizerDetails,
    logos,
    portfolioCompanies,
    faqs,
    contactInfo,
  } = programDetails;
  const settings = {
    dots: true,
    infinite: true, // Looping enabled
    speed: 100,
    slidesToShow: 3, // Show 3 cards at a time
    slidesToScroll: 3, // Scroll 3 cards at a time
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2, // Show 2 cards at medium screens
          slidesToScroll: 2,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1, // Show 1 card at small screens
          slidesToScroll: 1,
        }
      }
    ]
  };
  const formattedStartDate = new Date(startDate);
  const formattedEndDate = new Date(endDate);

  const formatMonth = (date) => date.toLocaleString('default', { month: 'short' }).toUpperCase();
  const formatDay = (date) => date.getDate();
  const formatFullDate = (date) => date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const handleToggle = (e) => {
    const answer = e.currentTarget.nextElementSibling;
    if (answer.style.display === "none" || answer.style.display === "") {
      answer.style.display = "block";
      e.currentTarget.textContent = "-"; // Change icon to minus
    } else {
      answer.style.display = "none";
      e.currentTarget.textContent = "+"; // Change icon to plus
    }
  };

  const handleSetActive = (to) => {
    setActiveTab(to);
  };

  return (
    <div>
      <Header />
    <div className='bg-white h-full w-full font-poppins justify-center mt-36'>
      
      <div className='w-full flex justify-center mt-4 '>
        <div className='w-full lg:w-4/6 grid grid-cols-1 lg:grid-cols-3 gap-8 '> {/* Increased width and added gap */}
          
          <div className='col-span-1 lg:col-span-3 order-1 lg:order-1 p-4'>
          <img
  src={image}
  className='w-full h-auto object-fit rounded-lg'
  alt='ai-salon'
/>

          </div>
          <div className='col-span-1 mb-0 lg:col-span-2 order-2 lg:order-2 mr-0 lg:mr-6 p-4'> 
          <div className='text-sm inline-flex items-center gap-2 bg-slate-300 p-1 rounded-md'>
      <span className="material-icons text-gray-700" style={{ fontSize: '1rem' }}>
        star
      </span>
      {/* Featured Icon */}
      <p style={{
                    fontFamily: 'CFont',
                    
                    }}>
        featured in <span className='font-medium'style={{
                    fontFamily: 'CFont',
                    
                    }}>{tag}</span>
      </p>
    </div>

            <p className='text-4xl font-bold my-4' style={{
                    fontFamily: 'CFont',
                    
                    }}>
              {title}
            </p>

            <nav className="bg-white border border-gray-300 rounded-3xl">
      <div className="max-w-6xl mx-auto px-4 py-2 flex">
        <div className="flex w-full justify-between ml-2">
          <Link 
            to="details" 
            smooth={true} 
            duration={500} 
            className={`text-gray-700 text-sm hover:text-blue-600 relative mx-2 ${activeTab === 'Details' ? 'border-blue-600 pb-1' : ''}`}

            onSetActive={() => handleSetActive('Details')}
            style={{
              fontFamily: 'CFont',
              
              }}
          >
            details
          </Link>
          <Link 
            to="eligibility" 
            smooth={true} 
            duration={500} 
            className={`text-sm text-gray-500  hover:text-blue-600 relative
            ${activeTab === 'Eligibility' ? 'border-blue-600 pb-1' : ''} mx-2`}
            onSetActive={() => handleSetActive('Eligibility')}
            style={{
              fontFamily: 'CFont',
              
              }}
          >
            eligibility
          </Link>
          <Link 
            to="incentives" 
            smooth={true} 
            duration={500} 
            className={`text-sm text-gray-500 hover:text-blue-600 relative
            ${activeTab === 'Incentives' ? 'border-blue-600 pb-1' : ''}    mx-2`}
            onSetActive={() => handleSetActive('Incentives')}
            style={{
              fontFamily: 'CFont',
              
              }}
          >
            incentives
          </Link>
          <Link 
            to="portfolio" 
            smooth={true} 
            duration={500} 
            className={`text-sm text-gray-500  hover:text-blue-600 relative
            ${activeTab === 'Portfolio' ? 'border-blue-600 pb-1' : ''} mx-2`}
            onSetActive={() => handleSetActive('Portfolio')}
            style={{
              fontFamily: 'CFont',
              
              }}
          >
            portfolio
          </Link>
          
            <Link 
              to="faq" 
              smooth={true} 
              duration={500} 
              className={`text-sm text-gray-500  hover:text-blue-600 relative
              ${activeTab === 'FAQs' ? 'border-blue-600 pb-1' : ''} mx-2`}
              onSetActive={() => handleSetActive('FAQs')}
              style={{
                fontFamily: 'CFont',
                
                }}
            >
              faqs
            </Link>
          
        </div>
      </div>
    </nav>
          
            

            <div id='details' className='mt-6'>
              <p className='font-medium'style={{
                    fontFamily: 'CFont',
                    textTransform: 'lowercase' 
                    }}>details</p>
              <hr className='my-4 border-t border-gray-300' />
              <div className='flex flex-col gap-6'>
                <p style={{
                    fontFamily: 'CFont',
                    textTransform: 'lowercase' 
                    }}>{description}</p>
                
               
              </div>
            </div>

            <div id='eligibility' className='mt-6'>
              <p className='font-medium'style={{
                    fontFamily: 'CFont',
                    textTransform: 'lowercase' 
                    }}>eligibility</p>
              <hr className='my-4 border-t border-gray-300' />
              <div className='flex flex-col gap-6'>
                <p style={{
                    fontFamily: 'CFont',
                    textTransform: 'lowercase' 
                    }}>{eligibility[0]}</p>
                <p style={{
                    fontFamily: 'CFont',
                    textTransform: 'lowercase' 
                    }}>startup stage for applications:</p>
                <p>
   {eligibility[1] && typeof eligibility[1] === 'string' ? eligibility[1].split('+').map((item, index) => (
     <span key={index}style={{
      fontFamily: 'CFont',
      textTransform: 'lowercase' 
      }}>
       -{item}
       <br />
     </span>
   )) : null}
                </p>
                
                <p style={{
                    fontFamily: 'CFont',
                    textTransform: 'lowercase' 
                    }}>For:</p>
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
              <p className='font-medium'style={{
                    fontFamily: 'CFont',
                    
                    }}>incentives</p>
              <hr className='my-4 border-t border-gray-300' />
              <div className='flex flex-col gap-6'>
                
                <p style={{
                    fontFamily: 'CFont',
                    
                    }}>fiscal incentives:</p>
                <p style={{
                    fontFamily: 'CFont',
                    textTransform: 'lowercase' 
                    }}>
                  -{incentives.fiscal}
                </p>
                
                <p style={{
                    fontFamily: 'CFont',
                    textTransform: 'lowercase' 
                    }}>non-fiscal incentives:</p>
                
                <p style={{
                    fontFamily: 'CFont',
                    textTransform: 'lowercase' 
                    }}>-{incentives.nonFiscal}</p>
              </div>
            </div>
            <div id='portfolio' className='mt-6'>
              <p className='font-medium'style={{
                    fontFamily: 'CFont',
                    
                    }}>portfolio</p>
              <hr className='my-4 border-t border-gray-300' />
              <div className='flex flex-col gap-6'>
                <p style={{
                    fontFamily: 'CFont',
                    
                    }}>about:</p>
                <p style={{
                    fontFamily: 'CFont',
                    textTransform: 'lowercase' 
                    }}>
{organizerDetails}                </p>
                
                <p style={{
                    fontFamily: 'CFont',
                    
                    }}>portfolio companies:</p>
                <p style={{
                    fontFamily: 'CFont',
                    
                    }}>{portfolioCompanies}</p>
                <div>
      <p style={{
                    fontFamily: 'CFont',
                    
                    }}>logos:</p>
      <Slider {...settings}>
        {logos.map((logo, index) => (
          <div key={index} className="p-4">
            <img 
              src={logo} 
              alt={`Logo ${index + 1}`} 
              className="mx-auto" 
              style={{ maxWidth: '100%', height: '80px' }} // Responsive image
            />
          </div>
        ))}
      </Slider>
    </div>
              </div>
            </div>
            <div id='faq' className='mt-6 lg:mb-48'>
      <p className='font-medium'style={{
                    fontFamily: 'CFont',
                    
                    }}>faqs</p>
      <hr className='my-4 border-t border-gray-300' />
      <div className='flex flex-col gap-6'>
        {faqs.map((faq, index) => (
          <div key={index} className='border-b border-gray-200 pb-2'>
            <div
              className='flex justify-between cursor-pointer'
              onClick={() => toggleAnswer(index)}
            >
              <p className='font-semibold'style={{
                    fontFamily: 'CFont',
                    textTransform: 'lowercase' 
                    
                    }}>{faq.question}</p>
              <span className={`transform transition-transform ${openIndex === index ? 'rotate-180' : ''}`}>
                <span className='material-icons'>expand_more</span>
              </span>
            </div>
            {openIndex === index && (
              <div className='mt-2 text-gray-600'style={{
                fontFamily: 'CFont',
                textTransform: 'lowercase' 
                }}>
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
          </div>

          
          <div className='col-span-1 mb-10 order-3 lg:order-3 lg:sticky lg:top-20 lg:h-[calc(100vh-4rem)] overflow-auto lg:mb-40 p-4'>
  <div className='mt-4'>
    <div className='flex justify-between mb-4'> {/* Added bottom margin */}
      <div className='flex flex-row gap-2'>
        <div className='flex justify-center items-center w-10 h-12 rounded-lg text-gray-800'>
          <span className="material-icons">group</span> {/* Organizer Icon */}
        </div>

        <div className='flex flex-col'>
          <p className='text-sm'style={{
                    fontFamily: 'CFont',
                    
                    }}>organised by</p>
          <p className='font-medium text-md'style={{
                    fontFamily: 'CFont',
                    
                    }}>{orgname}</p>
        </div>
      </div>
      <button
  onClick={() => window.location.href = 'https://twisteddco.wixstudio.io/getseco/contact-1'}
  className="rounded-xl text-sm text-slate-700 bg-slate-300 hover:text-gray-100 hover:bg-slate-700 px-8"
  style={{ fontFamily: 'CFont' }}
>
  apply
</button>

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
          day: 'numeric'
        })}</p>
        <p className='text-sm text-gray-500'style={{
                    fontFamily: 'CFont',
                    
                    }}>deadline</p>
      </div>
    </div>

    <div id='location' className='flex  flex-row gap-2 mb-6'> {/* Added bottom margin */}
      <div className='w-10 border-2 flex  border-slate-300 rounded-md h-10'>
        <img src='../../location.png' alt='location' className='w-7 h-6 ml-1 mt-2' />
      </div>
      <div>
        <p className='font-medium'style={{
                    fontFamily: 'CFont',
                    
                    }}>location</p>
        <p className='text-sm text-gray-500'style={{
                    fontFamily: 'CFont',
                    
                    }}>{location}</p>
      </div>
    </div>

   

    <div id='Hosted' className='mb-4'> {/* Added bottom margin */}
      <p style={{
                    fontFamily: 'CFont',
                    
                    }}>industry</p>
      <hr className='my-4 border-t border-slate-300' />
      <div className='flex flex-wrap gap-2'style={{
                    fontFamily: 'CFont',
                    
                    }}> {/* Allows items to wrap */}
        {industry.map((industry, index) => (
          <div key={index} className='bg-gray-200 rounded-full px-2 py-1 text-xs'>
            {industry}
          </div>
        ))}
      </div>
    </div>


<div className='text-sm mt-2'>
  <p className='mb-2'style={{
                    fontFamily: 'CFont',
                    
                    }}>contact the host</p>
  <hr className='my-4 border-t border-gray-300' />

  <div className='mb-4'> {/* Added margin for spacing */}
    <p className='font-medium mb-4'style={{
                    fontFamily: 'CFont',
                    
                    }}> {/* Added margin bottom */}
      person In Charge: 
      <a className='text-sm text-gray-500 ml-2'style={{
                    fontFamily: 'CFont',
                    
                    }}>{contactInfo.contactPerson}</a> {/* Added margin left */}
    </p>
    <p className='font-medium mb-4'style={{
                    fontFamily: 'CFont',
                    
                    }}> {/* Added margin bottom */}
      designation: 
      <a className='text-sm text-gray-500 ml-2'style={{
                    fontFamily: 'CFont',
                    
                    }}>{contactInfo.designation}</a> {/* Added margin left */}
    </p>
    <p className='font-medium mb-4'style={{
                    fontFamily: 'CFont',
                    
                    }}> {/* Added margin bottom */}
      email ID:
      <a href='mailto:atoms@accel.com' className='text-sm text-gray-500 ml-2'style={{
                    fontFamily: 'CFont',
                    
                    }}> {contactInfo.email}</a> {/* Added margin left */}
    </p>
    <p className='font-medium mb-4'style={{
                    fontFamily: 'CFont',
                    
                    }}> {/* Added margin bottom */}
      website:
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
                    
                    }}>report event</p>
</div>


  </div>
</div>
</div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProgramDetail;

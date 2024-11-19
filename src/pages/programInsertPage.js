import React, { useState } from 'react';
import { db } from '../firebase'; // Adjust the path based on your structure
import { collection, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Import necessary Firebase Storage functions
import './InsertProgram.css'; // Include CSS for styling

function InsertProgram() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [fiscalIncentives, setFiscalIncentives] = useState('');
  const [nonFiscalIncentives, setNonFiscalIncentives] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [resultDate, setResultDate] = useState('');
  const [organizerDetails, setOrganizerDetails] = useState('');
  const [portfolioCompanies, setPortfolioCompanies] = useState('');
  const [image, setImage] = useState(null); // State for program image file
  const [logos, setLogos] = useState([]); // State for logo files
  const [contactPerson, setContactPerson] = useState('');
  const [designation, setDesignation] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [socialMedia, setSocialMedia] = useState({ twitter: '', linkedin: '' });
  const [faqs, setFaqs] = useState([{ question: '', answer: '' }]);

  const handleFaqChange = (index, field, value) => {
    const updatedFaqs = [...faqs];
    updatedFaqs[index][field] = value;
    setFaqs(updatedFaqs);
  };

  const handleAddFaq = () => {
    setFaqs([...faqs, { question: '', answer: '' }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const storage = getStorage();
    const logoUrls = [];
    
    // Upload logos if they exist
    for (const logo of logos) {
      const logoRef = ref(storage, `logos/${logo.name}`);
      await uploadBytes(logoRef, logo);
      const logoUrl = await getDownloadURL(logoRef);
      logoUrls.push(logoUrl);
    }

    // Upload program image if it exists
    let imageUrl = '';
    if (image) {
      const imageRef = ref(storage, `images/${image.name}`);
      await uploadBytes(imageRef, image);
      imageUrl = await getDownloadURL(imageRef);
    }

    try {
      await addDoc(collection(db, 'programmes'), {
        title,
        id: Math.floor(Math.random() * 1000000000), // Generate a random ID
        image: imageUrl, // Save the uploaded image URL
        description,
        industry: industry.split(',').map(i => i.trim()), // Comma-separated industries
        location,
        eligibility,
        incentives: {
          fiscal: fiscalIncentives,
          nonFiscal: nonFiscalIncentives,
        },
        startDate,
        endDate,
        resultDate,
        organizerDetails,
        portfolioCompanies,
        logos: logoUrls, // Save the uploaded logos URLs
        contactInfo: {
          contactPerson,
          designation,
          email,
          website,
          socialMedia,
        },
        faqs,
      });
      alert('Program added successfully!');
    } catch (err) {
      console.error('Error adding program:', err);
    }
  };

  return (
    <form className="insert-program-form" onSubmit={handleSubmit}>
      <h2 className="form-title">Insert New Program</h2>

      <label className="form-label">Title:</label>
      <input className="form-input" type="text" value={title} onChange={e => setTitle(e.target.value)} required />

      <label className="form-label">Description:</label>
      <textarea className="form-textarea" value={description} onChange={e => setDescription(e.target.value)} required />

      <label className="form-label">Industry (comma separated):</label>
      <input className="form-input" type="text" value={industry} onChange={e => setIndustry(e.target.value)} required />

      <label className="form-label">Location:</label>
      <input className="form-input" type="text" value={location} onChange={e => setLocation(e.target.value)} required />

      <label className="form-label">Eligibility:</label>
      <input className="form-input" type="text" value={eligibility} onChange={e => setEligibility(e.target.value)} required />

      <label className="form-label">Fiscal Incentives:</label>
      <input className="form-input" type="text" value={fiscalIncentives} onChange={e => setFiscalIncentives(e.target.value)} required />

      <label className="form-label">Non-Fiscal Incentives:</label>
      <input className="form-input" type="text" value={nonFiscalIncentives} onChange={e => setNonFiscalIncentives(e.target.value)} required />

      <label className="form-label">Start Date:</label>
      <input className="form-input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />

      <label className="form-label">End Date:</label>
      <input className="form-input" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />

      <label className="form-label">Result Date:</label>
      <input className="form-input" type="date" value={resultDate} onChange={e => setResultDate(e.target.value)} required />

      {/* Organizer Details */}
      <label className="form-label">Organizer Details:</label>
      <textarea className="form-textarea" value={organizerDetails} onChange={e => setOrganizerDetails(e.target.value)} required />

      {/* Portfolio Companies */}
      <label className="form-label">Portfolio Companies:</label>
      <textarea className="form-textarea" value={portfolioCompanies} onChange={e => setPortfolioCompanies(e.target.value)} required />

      {/* Image Upload */}
      <label className="form-label">Program Image:</label>
      <input className="form-input" type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} required />

      {/* Logo Upload */}
      <label className="form-label">Logos (upload multiple images):</label>
      <input className="form-input" type="file" accept="image/*" multiple onChange={e => setLogos(Array.from(e.target.files))} required />

      {/* Contact Info */}
      <h3 className="contact-info-title">Contact Information</h3>

      <label className="form-label">Contact Person:</label>
      <input className="form-input" type="text" value={contactPerson} onChange={e => setContactPerson(e.target.value)} required />

      <label className="form-label">Designation:</label>
      <input className="form-input" type="text" value={designation} onChange={e => setDesignation(e.target.value)} required />

      <label className="form-label">Email:</label>
      <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />

      <label className="form-label">Website:</label>
      <input className="form-input" type="url" value={website} onChange={e => setWebsite(e.target.value)} required />

      {/* Social Media */}
      <h4 className="social-media-title">Social Media Handles</h4>

      <label className="form-label">Twitter:</label>
      <input className="form-input" type="url" value={socialMedia.twitter} onChange={e => setSocialMedia({ ...socialMedia, twitter: e.target.value })} />

      <label className="form-label">LinkedIn:</label>
      <input className="form-input" type="url" value={socialMedia.linkedin} onChange={e => setSocialMedia({ ...socialMedia, linkedin: e.target.value })} />

      {/* FAQs */}
      <h3 className="faqs-title">FAQs</h3>
      {faqs.map((faq, index) => (
        <div key={index} className="faq-item">
          <label className="form-label">Question {index + 1}:</label>
          <input
            className="form-input"
            type="text"
            value={faq.question}
            onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
            required
          />
          <label className="form-label">Answer {index + 1}:</label>
          <input
            className="form-input"
            type="text"
            value={faq.answer}
            onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
            required
          />
        </div>
      ))}
      <button type="button" className="i-button" onClick={handleAddFaq}>Add FAQ</button>

      <button type="submit" className="i-button">Add Program</button>
    </form>
  );
}

export default InsertProgram;

import { getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import ContactRow from './ContactRow';
import { deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { auth,firestore } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useRef,useCallback } from 'react';
import debounce from 'lodash/debounce';
import {
  Globe,
  Instagram,
  Linkedin,
  Music2,
  Plus,
  Twitter,
  X,
  Youtube
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
const defaultContactFields = {
  email: '',
  firstName: '',
  lastName: '',
  mobile: '',
  linkedin:'',
  designation: ''
};
const defaultFormData = {
    companyName: '',
    bio: '',
    DomainName:'',
    cityState: '',
    social: {
      instagram: '',
      twitter: '',
      youtube: '',
      tiktok: '',
      linkedin: '',
      website: ''
    },
    contacts: [defaultContactFields] 
  };
const IncubatorSettingsForm = ({ onProfileUpdate }) => {
    const auth = getAuth();
    const [currentCity, setCurrentCity] = useState(null);
    // const [formData, setFormData] = useState(defaultFormData);
    const [formData, setFormData] = React.useState({
      contact: [], // Initialize contact as an empty array
    });
    
    
    const [saveStatus, setSaveStatus] = useState(''); // Add status for save feedback

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const storage = getStorage();

    const [imagePreview, setImagePreview] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(false);
  const bioTextareaRef = useRef(null);
  
      // Enhanced useEffect to handle initial sizing and content changes
      useEffect(() => {
        const textarea = bioTextareaRef.current;
        if (textarea) {
          // Reset height to auto to get the correct scrollHeight
          textarea.style.height = 'auto';
          // Set height to match content, including padding
          textarea.style.height = `${textarea.scrollHeight + 2}px`; // Adding 2px for padding (adjust as needed)
          
          // Add an event listener for manual resizing to maintain content visibility
          const handleResize = () => {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight + 2}px`;
          };
    
          textarea.addEventListener('input', handleResize);
          return () => textarea.removeEventListener('input', handleResize); // Cleanup
        }
      }, [formData.bio]); // Run when bio content changes
    useEffect(() => {
      const fetchUserData = async () => {
        const user = auth.currentUser;
        if (user?.uid) {
          try {
            const db = getFirestore();
            const userDoc = doc(db, 'users', user.uid);
            const docSnap = await getDoc(userDoc);
  
            if (docSnap.exists()) {
              const data = docSnap.data();
  
              if (data.logoUrl) {
                setImagePreview(data.logoUrl);
              }
  
              setFormData({
                companyName: data.companyName || '',
                bio: data.bio || '',
                DomainName: data.DomainName || '',
                cityState: data.cityState || '',
                social: {
                  instagram: data.social?.instagram || '',
                  twitter: data.social?.twitter || '',
                  youtube: data.social?.youtube || '',
                  tiktok: data.social?.tiktok || '',
                  linkedin: data.social?.linkedin || '',
                  website: data.social?.website || '',
                },
                contacts: Array.isArray(data.contacts) ? data.contacts : [defaultContactFields],
                logoUrl: data.logoUrl || ''
              });
            } else {
              setFormData(defaultFormData);
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
            setError('Failed to load settings. Please try again later.');
          }
        }
        setLoading(false);
      };
  
      fetchUserData();
    }, [auth.currentUser]);
    
    const debouncedSave = useCallback(
      debounce(async (data) => {
        const user = auth.currentUser;
        if (!user?.uid) {
          setSaveStatus('Error: Not logged in');
          return;
        }

        try {
          const db = getFirestore();
          await setDoc(doc(db, 'users', user.uid), data, { merge: true });
          if (onProfileUpdate) {
            await onProfileUpdate();
          }
          setSaveStatus('Saved');
          // Clear the status after 2 seconds
          setTimeout(() => setSaveStatus(''), 2000);
        } catch (error) {
          console.error('Error saving settings:', error);
          setSaveStatus('Error saving');
        }
      }, 1000), // Wait 1 second after last change before saving
      [auth.currentUser, onProfileUpdate]
    );
    const [isConfirming, setIsConfirming] = useState(false);
    const navigate = useNavigate();
  
    const handleDeleteAccountInitiate = () => {
      setIsConfirming(true);
    };
  
    const handleConfirmDelete = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError('No user logged in. Please log in and try again.');
          setIsConfirming(false);
          return;
        }
    
        // Get the Firestore instance
        const db = getFirestore();
    
        // Delete user's programs
        const programsQuery = query(
          collection(db, 'programmes'), 
          where('uid', '==', user.uid)
        );
        const programsSnapshot = await getDocs(programsQuery);
        
        const deleteProgramPromises = programsSnapshot.docs.map(
          (programDoc) => deleteDoc(programDoc.ref)
        );
        await Promise.all(deleteProgramPromises);
    
        // Delete user's logo from storage if exists
        if (formData.logoUrl) {
          const logoRef = ref(storage, formData.logoUrl);
          await deleteObject(logoRef);
        }
    
        // Delete user document from users collection
        await deleteDoc(doc(db, 'users', user.uid));
    
        // Delete Firebase Authentication user
        await deleteUser(user);
        alert('Account deleted successfully!');
        // Navigate to sign-in page
        navigate('/signup');
      } catch (error) {
        console.error('Error deleting account:', error);
        setError(`Failed to delete account: ${error.message}`);
        setIsConfirming(false);
      }
    };
  
    const handleCancelDelete = () => {
      setIsConfirming(false);
    };
    const handleContactImageUpload = useCallback(async (index, file) => {
        if (!file) return;
    
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
          setError('Please upload a valid image file (JPEG, PNG, or GIF)');
          return;
        }
    
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
          setError('Image size should be less than 5MB');
          return;
        }
    
        try {
          setUploadProgress(true);
          const user = auth.currentUser;
          const storageRef = ref(storage, `contacts/${user.uid}/${index}/${file.name}`);
          await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(storageRef);
    
          const newFormData = {
            ...formData,
            contacts: formData.contacts.map((contact, i) =>
              i === index ? { ...contact, imageUrl: downloadURL } : contact
            ),
          };
    
          if (formData.contacts[index].imageUrl) {
            const oldImageRef = ref(storage, formData.contacts[index].imageUrl);
            await deleteObject(oldImageRef).catch((err) => console.error('Error deleting old contact image:', err));
          }
    
          setFormData(newFormData);
          setSaveStatus('Saving...');
          debouncedSave(newFormData);
          setError('');
        } catch (error) {
          console.error('Error uploading contact image:', error);
          setError('Failed to upload contact image.');
        } finally {
          setUploadProgress(false);
        }
      }, [auth, formData, storage, debouncedSave]);
    
      const handleRemoveContactImage = async (index) => {
        const contact = formData.contacts[index];
        if (!contact.imageUrl) return;
    
        try {
          const imageRef = ref(storage, contact.imageUrl);
          await deleteObject(imageRef);
          const newFormData = {
            ...formData,
            contacts: formData.contacts.map((c, i) =>
              i === index ? { ...c, imageUrl: '' } : c
            ),
          };
          setFormData(newFormData);
          setSaveStatus('Saving...');
          debouncedSave(newFormData);
        } catch (error) {
          console.error('Error removing contact image:', error);
          setError('Failed to remove contact image.');
        }
      };
    // Modified input change handler with auto-save
    const handleInputChange = (section, field, value) => {
      const newFormData = {
        ...formData,
        [section ? section : field]: section
          ? {
              ...(formData[section] || {}),
              [field]: value,
            }
          : value,
      };
      
      setFormData(newFormData);
      setSaveStatus('Saving...');
      debouncedSave(newFormData);
  
      // Resize textarea if it's the bio field
      if (!section && field === 'bio' && bioTextareaRef.current) {
        const textarea = bioTextareaRef.current;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight + 2}px`; // Adding padding adjustment
      }
    };
    const handleAddContact = () => {
      const newFormData = {
        ...formData,
        contacts: [...formData.contacts, { ...defaultContactFields }],
      };
      setFormData(newFormData);
      setSaveStatus('Saving...');
      debouncedSave(newFormData);
    };

    const handleRemoveContact = (index) => {
      if (formData.contacts.length === 1) return;
      
      const newFormData = {
        ...formData,
        contacts: formData.contacts.filter((_, i) => i !== index),
      };
      setFormData(newFormData);
      setSaveStatus('Saving...');
      debouncedSave(newFormData);
    };

    const handleContactChange = (index, field, value) => {
      const newFormData = {
        ...formData,
        contacts: formData.contacts.map((contact, i) =>
          i === index ? { ...contact, [field]: value } : contact
        ),
      };
      setFormData(newFormData);
      setSaveStatus('Saving...');
      debouncedSave(newFormData);
    };
  
      const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
      
        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
          setError('Please upload a valid image file (JPEG, PNG, or GIF)');
          return;
        }
      
        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
          setError('Image size should be less than 5MB');
          return;
        }
      
        try {
          setUploadProgress(true);
          const user = auth.currentUser;
          
          // Create a reference to the new image
          const storageRef = ref(storage, `logos/${user.uid}/${file.name}`);
          
          // Upload the file
          await uploadBytes(storageRef, file);
          
          // Get the download URL
          const downloadURL = await getDownloadURL(storageRef);
          
          // Delete the old image if it exists
          if (formData.logoUrl) {
            try {
              const oldImageRef = ref(storage, formData.logoUrl);
              await deleteObject(oldImageRef);
            } catch (error) {
              console.error('Error deleting old image:', error);
            }
          }
          
          // Update preview and form data
          setImagePreview(downloadURL);
          const newFormData = {
            ...formData,
            logoUrl: downloadURL,
          };
          setFormData(newFormData);
          setSaveStatus('Saving...');
          debouncedSave(newFormData);
          setError('');
        } catch (error) {
          console.error('Error uploading image:', error);
          setError('Failed to upload image. Please try again.');
        } finally {
          setUploadProgress(false);
        }
      };
  
      const handleRemoveImage = async () => {
        if (!formData.logoUrl) return;
  
        try {
          const imageRef = ref(storage, formData.logoUrl);
          await deleteObject(imageRef);
          
          const newFormData = {
            ...formData,
            logoUrl: '',
          };
          setImagePreview(null);
          setFormData(newFormData);
          setSaveStatus('Saving...');
          debouncedSave(newFormData);
        } catch (error) {
          console.error('Error removing image:', error);
          setError('Failed to remove image. Please try again.');
        }
      };
  
      const handleSubmit = async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
      
        if (!user?.uid) {
          setError('Please log in to update settings');
          return;
        }
      
        try {
          const db = getFirestore();
          await setDoc(doc(db, 'users', user.uid), formData, { merge: true });
          if (onProfileUpdate) {
            await onProfileUpdate();
          }
          alert('Settings updated successfully!');
          setError('');
        } catch (error) {
          console.error('Error updating settings:', error);
          setError('Failed to update settings. Please try again.');
        }
      };
      
  
    if (loading) {
      return (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      );
    }
  
    if (error) {
      return (
        <div className="px-4 md:px-56">
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-4">
            {error}
          </div>
          {/* Show the form even if there's an error */}
        </div>
      );
    }
    const LocationSearchInput = ({ onSelect }) => {
      const [query, setQuery] = useState('');
      const [suggestions, setSuggestions] = useState([]);
      const [isOpen, setIsOpen] = useState(false);
      const [loading, setLoading] = useState(false);
      const wrapperRef = useRef(null);
      const [isCustomEntry, setIsCustomEntry] = useState(false);

      // Major Indian cities with states
      const staticLocations = [
        "Mumbai, Maharashtra",
        "Delhi, National Capital Territory",
        "Bangalore, Karnataka",
        "Hyderabad, Telangana",
        "Chennai, Tamil Nadu",
        "Kolkata, West Bengal",
        "Pune, Maharashtra",
        "Ahmedabad, Gujarat",
        "Jaipur, Rajasthan",
        "Lucknow, Uttar Pradesh",
        "Chandigarh, Punjab & Haryana",
        "Bhopal, Madhya Pradesh",
        "Visakhapatnam, Andhra Pradesh",
        "Kochi, Kerala",
        "Indore, Madhya Pradesh",
        "Nagpur, Maharashtra",
        "Thiruvananthapuram, Kerala",
        "Bhubaneswar, Odisha",
        "Surat, Gujarat",
        "Patna, Bihar",
        "Guwahati, Assam",
        "Varanasi, Uttar Pradesh",
        "Agra, Uttar Pradesh",
        "Amritsar, Punjab",
        "Coimbatore, Tamil Nadu",
        "Mysore, Karnataka",
        "Noida, Uttar Pradesh",
        "Gurgaon, Haryana",
        "Ranchi, Jharkhand",
        "Raipur, Chhattisgarh"
      ];
    
      const fetchSuggestions = async (searchQuery) => {
        setLoading(true);
        try {
          await new Promise(resolve => setTimeout(resolve, 300));
          const filtered = staticLocations.filter(location =>
            location.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setSuggestions(filtered);
          // If no matches found, allow custom entry
          setIsCustomEntry(filtered.length === 0);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
          setIsCustomEntry(true);
        } finally {
          setLoading(false);
        }
      };
    
      useEffect(() => {
        const handleClickOutside = (event) => {
          if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
            setIsOpen(false);
          }
        };
    
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, []);
      const handleCustomEntry = (e) => {
        if (e.key === 'Enter' || e.type === 'blur') {
          const value = query.trim();
          if (value) {
            // Check if the input contains a comma
            if (!value.includes(',')) {
              // If no comma, append ", State/UT" to prompt user
              setQuery(value + ", State/UT");
              return;
            }
            setIsOpen(false);
            setSuggestions([]);
            onSelect(value);
          }
        }
      };
      const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        setIsOpen(true);
    
        if (value.length >= 2) {
          fetchSuggestions(value);
        } else {
          setSuggestions([]);
        }
      };
    
      const handleSelectSuggestion = (suggestion) => {
        setQuery(suggestion);
        setIsOpen(false);
        setSuggestions([]);
        onSelect(suggestion); // Pass the selected location back to the parent
      };
    
      return (
        <div ref={wrapperRef} className="relative w-full max-w-lg">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.8535534,19.1464466 C20.0488155,19.3417088 20.0488155,19.6582912 19.8535534,19.8535534 C19.6582912,20.0488155 19.3417088,20.0488155 19.1464466,19.8535534 L15.4380219,16.1451287 C14.1187738,17.3000688 12.3911257,18 10.5,18 C6.35786438,18 3,14.6421356 3,10.5 C3,6.35786438 6.35786438,3 10.5,3 C14.6421356,3 18,6.35786438 18,10.5 C18,12.3911257 17.3000688,14.1187738 16.1451287,15.4380219 L19.8535534,19.1464466 Z M17,10.5 C17,6.91014913 14.0898509,4 10.5,4 C6.91014913,4 4,6.91014913 4,10.5 C4,14.0898509 6.91014913,17 10.5,17 C14.0898509,17 17,14.0898509 17,10.5 Z"></path>
              </svg>
            </div>
    
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search or enter city, state"
              value={query}
              onChange={handleInputChange}
              onFocus={() => query.length >= 2 && setIsOpen(true)}
              onKeyPress={handleCustomEntry}
              onBlur={handleCustomEntry}
            />
    
            {loading && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <div className="animate-spin h-5 w-5 text-gray-400">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                </div>
              </div>
            )}
          </div>
    
          {isOpen && (suggestions.length > 0 || isCustomEntry) && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200">
              <ul className="py-1">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSelectSuggestion(suggestion)}
                  >
                    {suggestion}
                  </li>
                ))}
                {isCustomEntry && (
                  <li className="px-4 py-2 text-gray-600 italic">
                    Press Enter to add "{query}" as a custom location
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      );
    };
    const handleLocationSelect = (location) => {
      const newFormData = {
        ...formData,
        cityState: location,
      };
      setFormData(newFormData);
      setSaveStatus('Saving...');
      debouncedSave(newFormData); // Trigger auto-save
    };
  // Rest of the component remains the same
  return (
    <div className="px-4 md:px-56 overflow-auto">
     
     <div className="text-left mb-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold font-sans-serif">Settings</h1>
        {saveStatus && (
          <div className="flex items-center space-x-2">
            <svg 
              className={`w-4 h-4 text-gray-500 ${saveStatus === 'Saving...' ? 'animate-spin' : ''}`} 
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8Z"
              />
            </svg>
            <span className="text-sm text-gray-500">
              {saveStatus}
            </span>
          </div>
        )}
      </div>
      <div className="flex border-b border-gray-300 justify-left mt-4">
        <div className="py-2 text-black border-b-2 border-black cursor-pointer">
          My account
        </div>
      </div>
    </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div className="mb-6">
  <label className="block text-black font-medium mb-1">Logo</label>
  <div className="flex items-center group">
  <div className="relative w-32 h-32 bg-gray-200 rounded-full overflow-hidden">
  {uploadProgress ? (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  ) : (
    // Show imagePreview if available, otherwise show the Font Awesome icon
    imagePreview ? (
      <img
        src={imagePreview}
        alt="Logo"
        className="w-full h-full object-cover group-hover:opacity-100"
      />
    ) : (
      <i className="fa fa-user-circle w-full h-full text-gray-500 flex items-center justify-center text-6xl group-hover:opacity-100"></i>
    )
  )}
</div>


    <div className="ml-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <label htmlFor="logo-upload" className="text-blue-500 text-sm cursor-pointer hover:text-blue-700">
        Upload
      </label>
      <input
        type="file"
        id="logo-upload"
        className="hidden"
        accept="image/*"
        onChange={handleImageUpload}
      />
      {imagePreview && (
        <button
          type="button"
          onClick={handleRemoveImage}
          className="text-red-500 text-sm hover:text-red-700"
        >
          Remove
        </button>
      )}
    </div>
  </div>
  {error && (
    <p className="text-red-500 text-sm mt-2">{error}</p>
  )}
</div>

        <div>
          <label className="block text-black font-medium mb-1">Incubator Name</label>
          <input
            type="text"
            className="w-full max-w-lg h-10 border border-gray-300 px-3 rounded-lg focus:ring-2 focus:ring-blue-500 shadow-md"
            value={formData.companyName}
            onChange={(e) => handleInputChange(null, 'companyName', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-black font-medium mb-1">Bio</label>
         <textarea
                  ref={bioTextareaRef}
                  className="w-full max-w-lg border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 shadow-md resize-y overflow-auto"
                  value={formData.bio}
                  onChange={(e) => handleInputChange(null, 'bio', e.target.value)}
                  placeholder="Tell us about your company..."
                   // Optional: set min and max heights
                />
        </div>
        {/* <div>
          <label className="block text-black font-medium mb-1">Domain</label>
          <input
            type="text"
            className="w-full max-w-lg h-10 border border-gray-300 px-3 rounded-lg focus:ring-2 focus:ring-blue-500 shadow-md"
            value={formData.DomainName}
            onChange={(e) => handleInputChange(null, 'DomainName', e.target.value)}
          />
        </div> */}
        <div>
          <label className="block text-black font-medium mb-1">City/State</label>
          <LocationSearchInput
            onSelect={handleLocationSelect} // Pass the handler for location selection
          />
           <input
    type="text"
    className="w-full max-w-lg h-10 border border-gray-300 px-3 rounded-lg focus:ring-2 focus:ring-blue-500 shadow-md mt-2"
    value={formData.cityState}
    readOnly // Make it read-only since the value is set by the LocationSearchInput
  />
        </div>



        <div className="space-y-6">
          <div className="space-y-3">
            <label className="block text-black font-medium mb-1 mt-20">Social Media Links</label>
            
            {/* Instagram */}
            <div className="flex items-center max-w-sm">
              <Instagram className="w-5 h-5 mr-2" />
              <div className="flex items-center rounded-l-lg bg-gray-100 h-10 px-3">
                <span className="text-sm">instagram.com/</span>
              </div>
              <input
                type="text"
                className="flex-1 h-10 border border-l-0 border-gray-300 px-3 rounded-r-lg focus:ring-2 focus:ring-blue-500"
                value={formData.social.instagram}
                onChange={(e) => handleInputChange('social', 'instagram', e.target.value)}
              />
            </div>

            {/* Twitter/X */}
            <div className="flex items-center max-w-sm">
              <Twitter className="w-5 h-5 mr-2" />
              <div className="flex items-center rounded-l-lg bg-gray-100 h-10 px-3">
                <span className="text-sm">x.com/</span>
              </div>
              <input
                type="text"
                className="flex-1 h-10 border border-l-0 border-gray-300 px-3 rounded-r-lg focus:ring-2 focus:ring-blue-500"
                value={formData.social.twitter}
                onChange={(e) => handleInputChange('social', 'twitter', e.target.value)}
              />
            </div>

            {/* YouTube */}
            <div className="flex items-center max-w-sm">
              <Youtube className="w-5 h-5 mr-2" />
              <div className="flex items-center rounded-l-lg bg-gray-100 h-10 px-3">
                <span className="text-sm">youtube.com/@</span>
              </div>
              <input
                type="text"
                className="flex-1 h-10 border border-l-0 border-gray-300 px-3 rounded-r-lg focus:ring-2 focus:ring-blue-500"
                value={formData.social.youtube}
                onChange={(e) => handleInputChange('social', 'youtube', e.target.value)}
              />
            </div>

            {/* TikTok */}
            <div className="flex items-center max-w-sm">
              <Music2 className="w-5 h-5 mr-2" />
              <div className="flex items-center rounded-l-lg bg-gray-100 h-10 px-3">
                <span className="text-sm">tiktok.com/@</span>
              </div>
              <input
                type="text"
                className="flex-1 h-10 border border-l-0 border-gray-300 px-3 rounded-r-lg focus:ring-2 focus:ring-blue-500"
                value={formData.social.tiktok}
                onChange={(e) => handleInputChange('social', 'tiktok', e.target.value)}
              />
            </div>

            {/* LinkedIn */}
            <div className="flex items-center max-w-sm">
              <Linkedin className="w-5 h-5 mr-2" />
              <div className="flex items-center rounded-l-lg bg-gray-100 h-10 px-3">
                <span className="text-sm">linkedin.com</span>
              </div>
              <input
                type="text"
                className="flex-1 h-10 border border-l-0 border-gray-300 px-3 rounded-r-lg focus:ring-2 focus:ring-blue-500"
                value={formData.social.linkedin}
                onChange={(e) => handleInputChange('social', 'linkedin', e.target.value)}
              />
            </div>

            {/* Website */}
            <div className="flex items-center max-w-sm">
              <Globe className="w-5 h-5 mr-2" />
              <div className="flex items-center rounded-l-lg bg-gray-100 h-10 px-3">
                <span className="text-sm">Your website</span>
              </div>
              <input
                type="text"
                className="flex-1 h-10 border border-l-0 border-gray-300 px-3 rounded-r-lg focus:ring-2 focus:ring-blue-500"
                value={formData.social.website}
                onChange={(e) => handleInputChange('social', 'website', e.target.value)}
              />
            </div>
          </div>

          <div>
  <div className="flex items-center justify-between mt-20 mb-10">
    <label className="text-black font-medium">Contact Information</label>
    <button
      onClick={(e) => {
        e.preventDefault();
        handleAddContact();
      }}
      className="flex items-center text-blue-600 hover:text-black"
    >
      <Plus className="w-5 h-5 mr-1" />
      Add Contact
    </button>
  </div>

  {formData.contacts.map((contact, index) => (
  <ContactRow
  key={index}
  contact={contact}
  index={index}
  onChange={(field, value) => handleContactChange(index, field, value)}
  onRemove={formData.contacts.length > 1 ? () => handleRemoveContact(index) : null}
  onImageUpload={handleContactImageUpload}
  onRemoveImage={() => handleRemoveContactImage(index)}
 />
))}
</div>
        </div>

      

        <div className="mb-6">
      <h2 className="text-lg font-semibold text-Black mt-20">Delete Account</h2>
      <p className="text-sm text-gray-700 mt-2">
        This will permanently delete your entire account. All your forms, submissions, and workspaces will be deleted.
      </p>
      {!isConfirming ? (
        <button
          type="button"
          onClick={handleDeleteAccountInitiate}
          className="mt-4 px-2 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Delete Account
        </button>
      ) : (
        <div className="mt-4 space-x-2">
          <button
            type="button"
            onClick={handleConfirmDelete}
            className="px-2 py-2 bg-red-700 text-white rounded-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Confirm Delete
          </button>
          <button
            type="button"
            onClick={handleCancelDelete}
            className="px-2 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
      </form>
    </div>
  );
};

export default IncubatorSettingsForm;
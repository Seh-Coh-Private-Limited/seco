import React, { useState, useEffect } from 'react';
import { 
  Instagram, 
  Twitter, 
  Youtube, 
  Music2, 
  Linkedin, 
  Globe 
} from 'lucide-react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const defaultFormData = {
    companyName: '',
    bio: '',
    cityState: '',
    social: {
      instagram: '',
      twitter: '',
      youtube: '',
      tiktok: '',
      linkedin: '',
      website: ''
    },
    contact: {
      email: '',
      firstName: '',
      lastName: '',
      mobile: '',
      designation: ''
    }
  };
const SettingsForm = () => {
    const auth = getAuth();
    const [formData, setFormData] = useState(defaultFormData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const storage = getStorage();

    const [imagePreview, setImagePreview] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(false);
  
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
              // Merge the fetched data with default values to ensure all fields exist
              setFormData({
                companyName: data.companyName || '',
                bio: data.bio || '',
                cityState: data.cityState || '',
                social: {
                  instagram: data.social?.instagram || '',
                  twitter: data.social?.twitter || '',
                  youtube: data.social?.youtube || '',
                  tiktok: data.social?.tiktok || '',
                  linkedin: data.social?.linkedin || '',
                  website: data.social?.website || ''
                },
                contact: {
                  email: data.contact?.email || '',
                  firstName: data.contact?.firstName || '',
                  lastName: data.contact?.lastName || '',
                  mobile: data.contact?.mobile || '',
                  designation: data.contact?.designation || ''
                }
              });
            } else {
              // If no document exists, use default values
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
  
    const handleInputChange = (section, field, value) => {
      setFormData(prev => {
        if (section) {
          return {
            ...prev,
            [section]: {
              ...(prev[section] || {}), // Handle case where section might be undefined
              [field]: value
            }
          };
        }
        return {
          ...prev,
          [field]: value
        };
      });
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
          setFormData(prev => ({
            ...prev,
            logoUrl: downloadURL
          }));
          
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
          const user = auth.currentUser;
          const imageRef = ref(storage, formData.logoUrl);
          await deleteObject(imageRef);
          
          setImagePreview(null);
          setFormData(prev => ({
            ...prev,
            logoUrl: ''
          }));
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
        alert('Settings updated successfully!');
        setError(''); // Clear any previous errors
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
  // Rest of the component remains the same
  return (
    <div className="px-4 md:px-56 overflow-auto">
      <div className="text-left mb-8">
        <h1 className="text-4xl font-bold font-sans-serif">Settings</h1>
        <div className="flex border-b border-gray-300 justify-left mt-4">
          <div className="py-2 text-black  border-b-2 border-black cursor-pointer">
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
          <label className="block text-black font-medium mb-1">Company Name</label>
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
            className="w-full max-w-lg border border-gray-300 px-3 rounded-lg focus:ring-2 focus:ring-blue-500 shadow-md"
            value={formData.bio}
            onChange={(e) => handleInputChange(null, 'bio', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-black font-medium mb-1">City / State</label>
          <input
            type="text"
            className="w-full max-w-lg h-10 border border-gray-300 px-3 rounded-lg focus:ring-2 focus:ring-blue-500 shadow-md"
            value={formData.cityState}
            onChange={(e) => handleInputChange(null, 'cityState', e.target.value)}
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
            <label className="block text-black font-medium mb-1 mt-20">Contact Information</label>
            <div className="space-y-3">
              <div>
                <label className="block text-black font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="w-full max-w-lg h-10 border border-gray-300 px-3 rounded-lg focus:ring-2 focus:ring-blue-500 shadow-md"
                  value={formData.contact.email}
                  onChange={(e) => handleInputChange('contact', 'email', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-black font-medium mb-1">First Name</label>
                <input
                  type="text"
                  className="w-full max-w-lg h-10 border border-gray-300 px-3 rounded-lg focus:ring-2 focus:ring-blue-500 shadow-md"
                  value={formData.contact.firstName}
                  onChange={(e) => handleInputChange('contact', 'firstName', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-black font-medium mb-1">Last Name</label>
                <input
                  type="text"
                  className="w-full max-w-lg h-10 border border-gray-300 px-3 rounded-lg focus:ring-2 focus:ring-blue-500 shadow-md"
                  value={formData.contact.lastName}
                  onChange={(e) => handleInputChange('contact', 'lastName', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-black font-medium mb-1">Mobile Number</label>
                <input
                  type="tel"
                  className="w-full max-w-lg h-10 border border-gray-300 px-3 rounded-lg focus:ring-2 focus:ring-blue-500 shadow-md"
                  value={formData.contact.mobile}
                  onChange={(e) => handleInputChange('contact', 'mobile', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-black font-medium mb-1">Designation</label>
                <input
                  type="text"
                  className="w-full max-w-lg h-10 border border-gray-300 px-3 rounded-lg focus:ring-2 focus:ring-blue-500 shadow-md"
                  value={formData.contact.designation}
                  onChange={(e) => handleInputChange('contact', 'designation', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="bg-[#F99F31] text-white px-4 py-2 rounded hover:bg-blue-600 max-w-md mb-20"
        >
          Update
        </button>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-Black mt-20">Delete Account</h2>
          <p className="text-sm text-gray-700 mt-2">
            This will permanently delete your entire account. All your forms, submissions, and workspaces will be deleted.
          </p>
          <button 
            type="button"
            className="mt-4 px-2 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Delete Account
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsForm;
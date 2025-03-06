import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import DOMPurify from 'dompurify';
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { ffetchProgramById } from '../components/ffetchprogram';
import { collection, db, getDocs, query, where, doc, updateDoc } from '../firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faPen } from '@fortawesome/free-solid-svg-icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const FProgramEditPage = ({ programId }) => {
  const navigate = useNavigate();
  const [programDetails, setProgramDetails] = useState(null);
  const [formQuestions, setFormQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState('details');
  const [imagePreview, setImagePreview] = useState(null);
  const [categoryInput, setCategoryInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      ['link'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['clean'],
    ],
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'link', 'list', 'bullet',
  ];

  const availableCategories = [
    "Technology", "Healthcare", "Education", "Finance", "Marketing", "Arts", "Sports",
  ];

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        if (programId) {
          const fetchedProgram = await ffetchProgramById(programId);
          if (!fetchedProgram) return;
          setProgramDetails({ ...fetchedProgram, firestoreDocId: null });
          setImagePreview(fetchedProgram.image);
          setLocationInput(fetchedProgram.location || '');

          const programmesRef = collection(db, "programmes");
          const programmeQuery = query(programmesRef, where("id", "==", programId));
          const programmeSnapshot = await getDocs(programmeQuery);

          if (!programmeSnapshot.empty) {
            const programmeDoc = programmeSnapshot.docs[0];
            setProgramDetails(prev => ({ ...prev, firestoreDocId: programmeDoc.id }));

            const formCollectionRef = collection(db, "programmes", programmeDoc.id, "form");
            const formSnapshot = await getDocs(formCollectionRef);
            const questions = formSnapshot.docs.flatMap((doc) => doc.data().questions || []).map(q => ({ ...q, docId: formSnapshot.docs[0].id }));
            setFormQuestions(questions);
          }
        }
      } catch (error) {
        console.error('Error fetching program details:', error);
        navigate('/programs');
      }
    };

    fetchProgram();
  }, [programId, navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setLocationSuggestions([]);
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!programDetails) {
    return (
      <div className="mt-6 mb-6" id="details">
        <hr className="my-4 border-t border-gray-300" />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <ClipLoader size={50} color={'#3498db'} loading={true} />
        </div>
      </div>
    );
  }

  const { name, image, endDate, description, location, categories = [], startDate, firestoreDocId } = programDetails;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        setImagePreview(reader.result);
        setProgramDetails(prev => ({ ...prev, image: reader.result }));
        const programmeDocRef = doc(db, "programmes", firestoreDocId);
        await updateDoc(programmeDocRef, { image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFieldChange = async (field, value) => {
    setProgramDetails(prev => ({ ...prev, [field]: value }));
    const programmeDocRef = doc(db, "programmes", firestoreDocId);
    await updateDoc(programmeDocRef, { [field]: value });
  };

  const handleDescriptionChange = (value) => {
    setProgramDetails(prev => ({ ...prev, description: value }));
    handleFieldChange('description', value);
  };

  const handleAddCategory = async (category) => {
    if (!category || categories.includes(category)) return;
    const updatedCategories = [...categories, category];
    setProgramDetails(prev => ({ ...prev, categories: updatedCategories }));
    setCategoryInput('');
    setIsDropdownOpen(false);
    const programmeDocRef = doc(db, "programmes", firestoreDocId);
    await updateDoc(programmeDocRef, { categories: updatedCategories });
  };

  const handleRemoveCategory = async (index) => {
    const updatedCategories = categories.filter((_, i) => i !== index);
    setProgramDetails(prev => ({ ...prev, categories: updatedCategories }));
    const programmeDocRef = doc(db, "programmes", firestoreDocId);
    await updateDoc(programmeDocRef, { categories: updatedCategories });
  };

  const handleLocationInputChange = async (e) => {
    const value = e.target.value;
    setLocationInput(value);
    setProgramDetails(prev => ({ ...prev, location: value }));
    const programmeDocRef = doc(db, "programmes", firestoreDocId);
    await updateDoc(programmeDocRef, { location: value });

    const suggestions = value
      ? ["New York", "London", "Tokyo", "Paris", "Sydney"].filter(loc => loc.toLowerCase().includes(value.toLowerCase()))
      : [];
    setLocationSuggestions(suggestions);
  };

  const handleSelectLocation = async (suggestion) => {
    setLocationInput(suggestion);
    setProgramDetails(prev => ({ ...prev, location: suggestion }));
    setLocationSuggestions([]);
    const programmeDocRef = doc(db, "programmes", firestoreDocId);
    await updateDoc(programmeDocRef, { location: suggestion });
  };

  const handleFormQuestionChange = async (index, prop, value) => {
    const updatedQuestions = [...formQuestions];
    updatedQuestions[index] = { ...updatedQuestions[index], [prop]: value };
    setFormQuestions(updatedQuestions);
    const formDocRef = doc(db, "programmes", firestoreDocId, "form", formQuestions[0].docId);
    await updateDoc(formDocRef, { questions: updatedQuestions });
  };

  const filteredCategories = availableCategories.filter(category =>
    category.toLowerCase().includes(categoryInput.toLowerCase()) && !categories.includes(category)
  );

  // Pane 1: Image and Title
  const renderImageAndTitlePane = () => (
    <div className="rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        {isEditing ? (
          <input
            type="text"
            value={name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            className="w-full text-2xl font-light border-none focus:outline-none focus:ring-0"
            placeholder="Program Name"
          />
        ) : (
          <h1 className="text-2xl font-bold">{name}</h1>
        )}
        <button onClick={() => setIsEditing(!isEditing)} className="ml-2 text-gray-500 hover:text-blue-600">
          <FontAwesomeIcon icon={faPen} size="sm" />
        </button>
      </div>
      {isEditing ? (
        <div
          className="relative aspect-square bg-gray-100 flex items-center justify-center cursor-pointer rounded-lg overflow-hidden"
          onClick={() => document.getElementById('imageUpload').click()}
        >
          {imagePreview ? (
            <img src={imagePreview} alt={name} className="w-full h-full object-contain" />
          ) : (
            <div className="text-center p-4">
              <FontAwesomeIcon icon={faCamera} className="text-3xl text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Click to upload program image</p>
            </div>
          )}
          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
      ) : (
        <img src={image} alt={name} className="w-full h-auto rounded-lg" />
      )}
    </div>
  );

  // Pane 2: Details
  const renderDetailsPane = () => (
    <div className="rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Details</h2>
      {isEditing ? (
        <ReactQuill
          theme="snow"
          value={description}
          onChange={handleDescriptionChange}
          placeholder="Add Description"
          modules={quillModules}
          formats={quillFormats}
          className="w-full rounded-md"
        />
      ) : (
        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(description, { ALLOWED_TAGS: ['p', 'h1', 'h2', 'ul', 'ol', 'li', 'strong', 'em'] }) }} />
      )}
    </div>
  );

  // Pane 3: Form Questions
  const renderFormQuestionsPane = () => (
    <div className="rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Form Questions</h2>
      {formQuestions.map((question, index) => (
        <div key={index} className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-start">
            <input
              type="text"
              value={question.title || "Question?"}
              onChange={(e) => handleFormQuestionChange(index, 'title', e.target.value)}
              className="w-2/3 text-lg font-light border-none focus:outline-none focus:ring-0 bg-transparent"
            />
            <span className="text-sm text-gray-500">
              Type:{' '}
              <input
                type="text"
                value={question.type}
                onChange={(e) => handleFormQuestionChange(index, 'type', e.target.value)}
                className="border-none focus:outline-none focus:ring-0 bg-transparent text-gray-500"
              />
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  // Pane 4: Right Side Content
  const renderRightSidePane = () => {
    if (!isEditing) {
      const formattedStartDate = new Date(startDate);
      const formattedEndDate = new Date(endDate);
      const formatMonth = (date) => date.toLocaleString('default', { month: 'short' }).toUpperCase();
      const formatDay = (date) => date.getDate();

      return (
        <div className="rounded-lg shadow p-6 space-y-6">
          <div className="flex gap-2">
            <div className="w-10 border-2 border-slate-300 rounded-md h-10">
              <div className="bg-slate-300 text-xs text-center">{formatMonth(formattedStartDate)}</div>
              <div>{formatDay(formattedStartDate)}</div>
            </div>
            <div>
              <p>{new Date(startDate).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>
              <p className="text-sm text-gray-500">Start Date</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-10 border-2 border-slate-300 rounded-md h-10">
              <div className="bg-slate-300 text-xs text-center">{formatMonth(formattedEndDate)}</div>
              <div>{formatDay(formattedEndDate)}</div>
            </div>
            <div>
              <p>{new Date(endDate).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>
              <p className="text-sm text-gray-500">End Date</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-10 border-2 border-slate-300 rounded-md h-10 flex items-center justify-center">
              <img src="../../location.png" alt="location" className="w-6 h-6" />
            </div>
            <div>
              <p>{location}</p>
              <p className="text-sm text-gray-500">Location</p>
            </div>
          </div>
          <div>
            <p>Sectors</p>
            <hr className="my-4 border-t border-slate-300" />
            <div className="flex flex-wrap gap-2 mt-2">
              {categories.map((category, index) => (
                <div key={index} className="bg-gray-200 rounded-full px-2 py-1 text-xs">
                  {category}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="mb-6">
          <label className="block text-sm text-gray-500 mb-1">Sectors</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {categories.map((category, index) => (
              <div key={index} className="flex items-center bg-gray-200 rounded-full px-3 py-1 text-sm">
                {category}
                <button
                  onClick={() => handleRemoveCategory(index)}
                  className="ml-2 text-gray-600 hover:text-gray-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={categoryInput}
              onChange={(e) => {
                setCategoryInput(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory(categoryInput)}
              placeholder="Search or add custom category"
              className="w-full p-3 border rounded-md"
            />
            {isDropdownOpen && (categoryInput || filteredCategories.length > 0) && (
              <div
                ref={dropdownRef}
                className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto"
              >
                {filteredCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleAddCategory(category)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    {category}
                  </button>
                ))}
                {categoryInput && !filteredCategories.includes(categoryInput) && (
                  <button
                    onClick={() => handleAddCategory(categoryInput)}
                    className="w-full text-left px-4 py-2 text-blue-600 hover:bg-gray-100"
                  >
                    Add "{categoryInput}"
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-sm text-gray-500 mb-1">Location</label>
          <div className="relative">
            <input
              type="text"
              value={locationInput}
              onChange={handleLocationInputChange}
              className="w-full p-3 border rounded-md"
              placeholder="Enter location or venue"
            />
            {locationSuggestions.length > 0 && (
              <ul
                ref={dropdownRef}
                className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-60 overflow-auto"
              >
                {locationSuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => handleSelectLocation(suggestion)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Application Start Date *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleFieldChange('startDate', e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-gray-700"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Application End Date *</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleFieldChange('endDate', e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-gray-700"
                min={startDate}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="md:px-36">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Pane 1: Image and Title */}
        <div className="col-span-1 lg:col-span-3">
          {renderImageAndTitlePane()}
        </div>

        {/* Pane 2: Details */}
        <div className="col-span-1 lg:col-span-2">
          <nav className="rounded-3xl mb-4">
            <div className="max-w-6xl mx-auto py-2">
              <div className="flex justify-start space-x-6">
                <div className="flex border-b border-gray-300 rounded-3xl">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`px-4 py-2 text-sm ${activeTab === 'details' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => setActiveTab('formquestions')}
                    className={`px-4 py-2 text-sm ${activeTab === 'formquestions' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                  >
                    Form Questions
                  </button>
                </div>
              </div>
            </div>
          </nav>
          {activeTab === 'details' && renderDetailsPane()}
          {activeTab === 'formquestions' && renderFormQuestionsPane()}
        </div>

        {/* Pane 3: Right Side Content */}
        <div className="col-span-1">
          <div className="mt-4">
            <button
              className="rounded-xl text-sm text-black bg-[#F99F31] hover:bg-[#FACB82] w-full h-12 px-8"
              onClick={() => setIsEditing(false)}
            >
              Save Changes
            </button>
          </div>
          <div className="mt-6">{renderRightSidePane()}</div>
        </div>
      </div>
    </div>
  );
};

export default FProgramEditPage;
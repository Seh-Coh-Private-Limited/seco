import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';

const FormResponses = () => {
  const [searchText, setSearchText] = useState('');
  const [filterByTitle, setFilterByTitle] = useState('');
  const [filterByCompany, setFilterByCompany] = useState('');
  const [filterByGroup, setFilterByGroup] = useState('');
  const [filterByPerson, setFilterByPerson] = useState('');
  const [selectedRow, setSelectedRow] = useState(null); // State to handle radio button selection
  const [showModal, setShowModal] = useState(false); // Modal state for detailed response

  const data = [
    {
      firstName: 'Madhav',
      lastName: 'Tandan',
      title: 'Partner',
      company: 'Orion Venture Partners',
      group: 'VC',
      phone: '',
      email: 'madhav@orionvp.com',
      website: 'https://www.orionvp.com',
      linkedinProfile: '',
      responses: [
        { question: 'What is your business model?', answer: 'We follow a subscription-based model.' },
        { question: 'What is your market opportunity?', answer: 'There is a huge potential in the ed-tech market.' },
        // More responses can be added
      ],
    }, {
      firstName: 'Madhav',
      lastName: 'Tandan',
      title: 'Partner',
      company: 'Orion Venture Partners',
      group: 'VC',
      phone: '',
      email: 'madhav@orionvp.com',
      website: 'https://www.orionvp.com',
      linkedinProfile: '',
      responses: [
        { question: 'What is your business model?', answer: 'We follow a subscription-based model.' },
        { question: 'What is your market opportunity?', answer: 'There is a huge potential in the ed-tech market.' },
        // More responses can be added
      ],
    }, {
      firstName: 'Madhav',
      lastName: 'Tandan',
      title: 'Partner',
      company: 'Orion Venture Partners',
      group: 'VC',
      phone: '',
      email: 'madhav@orionvp.com',
      website: 'https://www.orionvp.com',
      linkedinProfile: '',
      responses: [
        { question: 'What is your business model?', answer: 'We follow a subscription-based model.' },
        { question: 'What is your market opportunity?', answer: 'There is a huge potential in the ed-tech market.' },
        // More responses can be added
      ],
    }, {
      firstName: 'Madhav',
      lastName: 'Tandan',
      title: 'Partner',
      company: 'Orion Venture Partners',
      group: 'VC',
      phone: '',
      email: 'madhav@orionvp.com',
      website: 'https://www.orionvp.com',
      linkedinProfile: '',
      responses: [
        { question: 'What is your business model?', answer: 'We follow a subscription-based model.' },
        { question: 'What is your market opportunity?', answer: 'There is a huge potential in the ed-tech market.' },
        // More responses can be added
      ],
    }, {
      firstName: 'Madhav',
      lastName: 'Tandan',
      title: 'Partner',
      company: 'Orion Venture Partners',
      group: 'VC',
      phone: '',
      email: 'madhav@orionvp.com',
      website: 'https://www.orionvp.com',
      linkedinProfile: '',
      responses: [
        { question: 'What is your business model?', answer: 'We follow a subscription-based model.' },
        { question: 'What is your market opportunity?', answer: 'There is a huge potential in the ed-tech market.' },
        // More responses can be added
      ],
    }, {
      firstName: 'Madhav',
      lastName: 'Tandan',
      title: 'Partner',
      company: 'Orion Venture Partners',
      group: 'VC',
      phone: '',
      email: 'madhav@orionvp.com',
      website: 'https://www.orionvp.com',
      linkedinProfile: '',
      responses: [
        { question: 'What is your business model?', answer: 'We follow a subscription-based model.' },
        { question: 'What is your market opportunity?', answer: 'There is a huge potential in the ed-tech market.' },
        // More responses can be added
      ],
    }, {
      firstName: 'Madhav',
      lastName: 'Tandan',
      title: 'Partner',
      company: 'Orion Venture Partners',
      group: 'VC',
      phone: '',
      email: 'madhav@orionvp.com',
      website: 'https://www.orionvp.com',
      linkedinProfile: '',
      responses: [
        { question: 'What is your business model?', answer: 'We follow a subscription-based model.' },
        { question: 'What is your market opportunity?', answer: 'There is a huge potential in the ed-tech market.' },
        // More responses can be added
      ],
    }, {
      firstName: 'Madhav',
      lastName: 'Tandan',
      title: 'Partner',
      company: 'Orion Venture Partners',
      group: 'VC',
      phone: '',
      email: 'madhav@orionvp.com',
      website: 'https://www.orionvp.com',
      linkedinProfile: '',
      responses: [
        { question: 'What is your business model?', answer: 'We follow a subscription-based model.' },
        { question: 'What is your market opportunity?', answer: 'There is a huge potential in the ed-tech market.' },
        // More responses can be added
      ],
    },
    // Other data entries
  ];

  const filteredData = data.filter((item) => {
    const searchMatch =
      item.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.title.toLowerCase().includes(searchText.toLowerCase()) ||
      item.company.toLowerCase().includes(searchText.toLowerCase());

    const titleMatch =
      filterByTitle === '' || item.title.toLowerCase() === filterByTitle.toLowerCase();

    const companyMatch =
      filterByCompany === '' || item.company.toLowerCase() === filterByCompany.toLowerCase();

    const groupMatch =
      filterByGroup === '' || item.group.toLowerCase() === filterByGroup.toLowerCase();

    const personMatch =
      filterByPerson === '' || `${item.firstName} ${item.lastName}`.toLowerCase() === filterByPerson.toLowerCase();

    return searchMatch && titleMatch && companyMatch && groupMatch && personMatch;
  });

  const handleDetailedResponse = (item) => {
    setSelectedRow(item);
    setShowModal(true); // Show modal when the three dots are clicked
  };

  const handleRatingChange = (section, rating) => {
    // Handle the rating change, you can store it in a state or update the database
    console.log(`${section} rating: ${rating}`);
  };
  const [scores, setScores] = useState({
    Team: 0,
    'Business Model': 0,
    Traction: 0,
    'Market Opportunity': 0,
    'Value Proposition': 0
  });

  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state

  const responses = [
    {
      question: "What is your target market?",
      answer: "Our primary target market consists of small to medium-sized businesses in the retail sector, specifically focusing on those with annual revenues between $1M and $10M..."
    },
    {
      question: "What is your current traction?",
      answer: "We've achieved 120% year-over-year growth, with current monthly recurring revenue of $50,000 and 200+ active customers..."
    },
    {
      question: "Describe your business model.",
      answer: "We operate on a SaaS subscription model with three tiers: Basic ($99/mo), Professional ($199/mo), and Enterprise ($499/mo). Each tier includes..."
    }
  ];

  const handleScoreChange = (category, value) => {
    setScores(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const openModal = () => {
    setIsModalOpen(true); // Open the modal
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
  };
  return (
    <div className="container mx-auto px-6 py-6 my-8">
      {/* Filters section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          {/* Search input with border */}
          <input
            type="text"
            placeholder="Search..."
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          {/* Filter by Title */}
          <select
            className="px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            value={filterByTitle}
            onChange={(e) => setFilterByTitle(e.target.value)}
          >
            <option value="">🔍 Filter by Title</option>
            {[...new Set(data.map((item) => item.title))].map((title, index) => (
              <option key={index} value={title.toLowerCase()}>
                {title}
              </option>
            ))}
          </select>
          {/* Filter by Company */}
          <select
            className="px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            value={filterByCompany}
            onChange={(e) => setFilterByCompany(e.target.value)}
          >
            <option value="">🏢 Filter by Company</option>
            {[...new Set(data.map((item) => item.company))].map((company, index) => (
              <option key={index} value={company.toLowerCase()}>
                {company}
              </option>
            ))}
          </select>
          {/* Filter by Group */}
          <select
            className="px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            value={filterByGroup}
            onChange={(e) => setFilterByGroup(e.target.value)}
          >
            <option value="">👥 Filter by Group</option>
            {[...new Set(data.map((item) => item.group))].map((group, index) => (
              <option key={index} value={group.toLowerCase()}>
                {group}
              </option>
            ))}
          </select>
          {/* Filter by Person */}
          <input
            type="text"
            placeholder="🧑 Filter by Person"
            className="px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            value={filterByPerson}
            onChange={(e) => setFilterByPerson(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border-l-4 border-[#F99F31]">
        <div className="min-w-[1200px]">
          <table className="w-full border border-gray-300 rounded-lg">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left border border-gray-300 rounded-lg w-[120px]  bg-white z-10">
                  <input type="checkbox" />
                </th>
                <th className="px-4 py-2 text-left border border-gray-300 rounded-lg w-[150px] bg-white z-10">
                  First name
                </th>
                <th className="px-4 py-2 text-left border border-gray-300 rounded-lg w-[150px]">Last Name</th>
                <th className="px-4 py-2 text-left border border-gray-300 rounded-lg w-[200px]">Title</th>
                <th className="px-4 py-2 text-left border border-gray-300 rounded-lg w-[200px]">Company</th>
                <th className="px-4 py-2 text-left border border-gray-300 rounded-lg w-[150px]">Group</th>
                <th className="px-4 py-2 text-left border border-gray-300 rounded-lg w-[150px]">Phone</th>
                <th className="px-4 py-2 text-left border border-gray-300 rounded-lg w-[200px]">Email</th>
                <th className="px-4 py-2 text-left border border-gray-300 rounded-lg w-[250px]">Website</th>
                <th className="px-4 py-2 text-left border border-gray-300 rounded-lg w-[250px]">LinkedIn Profile</th>
                <th className="px-4 py-2 text-left border border-gray-300 rounded-lg w-[150px]">Status</th>
                {/* New column for three dots */}
                <th className="px-4 py-2 text-left border border-gray-300 rounded-lg w-[150px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 border border-gray-300 rounded-lg  bg-white">
                    <input type="checkbox" />
                  </td>
                  <td className="px-4 py-2 border border-gray-300 rounded-lg  bg-white">
                    {item.firstName}
                  </td>
                  <td className="px-4 py-2 border border-gray-300 rounded-lg">{item.lastName}</td>
                  <td className="px-4 py-2 border border-gray-300 rounded-lg">{item.title}</td>
                  <td className="px-4 py-2 border border-gray-300 rounded-lg">{item.company}</td>
                  <td className="px-4 py-2 border border-gray-300 rounded-lg">{item.group}</td>
                  <td className="px-4 py-2 border border-gray-300 rounded-lg">{item.phone || '-'}</td>
                  <td className="px-4 py-2 border border-gray-300 rounded-lg">{item.email || '-'}</td>
                  <td className="px-4 py-2 border border-gray-300 rounded-lg">
                    <a
                      href={item.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500"
                    >
                      {item.website}
                    </a>
                  </td>
                  <td className="px-4 py-2 border border-gray-300 rounded-lg">
                    <a
                      href={item.linkedinProfile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500"
                    >
                      {item.linkedinProfile}
                    </a>
                  </td>
                  <td className="px-4 py-2 border border-gray-300 rounded-lg">
                    <select
                      className="px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      defaultValue="Pending"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                  {/* Actions column with three dots */}
                  <td className="px-4 py-2 border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleDetailedResponse(item)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      &#8230; {/* Ellipsis symbol */}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      
      {showModal && selectedRow && (
  <div>
    {/* Modal Popup */}
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="w-full max-w-6xl bg-white rounded-lg shadow-lg p-8 relative overflow-auto max-h-[90vh]">
        {/* Close Button */}
        <button
  onClick={() => {
    setShowModal(false); // Close modal when clicked
    setSelectedRow(null); // Clear selected row
  }}
  className="absolute top-4 right-4 text-black px-4 py-2 rounded-full"
>
  <FontAwesomeIcon icon={faClose} /> {/* Close icon */}
</button>

        {/* Top Navigation */}
        <div className="border-b">
          <div className="flex items-center p-4 gap-4">
            {/* Your navigation buttons here */}
            <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md flex items-center">
              <span className="mr-2">📧</span>
              New email
            </button>
            <button className="border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-md flex items-center">
              <span className="mr-2">➕</span>
              Add activity
            </button>
            <button className="border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-md flex items-center">
              <span className="mr-2">🔍</span>
              Filter
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex">
          {/* Left Panel - Timeline with Responses */}
          <div className="w-2/3 h-2/3 p-4 border-r">
            <div className="text-sm text-gray-500 mb-4">Apr 2024</div>
            {responses.map((response, index) => (
              <div key={index} className="flex items-start space-x-3 mb-4">
                <div className="bg-blue-500 p-2 rounded">
                  <span className="text-white">#</span>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="mb-2">
                      <div className="font-medium text-gray-800">{response.question}</div>
                      <div className="text-gray-600">{response.answer}</div>
                    </div>
                    <div className="text-sm text-gray-500">Apr 24, 2:25 PM</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Panel - Scoring */}
          <div className="w-1/3 p-4">
            <div className="space-y-6">
              <div>
                <div className="text-sm font-medium mb-2">Service</div>
                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md inline-block">
                  Market Access
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2">Status</div>
                <div className="bg-green-500 text-white px-3 py-1 rounded-md inline-block">
                  Closed
                </div>
              </div>

              <div className="space-y-4">
                {Object.keys(scores).map((category) => (
                  <div key={category} className="space-y-1">
                    <div className="text-sm font-medium">{category}</div>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((point) => (
                        <button
                          key={point}
                          onClick={() => handleScoreChange(category, point)}
                          className={`w-8 h-8 rounded ${
                            scores[category] >= point
                              ? 'bg-yellow-400 text-white'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {point}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium mb-2">Last Action</div>
                  <div className="text-gray-600">Jan 18, 2024</div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">Close Date</div>
                  <div className="text-gray-600">Jan 18, 2024</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2">Creation Date</div>
                <div className="text-gray-600">May 02, 2024</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default FormResponses;

import React, { useEffect, useState } from 'react';
import { fetchPrograms } from '../components/ffetchprograms';
import './Article.css';
import FProgramCard from './FProgramCard';

function Articles({ handleTabChange }) {
  const [programs, setPrograms] = useState([]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterCity, setFilterCity] = useState('any city');
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  // Fixed orientation pattern for mod 6
  const orientationPattern = ['vertical', 'horizontal', 'vertical', 'vertical', 'horizontal', 'horizontal'];
  const orientationPattern2 = ['horizontal', 'horizontal', 'vertical'];

  useEffect(() => {
    const loadPrograms = async () => {
      const programsList = await fetchPrograms();
      setPrograms(programsList);
    };

    loadPrograms();

    // Update screen width on resize
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    // Clean up the event listener
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredPrograms = programs.filter(program => {
    const matchesCategory = filterCategory === 'all' || program.industry.includes(filterCategory);
    const matchesCity = filterCity === 'any city' || program.location === filterCity;
    return matchesCategory && matchesCity;
  });

  const totalFiltered = filteredPrograms.length;
  const remainder = totalFiltered % 6;

  // Create arrays for orientation based on screen size
  const orientationArrayMod6 = [];
  const orientationArrayMod2 = [];

  if (screenWidth > 1200) {
    for (let i = 0; i < totalFiltered; i++) {
      if (i < totalFiltered - remainder) {
        orientationArrayMod6.push(orientationPattern[i % 6]);
      } else {
        orientationArrayMod6.push('vertical');
      }
    }
  }

  if (screenWidth >= 769 && screenWidth <= 1151) {
    for (let i = 0; i < totalFiltered; i++) {
      if (i < totalFiltered - remainder) {
        orientationArrayMod2.push(orientationPattern2[i % 3]);
      } else {
        orientationArrayMod2.push('horizontal');
      }
    }
  }

  if (screenWidth < 769) {
    for (let i = 0; i < totalFiltered; i++) {
      orientationArrayMod2.push('vertical');
    }
  }

  const getOrientation = (index) => {
    if (screenWidth > 1152) {
      return orientationArrayMod6[index];
    } else if (screenWidth >= 769 && screenWidth <= 1151) {
      return orientationArrayMod2[index];
    } else {
      return 'vertical';
    }
  };

  return (
    
    <div className="md:px-36 overflow-auto">
       <div className="text-left mb-8">
        <h1 className="text-4xl font-bold font-sans-serif mb-8">Discover</h1>
        <div className="flex border-b border-gray-300 justify-left mt-4">
          {/* <div className="py-2 text-black  border-b-2 border-black cursor-pointer">
            My account
          </div> */}
        </div>
      </div>
      <div className="filters-container mt-10 mb-10">
        <p style={{ fontFamily: 'CFont' }}>show me</p>
        <div className="filter-dropdown">
          <select className="dropdown" onChange={e => setFilterCategory(e.target.value)}>
            <option value="all">all</option>
            <option value="finance">finance</option>
            <option value="technology">technology</option>
            <option value="education">education</option>
            <option value="healthcare & Lifesciences">healthcare & lifesciences</option>
            <option value="media & Entertainment">media & entertainment</option>
            <option value="retail">retail</option>
          </select>
        </div>
        <p style={{ fontFamily: 'CFont' }}>programs, active in</p>
        <div className="filter-dropdown">
          <select className="dropdown" onChange={e => setFilterCity(e.target.value)}>
            <option value="any city">any city</option>
            <option value="remote">Remote</option>
            <option value="India">India</option>
            {/* Add more cities as needed */}
          </select>
        </div>
      </div>

      <div className="f-articles-container">
      {filteredPrograms.map((program, index) => (
        <FProgramCard
          key={program.id}
          id={program.id}
          title={program.name}
          category={program.sector}
          image={program.image}
          location={program.location}
          description={program.description}
          orientation={getOrientation(index)}
          handleTabChange={handleTabChange}
        />
      ))}
    </div>
    </div>
  );
}

export default Articles;

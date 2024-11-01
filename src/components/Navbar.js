import React from 'react'
// import Button from './Button';

function getCurrentTimeIST() {
    const now = new Date();
  
    // Convert current time to IST
    const offsetIST = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    const istTime = new Date(now.getTime() + offsetIST);
  
    const hours = String(istTime.getUTCHours()).padStart(2, '0');
    const minutes = String(istTime.getUTCMinutes()).padStart(2, '0');
    
    return `${hours}:${minutes}`;
  }

const Navbar = () => {
  return (
    <div className="text-gray-400 w-full flex justify-between items-center px-4  p-2">
      <div className="flex items-center gap-6">
        <span>
          <p className="text-lg font-semibold">
            luma
          </p>
        </span>
      </div>
      <div className="flex items-center gap-6 font-medium text-sm ">
        <p>{getCurrentTimeIST()} IST</p>
        <p>Explore Events</p>
        {/* <Button/> */}
      </div>
    </div>
  )
}

export default Navbar
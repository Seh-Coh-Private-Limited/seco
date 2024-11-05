import React from 'react';

const Header = () => {
  return (
    <header
      className="fixed top-0 z-10 w-full ml-39px mr-49px flex items-center justify-between px-6 md:px-16 transition-all duration-300"
      style={{
        height: '75px', // Header height
        backgroundColor: 'rgba(0, 0, 0, 1)', // Fixed opacity
      }}
    >
      {/* Logo section */}
      <div className="flex items-center space-x-2">
        <h6
        href="getseco.com"
          className="text-white font-bold"
          style={{
            fontFamily: 'CustomFont',
            fontSize: '30px', // Adjust font size for mobile
            paddingRight: '60px', // Smaller padding for mobile
            }}
          >
            seco
          </h6>
          <a
            href="getseco.com"
            className="hidden sm:inline text-slate-200"
            style={{ fontSize: '16px', fontWeight: '500' }}
          >
            home
          </a>
          <a
            href="discover.getseco.com"
            className="hidden sm:inline text-slate-200"
            style={{ fontSize: '16px', fontWeight: '500' ,marginLeft: '30px'}}
          >
            discover
          </a>
          </div>

          {/* Button with responsive size */}
      <a
      href="getseco./contact"
        className="bg-white text-black rounded-full px-4 py-2 md:px-5 md:py-3 hover:bg-gray-100 transition duration-300 text-sm md:text-base"
        style={{ fontWeight: '400' }}
      >
        join waitlist
      </a>
    </header>
  );
};

export default Header;

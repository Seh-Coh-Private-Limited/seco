import React from 'react';

const Header = () => {
  return (
    <header
      className="fixed top-0 w-full flex items-center justify-between px-6 md:px-16 transition-all duration-300"
      style={{
        height: '75px', // Header height
        backgroundColor: 'rgba(0, 0, 0, 1)', // Fixed opacity
      }}
    >
      {/* Logo section */}
      <div className="flex items-center space-x-2">
        <h6
          className="text-white font-bold"
          style={{
            fontFamily: 'CustomFont',
            fontSize: '24px', // Adjust font size for mobile
            paddingRight: '20px', // Smaller padding for mobile
            }}
          >
            seco
          </h6>
          <a
            href="https://twisteddco.wixstudio.io/getseco"
            className="hidden sm:inline text-slate-100"
            style={{ fontSize: '16px', fontWeight: '500' }}
          >
            home
          </a>
          </div>

          {/* Button with responsive size */}
      <a
      href="https://twisteddco.wixstudio.io/getseco/contact"
        className="bg-white text-black rounded-full px-4 py-2 md:px-5 md:py-3 hover:bg-gray-100 transition duration-300 text-sm md:text-base"
        style={{ fontWeight: '400' }}
      >
        join waitlist
      </a>
    </header>
  );
};

export default Header;

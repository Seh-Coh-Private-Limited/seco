import React from 'react';
import { SignIn, SignOut, useAuth } from '@clerk/clerk-react'; // Import SignOut and useAuth
import './SignUp.css'; // Import the CSS file

const Signup = () => {
  const { isSignedIn, signOut } = useAuth(); // Use useAuth to check auth state

  const handleSignInSuccess = () => {
    // Automatically redirect to /discover after sign-in
    window.location.href = '/discover'; // Redirect to discover page
  };

  const handleLogout = () => {
    signOut(); // Sign the user out
    // Optionally redirect after logout, you can keep it to default behavior
    window.location.href = '/'; // Redirect to home or login page after logout
  };

  return (
    <div className="signup-container">
      <div className="form-container">
        {isSignedIn ? (
          // Show the SignOut button if the user is signed in
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        ) : (
          // Show SignIn component if the user is not signed in
          <SignIn 
            redirectUrl="/discover" // Redirect URL if using Clerk's internal redirection
            onSignInSuccess={handleSignInSuccess} // Handle sign-in success
          />
        )}
      </div>

      <div className="illustration-container">
        <svg width="100%" height="600" viewBox="0 0 704 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="996" height="600" rx="150" fill="#ECB462" />
        </svg>
      </div>
    </div>
  );
};

export default Signup;

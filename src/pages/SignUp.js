import React, { useState, useEffect } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  OAuthProvider,
  RecaptchaVerifier,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase'; // Make sure to import db from firebase config

const Authentication = () => {
  // Existing state management code remains the same
  const navigate = useNavigate();
  const [authMethod, setAuthMethod] = useState('email');
  const [isSignIn, setIsSignIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const SESSION_TIMEOUT = 40 * 60 * 1000;
  const location = useLocation();
  
  useEffect(() => {
    // Set up session timeout
    const setupSessionTimeout = () => {
      const sessionData = localStorage.getItem('sessionData');
      if (sessionData) {
        const { sessionStartTime } = JSON.parse(sessionData);
        const timeElapsed = new Date().getTime() - new Date(sessionStartTime).getTime();
        
        if (timeElapsed >= SESSION_TIMEOUT) {
          handleLogout();
        } else {
          // Set timeout for remaining time
          const remainingTime = SESSION_TIMEOUT - timeElapsed;
          setTimeout(handleLogout, remainingTime);
        }
      }
    };

    setupSessionTimeout();

    // Protect routes from direct URL access
    const checkAuthentication = async () => {
      const sessionData = localStorage.getItem('sessionData');
      if (!sessionData && location.pathname !== '/') {
        navigate('/');
      }
    };

    checkAuthentication();
  }, [location, navigate]);



  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('sessionData');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };





  const createUserSession = async (uid, category) => {
    try {
      const sessionRef = doc(db, 'sessions', uid);
      const sessionData = {
        uid,
        category,
        createdAt: new Date(),
        lastActivity: new Date(),
        isActive: true,
        expiresAt: new Date(new Date().getTime() + SESSION_TIMEOUT)
      };
      
      await setDoc(sessionRef, sessionData);
      
      localStorage.setItem('sessionData', JSON.stringify({
        uid,
        category,
        sessionStartTime: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  };

  const handleCategoryBasedRedirect = (category) => {
    if (category === 'Startup') {
      navigate('/fdashboard');
    } else {
      navigate('/dashboard');
    }
  };

  // Modified createUserDocument function with session handling
  const createUserDocument = async (user, additionalData = {}) => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // New user - create user document and session
      const createdAt = new Date();
      try {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          phoneNumber: user.phoneNumber,
          createdAt,
          lastLogin: createdAt,
          ...additionalData
        });
        await createUserSession(user.uid);
      } catch (error) {
        console.error('Error creating user document:', error);
        throw error;
      }
    } else {
      // Existing user - update last login and create new session
      await setDoc(userRef, { lastLogin: new Date() }, { merge: true });
      await createUserSession(user.uid);
    }
  };

  // Modified email authentication handler
 // Modified email authentication handler
 const handleEmailAuth = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    let userCredential;
    if (isSignIn) {
      userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userRef = doc(db, 'users', userCredential.user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        await createUserSession(userCredential.user.uid, userData.category);
        handleCategoryBasedRedirect(userData.category);
      } else {
        throw new Error('User account not found');
      }
    } else {
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await createUserDocument(userCredential.user, {
        signUpMethod: 'email',
        accountType: 'email',
        category: 'Startup' // Default category for new users
      });
      navigate('/startupregform');
    }
  } catch (err) {
    console.error('Email auth error:', err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  // Modified Google Sign-In handler
  const handleSocialSignIn = async (provider, providerName) => {
    setLoading(true);
    setError('');

    try {
      const result = await signInWithPopup(auth, provider);
      const userRef = doc(db, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        await createUserSession(result.user.uid, userData.category);
        handleCategoryBasedRedirect(userData.category);
      } else {
        await createUserDocument(result.user, {
          signUpMethod: providerName,
          accountType: providerName,
          category: 'Startup' // Default category for new users
        });
        navigate('/startupregform');
      }
    } catch (err) {
      console.error(`${providerName} sign-in error:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => handleSocialSignIn(new GoogleAuthProvider(), 'google');
  const handleMicrosoftSignIn = () => handleSocialSignIn(new OAuthProvider('microsoft.com'), 'microsoft');


  // Modified OTP verification handler
  // Modified OTP verification handler
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const confirmationResult = window.confirmationResult;
      const result = await confirmationResult.confirm(otp);
      const userRef = doc(db, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        await createUserSession(result.user.uid, userData.category);
        handleCategoryBasedRedirect(userData.category);
      } else {
        await createUserDocument(result.user, {
          signUpMethod: 'phone',
          accountType: 'phone',
          phoneNumber: result.user.phoneNumber,
          category: 'Startup' // Default category for new users
        });
        navigate('/startupregform');
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

 // Handle Phone Number authentication
 const handleSendOTP = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
    setupRecaptcha();
    const appVerifier = window.recaptchaVerifier;
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
    window.confirmationResult = confirmationResult;
    setOtpSent(true);
    setError('');
  } catch (err) {
    console.error('Error sending OTP:', err);
    setError(err.message);
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
  } finally {
    setLoading(false);
  }
};
 // Initialize reCAPTCHA verifier
 const setupRecaptcha = () => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {
        console.log('Recaptcha verified');
      },
      'expired-callback': () => {
        setError('reCAPTCHA expired. Please try again.');
        window.recaptchaVerifier = null;
      }
    });
  }
};
  // Modified OTP verification handler
 
  return (
    <div className="min-h-screen bg-white">
      {/* Header with Progress Steps */}
      <div className="px-4 py-3 bg-white">
        <div className="max-w-6xl flex justify-between gap-8">
          {/* Logo */}
          <div className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'CustomFont', fontSize: '30px', paddingLeft: '10px', paddingRight: '300px' }}>
            seco
          </div>
          {/* Progress Steps */}
          <div className="flex items-center flex-1 justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">✓</div>
              <span className="text-sm text-gray-900">Create your account</span>
            </div>
            <div className="h-px bg-gray-300 flex-1" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm">2</div>
              <span className="text-sm text-gray-600">Customize your experience</span>
            </div>
            <div className="h-px bg-gray-300 flex-1" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm">3</div>
              <span className="text-sm text-gray-600">Apply for Programmes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Authentication Form */}
      <div className="p-4 rounded-xl">
        <div className="flex justify-between items-center h-[calc(100vh/1.14)] bg-gray-300 px-16 py-8 rounded-xl">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            {/* Title */}
            <h2 className="text-2xl font-bold text-center mb-2">
              {isSignIn ? 'Sign In' : 'Sign Up'}
            </h2>
            <p className="text-gray-600 text-center mb-6">
              {isSignIn ? 'Welcome back!' : 'Create your account'}
            </p>

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Social Sign-In Buttons */}
            <div className="flex justify-between space-x-4 mb-6">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="flex items-center justify-center w-full p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <img src="https://img.icons8.com/color/24/000000/google-logo.png" alt="Google" className="w-5 h-5" />
                <span className="ml-2 text-sm">Google</span>
              </button>
              <button
                onClick={handleMicrosoftSignIn}
                disabled={loading}
                className="flex items-center justify-center w-full p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <img src="https://img.icons8.com/color/24/000000/microsoft.png" alt="Microsoft" className="w-5 h-5" />
                <span className="ml-2 text-sm">Microsoft</span>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center mb-6">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm text-gray-500">or</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Auth Method Toggle */}
            <div className="flex justify-between text-sm mb-4">
              <button
                onClick={() => setAuthMethod('email')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  authMethod === 'email' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Email
              </button>
              <button
                onClick={() => setAuthMethod('phone')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  authMethod === 'phone' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Phone
              </button>
            </div>

            {/* Authentication Forms */}
            {authMethod === 'email' ? (
              // Email Authentication Form
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : isSignIn ? 'Sign In' : 'Sign Up'}
                </button>
              </form>
            ) : (
              // Phone Authentication Form
              <div className="space-y-4">
                {!otpSent ? (
                  <form onSubmit={handleSendOTP}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+1234567890"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {loading ? 'Sending...' : 'Send OTP'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOTP}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Enter OTP
                      </label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Toggle Sign In/Up */}
            <p className="mt-4 text-sm text-center">
              <button
                onClick={() => setIsSignIn(!isSignIn)}
                className="text-blue-600 hover:text-blue-500"
              >
                {isSignIn ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* reCAPTCHA container */}
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default Authentication;
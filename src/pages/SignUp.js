import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup
} from 'firebase/auth';
import React, { useState } from 'react';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import OTPInput from 'otp-input-react';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignIn, setIsSignIn] = useState(true); // Toggle between sign-in and sign-up mode
  const [isUsingPhone, setIsUsingPhone] = useState(false); // Toggle between email and phone input
  const [errorMessage, setErrorMessage] = useState(''); // Store error messages
  const [loading, setLoading] = useState(false); // Loading state for form submission
  const [phone, setPhone] = useState(''); // Store phone number
  const [otp, setOtp] = useState(''); // Store OTP
  const [otpSent, setOtpSent] = useState(false); // Toggle to show OTP input field

  const [verificationId, setVerificationId] = useState(null); 
  const navigate = useNavigate(); // Use navigate for redirecting



  // Set up reCAPTCHA verifier
  const setUpRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        'recaptcha-container',
        { size: 'invisible' },
        auth
      );
    }
  };

  // Handle phone authentication
  const handlePhoneAuth = async () => {
    setLoading(true);
    setErrorMessage('');
    setUpRecaptcha();
    const appVerifier = window.recaptchaVerifier;

    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
      setVerificationId(confirmationResult.verificationId);
      setOtpSent(true);
    } catch (error) {
      setErrorMessage(`Phone Auth Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification
  const verifyOtp = async () => {
    setLoading(true);
    try {
      const credential = auth.PhoneAuthProvider.credential(verificationId, otp);
      await auth.signInWithCredential(credential);
      navigate('/dashboard');
    } catch (error) {
      setErrorMessage(`OTP Verification Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
      navigate('/dashboard'); // Navigates to dashboard after Google Sign-In
    } catch (error) {
      setErrorMessage(`Google Sign-In Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle Microsoft Sign-In
  const handleMicrosoftSignIn = async () => {
    const provider = new OAuthProvider('microsoft.com');
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
      navigate('/dashboard'); // Navigates to dashboard after Microsoft Sign-In
    } catch (error) {
      setErrorMessage(`Microsoft Sign-In Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle Email/Password Sign-In or Sign-Up
  const handleEmailAuth = async () => {
    setLoading(true);
    setErrorMessage(''); // Clear previous errors
    try {
      if (isSignIn) {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/dashboard'); // Navigates existing users to dashboard
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        navigate('/startupregform'); // Navigates new users to StartupRegForm page
      }
    } catch (error) {
      setErrorMessage(`Email Auth Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-4 py-3 bg-white">
        <div className="max-w-6xl flex justify-between gap-8">
          {/* Logo */}
          <div className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'CustomFont', fontSize: '30px', paddingLeft: '10px', paddingRight: '300px' }}>
            seco
          </div>
          {/* Progress Steps: Centered */}
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

       {/* Sign-In / Sign-Up Form */}
<div className="p-4 rounded-xl">
  <div className="flex justify-between items-center h-[calc(100vh/1.14)] bg-gray-300 px-16 py-8 rounded-xl">
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
      <h2 className="text-2xl font-bold mb-2">{isSignIn ? 'Sign In' : 'Sign Up'}</h2>
      <p className="text-gray-600 mb-6">Welcome back! Please sign in to continue</p>

      {/* Error Message Display */}
      {errorMessage && <div className="text-red-500 mb-4">{errorMessage}</div>}

      {/* Social Sign-In Buttons */}
      <div className="flex justify-between space-x-4 mb-6">
        <button onClick={handleGoogleSignIn} className="flex items-center justify-center w-full p-2 bg-gray-200 rounded-lg" disabled={loading}>
          <img src="https://img.icons8.com/color/24/000000/google-logo.png" alt="Google" />
          <span className="ml-2">Google</span>
        </button>
        <button onClick={handleMicrosoftSignIn} className="flex items-center justify-center w-full p-2 bg-gray-200 rounded-lg" disabled={loading}>
          <img src="https://img.icons8.com/color/24/000000/microsoft.png" alt="Microsoft" />
          <span className="ml-2">Microsoft</span>
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center mb-4">
        <hr className="w-full border-gray-300" />
        <span className="px-2 text-gray-500">or</span>
        <hr className="w-full border-gray-300" />
      </div>

      {/* Toggle Email/Phone Sign-In */}
      <div className="flex justify-between text-gray-700 mb-2 text-sm">
        <label htmlFor="email" className="flex-grow text-left">{isUsingPhone ? 'Phone number' : 'Email address'}</label>
        <span className="cursor-pointer text-blue-500" onClick={() => setIsUsingPhone(!isUsingPhone)}>
          {isUsingPhone ? 'Use email' : 'Use phone'}
        </span>
      </div>

      {/* Phone or Email Input */}
      {isUsingPhone ? (
        <>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number"
            className="w-full p-3 border border-gray-300 rounded-md mb-6 focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <button
            onClick={handlePhoneAuth}
            className="w-full py-3 bg-gray-800 text-white font-semibold rounded-md hover:bg-gray-900 transition"
            disabled={loading}
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>

          {/* OTP Input */}
          {otpSent && (
            <div className="mt-4">
              <OTPInput
                value={otp}
                onChange={setOtp}
                autoFocus
                OTPLength={6}
                otpType="number"
                disabled={false}
                className="otp-container"
              />
              <button
                onClick={verifyOtp}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md mt-4 hover:bg-blue-700 transition"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
          )}
          <div id="recaptcha-container"></div>
        </>
      ) : (
        <>
          {/* Email and Password Inputs */}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full p-3 border border-gray-300 rounded-md mb-6 focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleEmailAuth}
            className="w-full py-3 bg-gray-800 text-white font-semibold rounded-md hover:bg-gray-900 transition"
            disabled={loading}
          >
            {loading ? 'Loading...' : isSignIn ? 'Sign In' : 'Sign Up'}
          </button>
        </>
      )}

      {/* Toggle Sign-In/Sign-Up */}
      <p onClick={() => setIsSignIn(!isSignIn)} className="text-center text-blue-500 cursor-pointer mt-4">
        {isSignIn ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
      </p>
    </div>
  </div>
</div>

    </div>
  );
};

export default Signup;

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  OAuthProvider,
  RecaptchaVerifier,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup
} from 'firebase/auth';
import OTPInput from 'otp-input-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Card, CardContent, Typography, TextField, Button } from '@mui/material';


const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignIn, setIsSignIn] = useState(true); // Toggle between sign-in and sign-up mode
  const [isUsingPhone, setIsUsingPhone] = useState(false); // Toggle between email and phone input
  const [errorMessage, setErrorMessage] = useState(''); // Store error messages
  const [loading, setLoading] = useState(false); // Loading state for form submission
  const [phone, setPhone] = useState(''); // Store phone number
  const [otp, setOtp] = useState(""); // Store OTP
  const [user, setUser] = useState(null); // Store user data
  const [otpSent, setOtpSent] = useState(false);
  const [hasFilled, setHasFilled] = useState(false);
  const [verificationId, setVerificationId] = useState(null); 
  const navigate = useNavigate(); // Use navigate for redirecting

  // Check if user is already signed in
  // useEffect(() => {
  //   const unsubscribe = auth.onAuthStateChanged(user => {
  //     if (user) {
  //       // User is signed in, store session data
  //       localStorage.setItem('user', JSON.stringify(user));
  //       navigate('/dashboard'); // Redirect to dashboard
  //     } else {
  //       // User is not signed in, clear session
  //       localStorage.removeItem('user');
  //     }
  //   });

  //   return () => unsubscribe(); // Cleanup listener on unmount
  // }, [navigate]);

  // Set up reCAPTCHA verifier
  // const setUpRecaptcha = () => {
  //   if (!window.recaptchaVerifier) {
  //     window.recaptchaVerifier = new RecaptchaVerifier(
  //       'recaptcha-container',
  //       { size: 'invisible' },
  //       auth
  //     );
  //   }
  // };

 
  // Handle OTP verification
  // const verifyOtp = async () => {
  //   setLoading(true);
  //   try {
  //     const credential = auth.PhoneAuthProvider.credential(verificationId, otp);
  //     await auth.signInWithCredential(credential);
  //     navigate('/dashboard');
  //   } catch (error) {
  //     setErrorMessage(`OTP Verification Error: ${error.message}`);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, provider);
      // Store user session info
      // localStorage.setItem('user', JSON.stringify(userCredential.user));
      navigate('/dashboard');
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
      const userCredential = await signInWithPopup(auth, provider);
      // Store user session info
      // localStorage.setItem('user', JSON.stringify(userCredential.user));
      navigate('/dashboard');
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
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Store user session info
        // localStorage.setItem('user', JSON.stringify(userCredential.user));
        navigate('/dashboard'); // Navigates existing users to dashboard
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Store user session info
        // localStorage.setItem('user', JSON.stringify(userCredential.user));
        navigate('/startupregform'); // Navigates new users to StartupRegForm page
      }
    } catch (error) {
      setErrorMessage(`Email Auth Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // const sendOtp= async()=>{
  //   try{
  //     const recaptcha = new RecaptchaVerifier(auth,"recaptcha",{});
  //     const confirmation = await signInWithPhoneNumber(auth,phone,recaptcha);
  //     setUser(confirmation);
  //     setOtpSent(true);
  //   }catch(error){
  //     console.error(error);
  //   }
  
  // }

  // const verifyOtp= async()=>{
  //   try {
  //     await user.confirm(otp);
  //     navigate('/dashboard');
  //   } catch (error) {
      
  //   }
      
  // }
  const generateRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        'recaptcha',
        {
          size: 'invisible',
          callback: (response) => {
            console.log("reCAPTCHA solved");
          },
          'expired-callback': () => {
            console.log("reCAPTCHA expired. Please try again.");
          },
        },
        auth
      );
    }
  };
  

  const handleSend = (event) => {
    event.preventDefault();
    setHasFilled(true);
    generateRecaptcha();
    let appVerifier = window.recaptchaVerifier;
    signInWithPhoneNumber(auth, phone, appVerifier)
      .then((confirmationResult) => {
        // SMS sent. Prompt user to type the code from the message, then sign the
        // user in with confirmationResult.confirm(code).
        window.confirmationResult = confirmationResult;
      }).catch((error) => {
        // Error; SMS not sent
        console.log(error);
      });
  }
  
  const verifyOtp = (event) => {
    let otp = event.target.value;
    setOtp(otp);

    if (otp.length === 6) {
      // verifu otp
      let confirmationResult = window.confirmationResult;
      confirmationResult.confirm(otp).then((result) => {
        // User signed in successfully.
        let user = result.user;
        console.log(user);
        alert('User signed in successfully');
        // ...
      }).catch((error) => {
        // User couldn't sign in (bad verification code?)
        // ...
        alert('User couldn\'t sign in (bad verification code?)');
      });
    }
  }

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
  <div className="app__container">
      {!otpSent ? (
        <Card sx={{ width: '300px' }}>
          <CardContent
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
            }}
          >
            <Typography
              sx={{ padding: '20px' }}
              variant="h5"
              component="div"
            >
              Enter your phone number
            </Typography>
            <form onSubmit={handleSend}>
              <TextField
                sx={{ width: '240px' }}
                variant="outlined"
                autoComplete="off"
                label="Phone Number"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
              <Button
                type="submit"
                variant="contained"
                sx={{ width: '240px', marginTop: '20px' }}
              >
                Send Code
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ width: '300px' }}>
          <CardContent
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
            }}
          >
            <Typography
              sx={{ padding: '20px' }}
              variant="h5"
              component="div"
            >
              Enter the OTP
            </Typography>
            <TextField
              sx={{ width: '240px' }}
              variant="outlined"
              label="OTP"
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
            />
            <Button
              onClick={verifyOtp}
              variant="contained"
              sx={{ width: '240px', marginTop: '20px' }}
            >
              Verify OTP
            </Button>
          </CardContent>
        </Card>
      )}
      <div id="recaptcha"></div>
    </div>


    
          {/* <button
            onClick={handlePhoneAuth}
            className="w-full py-3 bg-gray-800 text-white font-semibold rounded-md hover:bg-gray-900 transition"
            disabled={loading}
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>

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
          )} */}
          {/* <div id="recaptcha-container"></div> */}
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

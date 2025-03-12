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
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { auth, db, collection, where, query, getDocs } from '../firebase';

const SignUp = () => {
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
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      const user = auth.currentUser;
      const sessionData = localStorage.getItem('sessionData');
      
      if (user && sessionData) {
        const { sessionStartTime, expiresAt } = JSON.parse(sessionData);
        const now = new Date().getTime();
        const expiration = new Date(expiresAt).getTime();
        
        if (now < expiration) {
          navigate('/dashboard');
        } else {
          handleLogout();
        }
      }
    };
  
    checkSession();
  }, []);

  const handleLogout = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const sessionRef = doc(db, 'sessions', user.uid);
        await setDoc(sessionRef, { isActive: false }, { merge: true });
      }
      await signOut(auth);
      localStorage.removeItem('sessionData');
      navigate('/signup');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const createUserSession = async (uid) => {
    try {
      const sessionRef = doc(db, 'sessions', uid);
      const sessionStartTime = new Date().toISOString();
      const expiresAt = new Date(new Date().getTime() + SESSION_TIMEOUT);
      const isJudge = await checkIfJudge(auth.currentUser.email);
      
      const sessionData = {
        uid,
        isJudge,
        sessionStartTime,
        lastActivity: sessionStartTime,
        isActive: true,
        expiresAt,
      };
      
      await setDoc(sessionRef, sessionData);
      
      localStorage.setItem('sessionData', JSON.stringify({
        uid,
        isJudge,
        sessionStartTime,
        expiresAt: expiresAt.toISOString(),
      }));
      
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  };

  const checkIfJudge = async (email) => {
    try {
      const judgesRef = collection(db, 'judges');
      const q = query(judgesRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error in checkIfJudge:', error);
      return false;
    }
  };

  const createUserDocument = async (user, additionalData = {}) => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
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
      await setDoc(userRef, { lastLogin: new Date() }, { merge: true });
      await createUserSession(user.uid);
    }
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      throw new Error('Password must be at least 12 characters long');
    }
    
    if (!(hasUppercase && hasLowercase && hasNumbers && hasSpecialChar)) {
      throw new Error('Password must contain uppercase, lowercase, numbers, and special characters');
    }

    const commonPatterns = [/password/i, /12345/, /qwerty/i, /admin/i];
    if (commonPatterns.some(pattern => pattern.test(password))) {
      throw new Error('Password contains common unsafe patterns');
    }

    return true;
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!isSignIn) {
        try {
          validatePassword(password);
        } catch (validationError) {
          setError(validationError.message);
          setLoading(false);
          return;
        }
      }

      let userCredential;
      if (isSignIn) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        await createUserSession(userCredential.user.uid);
        navigate('/dashboard');
      } else {
        if (!firstName || !lastName) {
          setError('First name and last name are required');
          setLoading(false);
          return;
        }

        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await createUserDocument(userCredential.user, {
          signUpMethod: 'email',
          accountType: 'email',
          companyName: companyName || '',
          contacts: [{
            email,
            firstName,
            lastName,
            mobile: phoneNumber || '',
          }],
        });
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Email auth error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider, providerName) => {
    setLoading(true);
    setError('');
    
    try {
      const result = await signInWithPopup(auth, provider);
      await createUserDocument(result.user, {
        signUpMethod: providerName,
        accountType: providerName,
      });
      navigate('/dashboard');
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        console.error(`${providerName} sign-in error:`, err);
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => handleSocialSignIn(new GoogleAuthProvider(), 'google');
  const handleMicrosoftSignIn = () => handleSocialSignIn(new OAuthProvider('microsoft.com'), 'microsoft');

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const confirmationResult = window.confirmationResult;
      const result = await confirmationResult.confirm(otp);
      await createUserDocument(result.user, {
        signUpMethod: 'phone',
        accountType: 'phone',
        phoneNumber: result.user.phoneNumber,
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 py-3 bg-white">
        <div className="max-w-6xl flex justify-between gap-8">
          <div
            className="text-xl font-semibold text-gray-900 cursor-pointer"
            style={{ fontFamily: 'CustomFont', fontSize: '30px', paddingLeft: '10px', paddingRight: '300px' }}
            onClick={() => window.location.href = 'https://discover.getseco.com/signup'}
          >
            seco
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl">
        <div className="flex justify-between items-center h-[calc(100vh/1.14)] bg-gray-300 pl-16 py-8 rounded-xl
          mobile:flex-col mobile:h-auto mobile:pl-0 mobile:py-4">
          
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md h-[calc(100vh/1.35)] 
            overflow-y-auto scrollbar-hide
            mobile:bg-gray-100 mobile:h-auto mobile:min-h-[500px] mobile:max-w-[90%] mobile:mx-auto mobile:my-4
            tablet:bg-white tablet:h-auto tablet:max-w-[70%] tablet:mx-auto tablet:my-4">
            <h2 className="text-2xl font-bold text-center mb-2">
              {isSignIn ? 'Sign In' : 'Sign Up'}
            </h2>
            <p className="text-gray-600 text-center mb-6">
              {isSignIn ? 'Welcome back!' : 'Create your account'}
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

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

            <div className="flex items-center mb-6">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm text-gray-500">or</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {isSignIn && (
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
            )}

            {authMethod === 'email' ? (
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {!isSignIn && (
                  <>
                    <div className="flex space-x-2 mobile:flex-col mobile:space-x-0 mobile:space-y-2">
                      <div className="w-1/2 mobile:w-full">
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="First Name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div className="w-1/2 mobile:w-full">
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Last Name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Company Name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Phone Number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </>
                )}
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
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
              <div className="space-y-4">
                {!otpSent ? (
                  <form onSubmit={handleSendOTP}>
                    <div className="mb-4">
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

            <p className="mt-4 text-sm text-center">
              <a
                onClick={() => setIsSignIn(!isSignIn)}
                className="text-blue-600 hover:text-black"
              >
                {isSignIn ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </a>
            </p>
          </div>

          <div className="bg-[#F99F31] p-8 rounded-tl-[150px] rounded-bl-[75px] rounded-r-xl shadow-lg 
            w-[700px] h-[calc(100vh/1.14)] ml-8
            hidden sm:block
            tablet:w-full tablet:max-w-[700px] tablet:mx-auto tablet:mt-4">
          </div>
        </div>
      </div>

      <div id="recaptcha-container"></div>
    </div>
  );
};

export default SignUp;
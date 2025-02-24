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
import { auth, db,collection,where,query,getDocs } from '../firebase'; // Make sure to import db from firebase config

const SignUp = () => {
  // Existing state management code remains the same
  const navigate = useNavigate();
  const [authMethod, setAuthMethod] = useState('email');
  const [isSignIn, setIsSignIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('category'); // 'category' or 'auth'

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const SESSION_TIMEOUT = 40 * 60 * 1000;
  const location = useLocation();
 const [category, setCategory] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const user = auth.currentUser;
      const sessionData = localStorage.getItem('sessionData');
      
      if (user && sessionData) {
        const { sessionStartTime, category, expiresAt } = JSON.parse(sessionData);
        const now = new Date().getTime();
        const expiration = new Date(expiresAt).getTime();
        
        if (now < expiration) {
          // Session is still valid
          handleCategoryBasedRedirect(category);
        } else {
          // Session expired
          handleLogout();
        }
      }
    };
  
    checkSession();
  }, []);
  

  const handleCategorySubmit = () => {
    if (!category) {
      setError('Please select a category');
      return;
    }
    setError('');
    setStep('auth');
  };

  // const handleCategoryBasedRedirect = (selectedCategory) => {
  //   if (selectedCategory === 'startup') {
  //     navigate('/fdashboard');
  //   } else {
  //     navigate('/dashboard');
  //   }
  // };

  // Rest of your existing authentication functions remain the same, 
  // but use the category state that was selected in the first step

  const CategorySelection = () => {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl  text-gray-900 mb-6">
          Select your category
        </h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleCategorySelect('startup')}
            className={`px-8 py-3 rounded-lg transition-all ${
              category === 'startup'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
            }`}
          >
            Startup
          </button>
          <button
            onClick={() => handleCategorySelect('incubator')}
            className={`px-8 py-3 rounded-lg transition-all ${
              category === 'incubator'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
            }`}
          >
            Incubator
          </button>
        </div>
      </div>
    );
  };

  const handleCategorySelect = (selectedCategory) => {
    setCategory(selectedCategory);
    setStep('auth');
    setShowAuth(true);
  };
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





  const createUserSession = async (uid, category) => {
    try {
      const sessionRef = doc(db, 'sessions', uid);
      const sessionStartTime = new Date().toISOString();
      const expiresAt = new Date(new Date().getTime() + SESSION_TIMEOUT);
      const isJudge = await checkIfJudge(auth.currentUser.email);
      
      const finalCategory = category || 'default';
      const sessionData = {
        uid,
        category: finalCategory,
        isJudge,
        sessionStartTime,
        lastActivity: sessionStartTime,
        isActive: true,
        expiresAt,
      };
      
      console.log('Creating session with:', sessionData);
      await setDoc(sessionRef, sessionData);
      
      localStorage.setItem('sessionData', JSON.stringify({
        uid,
        category: finalCategory,
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
      const isJudge = !querySnapshot.empty;
      console.log('checkIfJudge:', { email, isJudge });
      return isJudge;
    } catch (error) {
      console.error('Error in checkIfJudge:', error);
      return false;
    }
  };
  
 // Add logging to debug the values
const handleCategoryBasedRedirect = (category) => {
  const sessionData = JSON.parse(localStorage.getItem('sessionData'));
  const currentCategory = category || sessionData?.category || 'default';
  const isJudge = sessionData?.isJudge || false;

  console.log('handleCategoryBasedRedirect:', {
    currentCategory,
    isJudge,
    sessionData,
  });

  if (isJudge && currentCategory !== 'startup' && currentCategory !== 'incubator') {
    console.log('Redirecting to judgedashboard');
    navigate('/judgedashboard');
  } else if (currentCategory === 'startup') {
    console.log('Redirecting to fdashboard');
    navigate('/fdashboard');
  } else {
    console.log('Redirecting to dashboard');
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
// Add password validation and security checks
const validatePassword = (password) => {
  // Minimum requirements for password
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

  // Check for common password patterns to avoid
  const commonPatterns = [
    /password/i,
    /12345/,
    /qwerty/i,
    /admin/i,
  ];

  if (commonPatterns.some(pattern => pattern.test(password))) {
    throw new Error('Password contains common unsafe patterns');
  }

  return true;
};
  // Modified email authentication handler
 // Modified email authentication handler
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
      const userRef = doc(db, 'users', userCredential.user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const isJudge = await checkIfJudge(email);
        console.log('SignIn userData:', { userData, isJudge });
        await createUserSession(userCredential.user.uid, userData.category);
        
        if (isJudge && userData.category !== 'startup' && userData.category !== 'incubator') {
          console.log('SignIn: Redirecting to judgedashboard');
          navigate('/judgedashboard');
        } else {
          handleCategoryBasedRedirect(userData.category);
        }
      } else {
        throw new Error('User account not found');
      }
    } else {
      if (!firstName || !lastName || !category) {
        setError('All fields are required');
        setLoading(false);
        return;
      }

      userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await createUserDocument(userCredential.user, {
        signUpMethod: 'email',
        accountType: 'email',
        category,
        companyName: companyName || '',
        contacts: [{
          email,
          firstName,
          lastName,
          mobile: phoneNumber || '',
        }],
      });
      
      const isJudge = await checkIfJudge(email);
      console.log('SignUp:', { category, isJudge });
      if (isJudge && category !== 'startup' && category !== 'incubator') {
        console.log('SignUp: Redirecting to judgedashboard');
        navigate('/judgedashboard');
      } else {
        handleCategoryBasedRedirect(category);
      }
    }
  } catch (err) {
    console.error('Email auth error:', err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
useEffect(() => {
  setStep(isSignIn ? 'auth' : 'category');
}, [isSignIn]);



  // Modified Google Sign-In handler
  const handleSocialSignIn = async (provider, providerName) => {
    setLoading(true);
    setError('');
    
    try {
      const result = await signInWithPopup(auth, provider);
      const userRef = doc(db, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);
      const email = result.user.email;
      const isJudge = await checkIfJudge(email);
  
      if (userSnap.exists()) {
        const userData = userSnap.data();
        await createUserSession(result.user.uid, userData.category);
        
        console.log('Social SignIn:', { userData, isJudge });
        if (isJudge && userData.category !== 'startup' && userData.category !== 'incubator') {
          console.log('Social SignIn: Redirecting to judgedashboard');
          navigate('/judgedashboard');
        } else {
          handleCategoryBasedRedirect(userData.category);
        }
      } else {
        await createUserDocument(result.user, {
          signUpMethod: providerName,
          accountType: providerName,
          category: category || 'default',
        });
        
        console.log('Social SignUp:', { category, isJudge });
        if (isJudge && category !== 'startup' && category !== 'incubator') {
          console.log('Social SignUp: Redirecting to judgedashboard');
          navigate('/judgedashboard');
        } else {
          handleCategoryBasedRedirect(category);
        }
      }
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
          <div
  className="text-xl font-semibold text-gray-900 cursor-pointer"
  style={{ fontFamily: 'CustomFont', fontSize: '30px', paddingLeft: '10px', paddingRight: '300px' }}
  onClick={() => window.location.href = 'https://discover.getseco.com/signup'}
>
  seco
</div>

          {/* Progress Steps */}
          {/* <div className="flex items-center flex-1 justify-center gap-4">
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
          </div> */}
        </div>
      </div>

      {/* Main Authentication Form */}
      
      <div className="p-4 rounded-xl">
        <div className="flex justify-between items-center h-[calc(100vh/1.14)] bg-gray-300 pl-16 py-8 rounded-xl">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md h-[calc(100vh/1.35)] overflow-y-auto scrollbar-hide">
            {/* Title */}
            {!isSignIn && step === 'category' && !showAuth ? (
              <CategorySelection />
            ) : (
              <>
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
               {/* Auth Method Toggle - Only show for Sign In */}
{isSignIn && (
  <div className="flex justify-between text-sm mb-4">
    <button
      onClick={() => setAuthMethod('email')}
      className={`px-4 py-2 rounded-md transition-colors ${
        authMethod === 'email'
          ? 'bg-blue-100 text-blue-600'
          : 'text-gray-600 hover:bg-gray-100'
      } hover:bg-gray-100 hover:text-gray-600`}
    >
      Email
    </button>
    <button
      onClick={() => setAuthMethod('phone')}
      className={`px-4 py-2 rounded-md transition-colors ${
        authMethod === 'phone'
          ? 'bg-blue-100 text-blue-600'
          : 'text-gray-600 hover:bg-gray-100'
      } hover:bg-gray-100 hover:text-gray-600`}
    >
      Phone
    </button>
  </div>
)}



            {/* Authentication Forms */}
            {authMethod === 'email' ? (
  <form onSubmit={handleEmailAuth} className="space-y-4">
    {!isSignIn && (
      <>
        <div className="flex space-x-2">
          <div className="w-1/2">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="w-1/2">
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
            required
          />
        </div>
        <div>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Phone Number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        {/* <div className="flex items-center space-x-4">
  <label className="text-sm font-medium text-gray-400">
    Category
  </label>
  <label className="flex items-center">
    <input
      type="radio"
      name="category"
      value="startup"
      checked={category === "startup"}
      onChange={(e) => setCategory(e.target.value)}
      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
      required
    />
    <span className="ml-2 text-sm text-black-700">Startup</span>
  </label>
  <label className="flex items-center">
    <input
      type="radio"
      name="category"
      value="incubator"
      checked={category === "incubator"}
      onChange={(e) => setCategory(e.target.value)}
      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
      required
    />
    <span className="ml-2 text-sm text-black-700">Incubator</span>
  </label>
</div> */}

      </>
    )}
    <div>
      {/* <label className="block text-sm font-medium text-gray-700 mb-1">
        Email address
      </label> */}
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
      {/* <label className="block text-sm font-medium text-gray-700 mb-1">
        Password
      </label> */}
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
)  : (
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
            <a
  onClick={() => setIsSignIn(!isSignIn)}
  className="text-blue-600 hover:text-black"
>
  {isSignIn ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
</a>

</p>

              </>
            )}

          </div>
          <div class="bg-[#F99F31] p-8 rounded-tl-[150px] rounded-bl-[75px] rounded-r-xl shadow-lg w-[700px] h-[calc(100vh/1.14)] ml-8">

</div>


        </div>
        
      </div>

      {/* reCAPTCHA container */}
      <div id="recaptcha-container"></div>
      
    </div>
  );
};

export default SignUp;
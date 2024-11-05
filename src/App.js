import { ClerkProvider } from '@clerk/clerk-react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import './index.css';
import Discover from './pages/Discover';
import ProgramDetail from './pages/ProgramDetailPage';
import ProgramInsertPage from './pages/programInsertPage'; // Capitalized the component name
import SignUpPage from './pages/SignUp';


function App() {
  const PUBLISHABLE_KEY = 'pk_test_cG9zaXRpdmUtY295b3RlLTQzLmNsZXJrLmFjY291bnRzLmRldiQ';
  console.log(1)
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
    <Router>
     
      
      
    
      <Routes>
        <Route path="/" element={<Discover />} />
        <Route path="/pip" element={<ProgramInsertPage />} /> 
        <Route path="/program/:id" element={<ProgramDetail />} />
        <Route path="/signup" element={<SignUpPage />} />
        {/* Define more routes as needed */}
















        
      </Routes>
   
      
				
    </Router>
    </ClerkProvider>
  );
}

export default App;








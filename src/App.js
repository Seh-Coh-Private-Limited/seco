import '@fortawesome/fontawesome-free/css/all.min.css';
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import './index.css';
import Dashboard from './pages/Dashboard';
import DDashboard from './pages/Dashboarddddd'; // Capitalized the component name
import Discover from './pages/Discover';
import FounderDashboard from './pages/FounderDashboard'; // Capitalized the component name
import IDashboard from './pages/IDashboard'; // Capitalized the component name
import InsertSampleData from './pages/Insert'; // Capitalized the component name
import ProgramDetail from './pages/ProgramDetailPage';
import ProgramInsertPage from './pages/programInsertPage'; // Capitalized the component name
import SignUpPage from './pages/SignUp';
import StartupRegistrationForm from './pages/StartupRegistrationForm';
import Mediator from './components/Mediator';
import JudgeDashboard from './pages/JudgeDashboard';


function App() {
  return (
    <Router>
      <Routes>
      <Route path="/program/:programId" element={<ProgramDetail />} />
        <Route path="/judgedashboard" element={<JudgeDashboard/>}/>
        <Route path="/ddd" element={<DDashboard />} />  
        <Route path="/idashboard" element={<IDashboard />} />
        <Route path="/startupregform" element={<StartupRegistrationForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/fdashboard" element={<FounderDashboard />} />
        <Route path="/" element={<Discover />} />
        <Route path="/pip" element={<ProgramInsertPage />} /> 
        <Route path="/program/:id" element={<Mediator />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/insert" element={<InsertSampleData />} />
        {/* Define more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;

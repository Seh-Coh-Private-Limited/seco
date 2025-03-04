import '@fortawesome/fontawesome-free/css/all.min.css';
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import './index.css';
import Dashboard from './pages/Dashboard';
import DDashboard from './pages/Dashboarddddd';
import Discover from './pages/Discover';
import FounderDashboard from './pages/FounderDashboard';
import IDashboard from './pages/IDashboard';
import InsertSampleData from './pages/Insert';
import ProgramDetail from './pages/ProgramDetailPage';
import ProgramInsertPage from './pages/programInsertPage';
import SignUpPage from './pages/SignUp';
import StartupRegistrationForm from './pages/StartupRegistrationForm';
import Mediator from './components/Mediator';
import JudgeDashboard from './pages/JudgeDashBoardReDirect';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/program/:programId" element={<ProgramDetail />} />
        <Route path="/judge/:uid" element={<JudgeDashboard />} /> {/* Updated route for JudgeDashboard */}
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
      <ToastContainer
        position="top-center"
        // autoClose={5000}
        // hideProgressBar={false}
        // closeOnClick
        // pauseOnHover
        // draggable
      />
    </Router>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import LandingPage from './components/LandingPage';
import LoginCard from './components/LoginCard';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [currentUser, setCurrentUser] = useState(null);

  // Restore session from localStorage if present
  useEffect(() => {
    const savedUser = localStorage.getItem('sa_session');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        // Direct to portal based on type
        setActiveTab(parsed.isAdmin ? 'admin_portal' : 'student_portal');
      } catch (err) {
        localStorage.removeItem('sa_session');
      }
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('sa_session', JSON.stringify(userData));
    setActiveTab(userData.isAdmin ? 'admin_portal' : 'student_portal');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('sa_session');
    setActiveTab('home');
  };

  // Safe navigation that supports section scrolling on home
  const handleNavigate = (tabName) => {
    setActiveTab(tabName);
    
    // Smooth scrolling to section anchors if navigating to about/features
    if (tabName === 'about' || tabName === 'features') {
      setActiveTab('home'); // Keep active main tab as home
      setTimeout(() => {
        const element = document.getElementById(tabName);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="app-container">
      {/* Universal Responsive Navbar */}
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={handleNavigate} 
        currentUser={currentUser}
        handleLogout={handleLogout}
      />

      {/* Main Content Router */}
      <div className="main-content">
        {activeTab === 'home' && (
          <LandingPage setActiveTab={handleNavigate} />
        )}
        
        {activeTab === 'login' && (
          <LoginCard onLoginSuccess={handleLoginSuccess} />
        )}

        {activeTab === 'student_portal' && currentUser && !currentUser.isAdmin && (
          <StudentDashboard student={currentUser} onLogout={handleLogout} />
        )}

        {activeTab === 'admin_portal' && currentUser && currentUser.isAdmin && (
          <AdminDashboard onLogout={handleLogout} />
        )}
      </div>
    </div>
  );
}

export default App;

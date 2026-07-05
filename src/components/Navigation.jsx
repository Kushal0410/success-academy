import React, { useState } from 'react';
import { Menu, X, School, LogIn, LayoutDashboard, LogOut } from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab, currentUser, handleLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  const navigateTo = (tab) => {
    setActiveTab(tab);
    setIsOpen(false); // Close mobile drawer
  };

  return (
    <nav className="nav-header">
      <div className="container nav-container">
        {/* Brand Logo */}
        <a href="#" className="logo-link" onClick={() => navigateTo('home')}>
          <span className="logo-icon">
            <School size={32} />
          </span>
          Success Academy
        </a>

        {/* Desktop Navigation Links */}
        <ul className="nav-links">
          <li>
            <span 
              className={`nav-item-link ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => navigateTo('home')}
            >
              Home
            </span>
          </li>
          <li>
            <span 
              className={`nav-item-link ${activeTab === 'about' ? 'active' : ''}`}
              onClick={() => navigateTo('about')}
            >
              About
            </span>
          </li>
          <li>
            <span 
              className={`nav-item-link ${activeTab === 'features' ? 'active' : ''}`}
              onClick={() => navigateTo('features')}
            >
              Features
            </span>
          </li>
          
          {currentUser ? (
            <>
              <li>
                <span 
                  className={`nav-item-link ${['student_portal', 'admin_portal'].includes(activeTab) ? 'active' : ''}`}
                  onClick={() => navigateTo(currentUser.isAdmin ? 'admin_portal' : 'student_portal')}
                >
                  Dashboard
                </span>
              </li>
              <li>
                <button className="btn-portal-nav" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', borderColor: 'var(--border-light)', boxShadow: 'none' }} onClick={handleLogout}>
                  <LogOut size={16} />
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li>
              <button className="btn-portal-nav" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => navigateTo('login')}>
                <LogIn size={16} />
                Portal Login
              </button>
            </li>
          )}
        </ul>

        {/* Responsive Hamburger Toggle */}
        <button className="hamburger-btn" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle navigation menu">
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {isOpen && (
        <div className="mobile-nav-menu">
          <ul className="mobile-links">
            <li>
              <span 
                className={`mobile-item-link ${activeTab === 'home' ? 'active' : ''}`}
                onClick={() => navigateTo('home')}
              >
                Home
              </span>
            </li>
            <li>
              <span 
                className={`mobile-item-link ${activeTab === 'about' ? 'active' : ''}`}
                onClick={() => navigateTo('about')}
              >
                About
              </span>
            </li>
            <li>
              <span 
                className={`mobile-item-link ${activeTab === 'features' ? 'active' : ''}`}
                onClick={() => navigateTo('features')}
              >
                Features
              </span>
            </li>
            {currentUser ? (
              <>
                <li>
                  <span 
                    className={`mobile-item-link ${['student_portal', 'admin_portal'].includes(activeTab) ? 'active' : ''}`}
                    onClick={() => navigateTo(currentUser.isAdmin ? 'admin_portal' : 'student_portal')}
                  >
                    Dashboard ({currentUser.name})
                  </span>
                </li>
                <li>
                  <button 
                    className="btn-portal-nav" 
                    style={{ width: '100%', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'transparent', borderColor: 'var(--border-light)', boxShadow: 'none' }} 
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li>
                <button 
                  className="btn-portal-nav" 
                  style={{ width: '100%', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} 
                  onClick={() => navigateTo('login')}
                >
                  <LogIn size={16} />
                  Portal Login
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
}

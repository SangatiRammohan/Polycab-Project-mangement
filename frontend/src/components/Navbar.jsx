import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import image from '../assets/banner.jpg'; // Adjust the path as necessary

const Navbar = ({ isAdmin, onLogout }) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    onLogout();
    navigate('/');
  };
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Top section with logo image and title */}
        <div className="navbar-top">
          <div className="logo-container">
            <img
              src={image}
              alt="Polycab Logo"
              className="logo-image"
            />
          </div>
        </div>
        
        {/* Bottom section with navigation links */}
        <div className="navbar-bottom">
          <div className="navbar-links">
            {isAdmin && (
              <>
                <Link to="/dashboard" className="nav-link">
                  <i className="fa fa-user"></i>
                </Link>
                <Link to="/user-management" className="nav-link">
                  <i className="fa fa-users"></i>
                </Link>
                <Link to="/task-management" className="nav-link">
                  <i className="fa fa-tasks"></i> 
                </Link>
                <button onClick={handleLogout} className="logout-button">
                <i className="fas fa-sign-out-alt"></i>
 
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
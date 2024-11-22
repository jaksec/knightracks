import KnightLogo from '/logo.png';
import './background.scss';
import './Landing.css';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import pfp from '/profile_icon.png';
import arrow from '/arrow-dm.png';
import plus from '/add.png';

const Landing: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [isPopupVisible, setPopupVisible] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [isChartMode, setIsChartMode] = useState(true);

  const handleToggle = () => {
    setIsChartMode((prevMode) => !prevMode);
  };

  const closePopup = () => {
    setPopupVisible(false);
  };

  const showPopup = () => {
    setPopupVisible(true);
  };


  useEffect(() => {
    const getCookie = (name: string): string => {
      const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
      return match ? decodeURIComponent(match[2]) : '';
    };

  setFirstName(getCookie('firstName'));
  setLastName(getCookie('lastName'));

  const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = () => {
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'firstName=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'lastName=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    navigate('/');
  };

  return (
    <>
      <div id="stars-container">
        <div id="stars"></div>
        <div id="stars2"></div>
        <div id="stars3"></div>
      </div>

      <div className="background-menu">
        <div className="table-container" />
        <span className={`title_mode ${isChartMode ? "fade-in" : "fade-out"}`}>Entries</span>
        <span className={`title_mode ${!isChartMode ? "fade-in" : "fade-out"}`}>Nutrition</span>
      </div>
      
      <div className="container">
        <input
          type="checkbox"
          id="toggle"
          style={{ display: "none" }}
          onChange={handleToggle}
        />
        <label htmlFor="toggle" className="toggle-button">
          <span className={`emoji ${isChartMode ? "fade-in" : "fade-out"}`}>📊</span>
          <span className={`emoji ${!isChartMode ? "fade-in" : "fade-out"}`}>🍎</span>
        </label>
      </div>

      <div className="plus-button" onClick={showPopup}>
        <img src={plus} className="plus-button"></img>
      </div>

      {isPopupVisible && (
        <div className="overlay">
          <div className="popup-add" onClick={e => e.stopPropagation()}>
            <div className="x-add" onClick={closePopup}>&times;</div> {/* creates the x out button*/}
              <p>Custom and Search Mode</p>
              <p>Search Bar on search mode</p>
              <p>Fields on custom mode</p>
              <p>Result selected on search mode</p>
              <p>Add button</p>
          </div>
        </div>
      )}

      <div className="profile-container">
        <img src={pfp} className="profile" />
        <div onClick={() => setIsDropdownOpen((prev) => !prev)} ref={profileRef}>
          <img src={arrow} className={`arrow ${isDropdownOpen ? 'rotate' : ''}`} />
        </div>
        <div className={`dropdown-menu ${isDropdownOpen ? 'show' : 'hide'}`} ref={dropdownRef}>
          <p className="profile-name">{firstName} {lastName}</p>
          <button className="logout-button" onClick={handleLogout}>Log Out</button>
        </div>
      </div>

      <div>
        <img src={KnightLogo} className="logo" alt="Knight logo" />
      </div>
    </>
  );
};

export default Landing
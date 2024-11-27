import KnightLogo from '/logo.png';
import './background.scss';
import './Landing.css';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import pfp from '/profile_icon.png';
import arrow from '/arrow-dm.png';
import plus from '/add.png';
import axios from 'axios';
import edit from '/edit.png';
import del from '/trash.png';

const Landing: React.FC = () => {
  // State variables
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [isPopupVisible, setPopupVisible] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [isChartMode, setIsChartMode] = useState(true);

  const [name, setName] = useState<string>('');
  const [calories, setCalories] = useState<string>('');
  const [carbs, setCarbs] = useState<string>('');
  const [fats, setFats] = useState<string>('');
  const [proteins, setProteins] = useState<string>('');
  const [weight, setWeight] = useState<string>(''); // Added state for weight
  const [error, setError] = useState("");

  const [meals, setMeals] = useState<any[]>([]); // State for meals

  // Function to get cookies
  const getCookie = (name: string): string => {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? decodeURIComponent(match[2]) : '';
  };

  const validateInput = (value: string) => /^[0-9]*\.?[0-9]*$/.test(value);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleCalorieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (validateInput(e.target.value)) setCalories(e.target.value);
  };

  const handleCarbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (validateInput(e.target.value)) setCarbs(e.target.value);
  };

  const handleFatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (validateInput(e.target.value)) setFats(e.target.value);
  };

  const handleProteinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (validateInput(e.target.value)) setProteins(e.target.value);
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (validateInput(e.target.value)) setWeight(e.target.value);
  };

  const handleToggle = () => {
    setIsChartMode((prevMode) => !prevMode);
  };

  const closePopup = () => {
    setPopupVisible(false);
    setName('');
    setCalories('');
    setFats('');
    setCarbs('');
    setProteins('');
    setWeight('');
    setError('');
  };

  const showPopup = () => {
    setPopupVisible(true);
  };

  // Fetch meals when the component mounts
  useEffect(() => {
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

    // Fetch meals
    const fetchMeals = async () => {
      const userId = getCookie('id'); // Retrieve the user ID from the cookie

      if (!userId) {
        setError('User ID is missing. Please log in again.');
        return;
      }

      try {
        const response = await axios.get('http://146.190.71.194:5000/api/ingredient/getMeals', {
          params: { userId },
        });

        if (response.data) {
          setMeals(response.data);
        }
      } catch (error) {
        console.error('Error fetching meals:', error);
        setError('Failed to fetch meals. Please try again.');
      }
    };

    fetchMeals();

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = () => {
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'firstName=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'lastName=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'; // Clear the id cookie
    navigate('/');
  };

  const handleAdd = async () => {
    const isValidNumber = (value: string) => /^[0-9]+(\.[0-9]+)?$/.test(value);

    if (!name || !calories || !carbs || !fats || !proteins || !weight) {
      setError("All fields must be filled with valid numbers.");
      return;
    }

    if (
      !isValidNumber(calories) ||
      !isValidNumber(carbs) ||
      !isValidNumber(fats) ||
      !isValidNumber(proteins) ||
      !isValidNumber(weight)
    ) {
      setError("All fields must contain valid integers or decimals without starting or ending with a decimal.");
      return;
    }

    setError(""); // Clear error if inputs are valid

    try {
      const userId = getCookie('id'); // Retrieve the user ID from the cookie

      if (!userId) {
        setError('User ID is missing. Please log in again.');
        return;
      }

      const newMeal = {
        userId,
        foodName: name,
        calories: parseFloat(calories),
        carbs: parseFloat(carbs),
        fats: parseFloat(fats),
        protein: parseFloat(proteins),
        weight: parseFloat(weight),
      };

      const response = await axios.post('http://146.190.71.194:5000/api/ingredient/addIngredient', newMeal);

      if (response.data) {
        // Update meals state with the new meal
        setMeals((prevMeals) => [...prevMeals, response.data.data]);
        console.log("Success!");
        closePopup();
      }
    } catch (error) {
      console.error('Error adding meal:', error);
      setError('Failed to add meal. Please try again.');
    }
  };

  return (
    <>
      <div id="stars-container">
        <div id="stars"></div>
        <div id="stars2"></div>
        <div id="stars3"></div>
      </div>

      <div className="background-menu">
        <div className="table-container">
          {/* Updated table to include weight column */}
          <table className="nutrition-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Calories</th>
                <th>Carbs (g)</th>
                <th>Fats (g)</th>
                <th>Proteins (g)</th>
                <th>Weight (g)</th>
                <th style={{ color: 'black'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {meals.map((meal, index) => (
                <tr key={index}>
                  <td className="name-cell-wrap">{meal.foodName}</td>
                  <td className="name-cell-wrap">{meal.calories}</td>
                  <td className="name-cell-wrap">{meal.carbs}</td>
                  <td className="name-cell-wrap">{meal.fats}</td>
                  <td className="name-cell-wrap">{meal.protein}</td>
                  <td className="name-cell-wrap">{meal.weight}</td>
                  <td className="name-cell-wrap">
                    <div className="delete-edit-pair">
                      <img src={edit} />
                      <img src={del} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <span className={`title_mode ${isChartMode ? "fade-in" : "fade-out"}`}>Entries</span>
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
        <img src={plus} className="plus-button" alt="Add" />
      </div>

      {isPopupVisible && (
        <div className="overlay">
          <div className="popup-add" onClick={e => e.stopPropagation()}>
            <div className="x-add" onClick={closePopup}>&times;</div>
            <div className="add-title">Add Meal</div>

            {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}

            <input type="text" value={name} onChange={handleNameChange} placeholder="Name" className="circular-input" />
            <input type="text" value={calories} onChange={handleCalorieChange} placeholder="Calories" className="circular-input" />
            <input type="text" value={carbs} onChange={handleCarbChange} placeholder="Carbohydrates (g)" className="circular-input" />
            <input type="text" value={fats} onChange={handleFatChange} placeholder="Fats (g)" className="circular-input" />
            <input type="text" value={proteins} onChange={handleProteinChange} placeholder="Proteins (g)" className="circular-input" />
            <input type="text" value={weight} onChange={handleWeightChange} placeholder="Weight (g)" className="circular-input" />

            <div>
              <button onClick={handleAdd}>Add</button>
            </div>
          </div>
        </div>
      )}

      <div className="profile-container">
        <img src={pfp} className="profile" alt="Profile" />
        <div onClick={() => setIsDropdownOpen((prev) => !prev)} ref={profileRef}>
          <img src={arrow} className={`arrow ${isDropdownOpen ? 'rotate' : ''}`} alt="Toggle Dropdown" />
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

export default Landing;
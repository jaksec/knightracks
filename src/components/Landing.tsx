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
import ProgressBar from './ProgressBar';

// Function to save toggle state to localStorage
const saveToggleState = (isChartMode: boolean) => {
  localStorage.setItem('isChartMode', JSON.stringify(isChartMode));
};

// Function to load toggle state from localStorage
const loadToggleState = (): boolean => {
  const savedState = localStorage.getItem('isChartMode');
  return savedState !== null ? JSON.parse(savedState) : true; // Default to true (Entries)
};

const Landing: React.FC = () => {
  // State variables
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [isGoalsPopupVisible, setisGoalsPopupVisible] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [isChartMode, setIsChartMode] = useState<boolean>(loadToggleState()); // Initialize with saved state
  const [GoalCals, setGoalCals] = useState<string>('');
  const [GoalProt, setGoalProt] = useState<string>('');
  const [GoalCarb, setGoalCarb] = useState<string>('');
  const [GoalFats, setGoalFats] = useState<string>(''); // Corrected setter function
  const [goalExists, setGoalExists] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const [goalCalories, setGoalCalories] = useState<number>(0);
  const [goalProtein, setGoalProtein] = useState<number>(0);
  const [goalCarbs, setGoalCarbs] = useState<number>(0);
  const [goalFats, setGoalFatsNumeric] = useState<number>(0); // Renamed to avoid conflict

  const [currentCalories, setCurrentCalories] = useState<number>(0);
  const [currentProtein, setCurrentProtein] = useState<number>(0);
  const [currentCarbs, setCurrentCarbs] = useState<number>(0);
  const [currentFats, setCurrentFats] = useState<number>(0);

  const [name, setName] = useState<string>('');
  const [calories, setCalories] = useState<string>('');
  const [carbs, setCarbs] = useState<string>('');
  const [fats, setFats] = useState<string>('');
  const [proteins, setProteins] = useState<string>('');
  const [weight, setWeight] = useState<string>(''); // Added state for weight

  const [meals, setMeals] = useState<any[]>([]); // State for meals

  // On component mount, ensure the correct mode is applied
  useEffect(() => {
    document.body.classList.toggle('chart-mode', isChartMode);
    document.body.classList.toggle('nutrition-mode', !isChartMode);
  }, [isChartMode]);

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
    setIsChartMode((prevMode) => {
      const newMode = !prevMode;
      saveToggleState(newMode); // Save the new state
      return newMode;
    });
  };

  const handleGoalCalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGoalCals(e.target.value);
  };

  const handleGoalCarbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGoalCarb(e.target.value);
  };

  const handleGoalProteinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGoalProt(e.target.value);
  };

  const handleGoalFatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGoalFats(e.target.value); // Corrected setter function
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

  const closeGoalsPopup = () => {
    setisGoalsPopupVisible(false);
    setError('');
  };

  const showPopup = () => {
    setPopupVisible(true);
  };

  const showGoalsPopup = () => {
    setisGoalsPopupVisible(true);
  };

  const handleSaveGoal = async () => {
    if (goalExists) {
      await handleUpdateGoal();
    } else {
      await handleAddGoal();
    }

    closeGoalsPopup();
  };

  const handleAddGoal = async () => {
    const userId = getCookie('id');

    if (!userId) {
      setError('User ID is missing. Please log in again.');
      return;
    }

    // Validate inputs
    const isValidNumber = (value: string) => /^[0-9]+(\.[0-9]+)?$/.test(value);

    if (
      !isValidNumber(GoalCals) ||
      !isValidNumber(GoalCarb) ||
      !isValidNumber(GoalFats) ||
      !isValidNumber(GoalProt)
    ) {
      setError('Please enter valid numbers for all fields.');
      return;
    }

    try {
      const newGoal = {
        userId,
        calories: parseFloat(GoalCals),
        carbs: parseFloat(GoalCarb),
        fats: parseFloat(GoalFats),
        proteins: parseFloat(GoalProt),
      };

      const response = await axios.post('http://146.190.71.194:5000/api/goal/addGoal', newGoal);

      if (response.data.success) {
        setGoalExists(true);

        // Update numeric goal values
        setGoalCalories(newGoal.calories);
        setGoalProtein(newGoal.proteins);
        setGoalCarbs(newGoal.carbs);
        setGoalFatsNumeric(newGoal.fats); // Updated setter

        closeGoalsPopup();
        console.log('Goal added successfully!');
      }
    } catch (error) {
      console.error('Error adding goal:', error);
      setError('Failed to add goal. Please try again.');
    }
  };

  const handleUpdateGoal = async () => {
    const userId = getCookie('id');

    if (!userId) {
      setError('User ID is missing. Please log in again.');
      return;
    }

    // Validate inputs
    const isValidNumber = (value: string) => /^[0-9]+(\.[0-9]+)?$/.test(value);

    if (
      !isValidNumber(GoalCals) ||
      !isValidNumber(GoalCarb) ||
      !isValidNumber(GoalFats) ||
      !isValidNumber(GoalProt)
    ) {
      setError('Please enter valid numbers for all fields.');
      return;
    }

    try {
      const updatedGoal = {
        userId,
        calories: parseFloat(GoalCals),
        carbs: parseFloat(GoalCarb),
        fats: parseFloat(GoalFats),
        proteins: parseFloat(GoalProt),
      };

      const response = await axios.put('http://146.190.71.194:5000/api/goal/updateGoal', updatedGoal);

      if (response.data.success) {
        // Update numeric goal values
        setGoalCalories(updatedGoal.calories);
        setGoalProtein(updatedGoal.proteins);
        setGoalCarbs(updatedGoal.carbs);
        setGoalFatsNumeric(updatedGoal.fats); // Updated setter

        closeGoalsPopup();
        console.log('Goal updated successfully!');
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      setError('Failed to update goal. Please try again.');
    }
  };

  const fetchGoal = async () => {
    const userId = getCookie('id');

    if (!userId) {
      setError('User ID is missing. Please log in again.');
      return;
    }

    try {
      const response = await axios.get('http://146.190.71.194:5000/api/goal/getGoal', {
        params: { userId },
      });

      if (response.data && response.data.data) {
        const goalData = response.data.data;

        setGoalCals(goalData.calories.toString());
        setGoalProt(goalData.proteins.toString());
        setGoalCarb(goalData.carbs.toString());
        setGoalFats(goalData.fats.toString());

        setGoalCalories(goalData.calories);
        setGoalProtein(goalData.proteins);
        setGoalCarbs(goalData.carbs);
        setGoalFatsNumeric(goalData.fats);

        setGoalExists(true);
      } else {
        setGoalExists(false);
      }
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        setGoalExists(false);
      } else {
        console.error('Error fetching goal:', error);
        setError('Failed to fetch goal. Please try again.');
      }
    }
  };

  // Fetch meals and goals when the component mounts
  useEffect(() => {
    setFirstName(getCookie('firstName'));
    setLastName(getCookie('lastName'));

    // Fetch the user's goals
    fetchGoal();

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

    fetchMeals();

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;

    meals.forEach((meal) => {
      totalCalories += meal.calories;
      totalProtein += meal.protein; // Changed to 'proteins'
      totalCarbs += meal.carbs;
      totalFats += meal.fats;
    });

    setCurrentCalories(totalCalories);
    setCurrentProtein(totalProtein);
    setCurrentCarbs(totalCarbs);
    setCurrentFats(totalFats);
  }, [meals]);

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

  const hasLoginCookie = (): boolean => {
    const match = document.cookie.match(new RegExp('(^| )authToken=([^;]+)'));
    return !!match; // Returns true if the cookie exists, false otherwise
  };

  useEffect(() => {
    if (!hasLoginCookie()) {
      // Redirect to the homepage or login page if no login cookie is found
      navigate('/');
    }
  }, [navigate]);

  const handleDelete = async (mealId: string) => {
    try {
      const userId = getCookie('id'); // Retrieve the user ID from the cookie

      if (!userId) {
        setError('User ID is missing. Please log in again.');
        return;
      }

      // Call the API to delete the meal
      const response = await axios.delete('http://146.190.71.194:5000/api/ingredient/deleteMeal', {
        data: {
          userId,
          mealId,
        },
      });

      if (response.data.success) {
        // Update the meals state to remove the deleted meal
        setMeals((prevMeals) => prevMeals.filter((meal) => meal._id !== mealId));
        console.log('Meal deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting meal:', error);
      setError('Failed to delete meal. Please try again.');
    }

    fetchMeals();
  };

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
      setError('All fields must be filled with valid numbers.');
      return;
    }

    if (
      !isValidNumber(calories) ||
      !isValidNumber(carbs) ||
      !isValidNumber(fats) ||
      !isValidNumber(proteins) ||
      !isValidNumber(weight)
    ) {
      setError(
        'All fields must contain valid integers or decimals without starting or ending with a decimal.'
      );
      return;
    }

    setError(''); // Clear error if inputs are valid

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
        protein: parseFloat(proteins), // Changed to 'proteins'
        weight: parseFloat(weight),
      };

      const response = await axios.post(
        'http://146.190.71.194:5000/api/ingredient/addIngredient',
        newMeal
      );

      if (response.data) {
        // Update meals state with the new meal
        setMeals((prevMeals) => [...prevMeals, response.data.data]);
        console.log('Success!');
        closePopup();
      }
    } catch (error) {
      console.error('Error adding meal:', error);
      setError('Failed to add meal. Please try again.');
    }
  };

  const formatWithUnit = (value: string, unit: string) => {
    return `${value}${unit}`;
  };

  return (
    <>
      <div id="stars-container">
        <div id="stars"></div>
        <div id="stars2"></div>
        <div id="stars3"></div>
      </div>

      <div className="Nutrition_box">
        <p className="Nutrition_box_title">Goals</p>
        <hr />
        <div className="Nutrition_box_items">
          <p>Calories: {GoalCals}</p>
          <p>Protein: {formatWithUnit(GoalProt, "g")}</p>
          <p>Carbs: {formatWithUnit(GoalCarb, "g")}</p>
          <p>Fats: {formatWithUnit(GoalFats, "g")}</p>
          <button className="Nutrition_box_button" onClick={showGoalsPopup}>
            Edit
          </button>
          {isGoalsPopupVisible && (
            <div className="GoalChangeOverlay">
              <div className="GoalChangePopup">
                <h2>Update Your Goals</h2>
                {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
                <div className="GroupEntryGrid">
                  <input
                    type="text"
                    id="Cals"
                    name="Cals"
                    value={GoalCals}
                    onChange={handleGoalCalChange}
                    placeholder="Calories"
                    className="circular-input"
                  />
                  <input
                    type="text"
                    id="Carbs"
                    name="Carbs"
                    value={GoalCarb}
                    onChange={handleGoalCarbChange}
                    placeholder="Carbohydrates (g)"
                    className="circular-input"
                  />
                  <input
                    type="text"
                    id="Prot"
                    name="Prot"
                    value={GoalProt}
                    onChange={handleGoalProteinChange}
                    placeholder="Protein (g)"
                    className="circular-input"
                  />
                  <input
                    type="text"
                    id="Fats"
                    name="Fats"
                    value={GoalFats}
                    onChange={handleGoalFatChange}
                    placeholder="Fats (g)"
                    className="circular-input"
                  />
                </div>
                <div>
                  <button onClick={handleSaveGoal}>Save</button>
                  <div className="x-add" onClick={closeGoalsPopup}>
                    &times;
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="background-menu">
        <div className="title-container">
          <span className={`title_mode ${isChartMode ? 'fade-in' : 'fade-out'}`}>Entries</span>
          <span className={`title_mode ${!isChartMode ? 'fade-in' : 'fade-out'}`}>Nutrition</span>
        </div>
      </div>
      <div className="table-container">
        <div className="table-content">
          {/* Updated table to include weight column */}
          <div className={`nutrition-table-wrapper ${isChartMode ? 'fade-in' : 'fade-out'}`}>
            <table className="nutrition-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Calories</th>
                  <th>Carbs (g)</th>
                  <th>Fats (g)</th>
                  <th>Protein (g)</th>
                  <th>Weight (g)</th>
                  <th style={{ color: 'black' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {meals.map((meal, index) => (
                  <tr key={index}>
                    <td className="name-cell-wrap">{meal.foodName}</td>
                    <td className="name-cell-wrap">{meal.calories}</td>
                    <td className="name-cell-wrap">{meal.carbs}</td>
                    <td className="name-cell-wrap">{meal.fats}</td>
                    <td className="name-cell-wrap">{meal.protein}</td> {/* Changed to 'proteins' */}
                    <td className="name-cell-wrap">{meal.weight}</td>
                    <td className="name-cell-wrap">
                      <div style={{ display: 'flex', gap: '15px' }}>
                        <button className="pen" onClick={showPopup}>
                          <img src={edit} />
                        </button>
                        <button className="trash" onClick={() => handleDelete(meal._id)}>
                          <img src={del} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`nutrition-section-wrapper ${!isChartMode ? 'fade-in' : 'fade-out'}`}>
          <h2 style={{ position: 'absolute', left: '23%', top: '8%' }}>Calories</h2>
          <ProgressBar
            value={currentCalories}
            max={goalCalories}
            classNameBar="progress-bar-calories"
            classNameFill="fill-bar-calories"
          />

          <h2 style={{ position: 'absolute', right: '23.5%', bottom: '23%' }}>Protein</h2>
          <ProgressBar
            value={currentProtein}
            max={goalProtein}
            classNameBar="progress-bar-protein"
            classNameFill="fill-bar-protein"
          />

          <h2 style={{ position: 'absolute', right: '25.5%', top: '8%' }}>Fats</h2>
          <ProgressBar
            value={currentFats}
            max={goalFats}
            classNameBar="progress-bar-fats"
            classNameFill="fill-bar-fats"
          />

          <h2 style={{ position: 'absolute', left: '19.5%', bottom: '23%' }}>Carbohydrates</h2>
          <ProgressBar
            value={currentCarbs}
            max={goalCarbs}
            classNameBar="progress-bar-carbs"
            classNameFill="fill-bar-carbs"
          />
        </div>
      </div>

      <div className="container">
        <input
          type="checkbox"
          id="toggle"
          style={{ display: 'none' }}
          onChange={handleToggle}
          checked={!isChartMode}
        />
        <label htmlFor="toggle" className="toggle-button">
          <span className={`emoji ${isChartMode ? 'fade-in' : 'fade-out'}`}>📊</span>
          <span className={`emoji ${!isChartMode ? 'fade-in' : 'fade-out'}`}>🍎</span>
        </label>
      </div>

      <div className={`plus-button-wrapper ${isChartMode ? 'fade-in' : 'fade-out'}`}>
        <div className="plus-button" onClick={showPopup}>
          <img src={plus} className="plus-button" alt="Add" />
        </div>
      </div>

      {isPopupVisible && (
        <div className="overlay">
          <div className="popup-add" onClick={(e) => e.stopPropagation()}>
            <div className="x-add" onClick={closePopup}>
              &times;
            </div>
            <div className="add-title">Add Meal</div>

            {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}

            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="Name"
              className="circular-input"
            />
            <input
              type="text"
              value={calories}
              onChange={handleCalorieChange}
              placeholder="Calories"
              className="circular-input"
            />
            <input
              type="text"
              value={carbs}
              onChange={handleCarbChange}
              placeholder="Carbohydrates (g)"
              className="circular-input"
            />
            <input
              type="text"
              value={fats}
              onChange={handleFatChange}
              placeholder="Fats (g)"
              className="circular-input"
            />
            <input
              type="text"
              value={proteins}
              onChange={handleProteinChange}
              placeholder="Proteins (g)"
              className="circular-input"
            />
            <input
              type="text"
              value={weight}
              onChange={handleWeightChange}
              placeholder="Weight (g)"
              className="circular-input"
            />

            <div>
              <button style={{ marginTop: '25px' }} onClick={handleAdd}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="profile-container">
        <img src={pfp} className="profile" alt="Profile" />
        <div onClick={() => setIsDropdownOpen((prev) => !prev)} ref={profileRef}>
          <img
            src={arrow}
            className={`arrow ${isDropdownOpen ? 'rotate' : ''}`}
            alt="Toggle Dropdown"
          />
        </div>
        <div
          className={`dropdown-menu ${isDropdownOpen ? 'show' : 'hide'}`}
          ref={dropdownRef}
        >
          <p className="profile-name">
            {firstName} {lastName}
          </p>
          <button className="logout-button" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </div>

      <div>
        <img src={KnightLogo} className="logo" alt="Knight logo" />
      </div>
    </>
  );
};

export default Landing;
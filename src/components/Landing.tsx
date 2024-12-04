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
  const [isCustomGoalPopupVisible, setisCustomGoalPopupVisible] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [isChartMode, setIsChartMode] = useState<boolean>(loadToggleState()); // Initialize with saved state
  const [activeMode, setActiveMode] = useState<'Search' | 'Custom'>('Search'); // Default to "Search" mode

  const [GoalCals, setGoalCals] = useState<number | "">("");
  const [GoalProt, setGoalProt] = useState<number | "">("");
  const [GoalCarb, setGoalCarb] = useState<number | "">("");
  const [GoalFats, setGoalFats] = useState<number | "">(""); // Corrected setter function
  const [GoalProtPercent, setGoalProtPercent] = useState<number | "">("");
  const [GoalCarbPercent, setGoalCarbPercent] = useState<number | "">("");
  const [GoalFatPercent, setGoalFatPercent] = useState<number | "">("");


  const [goalExists, setGoalExists] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [sucess, setsucess] = useState<string>('');


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

  const [height, setheight] = useState<string>('');
  const [Userweight, setUserweight] = useState<string>('');
  const [sex, setsex] = useState<string>('');
  const [age, setage] = useState<string>('');
  const [activityLevel, setactivityLevel] = useState<string>('');
  const [weightLossStyle, setweightLossStyle] = useState<string>('');

  const [meals, setMeals] = useState<any[]>([]); // State for meals

  const [isEditPopupVisible, setEditPopupVisible] = useState(false);
  const [editMeal, setEditMeal] = useState<any>(null); // State to hold the meal being edited

  interface SearchResults {
    id: number;
    name: string;
    picture: string;
    calories: number;
    carbs: number;
    protein: number;
    fats: number;
  }

  const [searchValue, setsearchValue] = useState<string>('');
  const [filteredResults, setFilteredResults] = useState<SearchResults[]>([]);
  const [resultName, setresultName] = useState<string>("");
  const [resultCals, setresultCals] = useState<number>(0);
  const [resultCarbs, setresultCarbs] = useState<number>(0);
  const [resultProt, setresultProt] = useState<number>(0);
  const [resultFat, setresultFat] = useState<number>(0);
  const [resultSize, setresultSize] = useState<number>(0);
  const [debouncedSearchValue, setdebouncedSearchValue] = useState<string>('');

  const [originalResultCals, setOriginalResultCals] = useState<number>(0);
  const [originalResultCarbs, setOriginalResultCarbs] = useState<number>(0);
  const [originalResultProt, setOriginalResultProt] = useState<number>(0);
  const [originalResultFat, setOriginalResultFat] = useState<number>(0);

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    visible: boolean;
    mealId: string | null;
    mealData: any | null;
  }>({
    visible: false,
    mealId: null,
    mealData: null,
  });

  // On component mount, ensure the correct mode is applied
  useEffect(() => {
    document.body.classList.toggle('chart-mode', isChartMode);
    document.body.classList.toggle('nutrition-mode', !isChartMode);
  }, [isChartMode]);

  useEffect(() => { //this useEffect will
    const timer = setTimeout(() => {
      setdebouncedSearchValue(searchValue); 
    }, 500); //500ms delay

    return () => {
      clearTimeout(timer); // Clear the timer if the input changes before the delay
    };
  }, [searchValue]);

  useEffect(() => {
    if (debouncedSearchValue) {
      const fetchResults = async () => {
        try {
          console.log('Fetching results for:', debouncedSearchValue);
          const response = await fetch(
            `http://146.190.71.194:5000/api/ingredient/search-ingredients?q=${encodeURIComponent(
              debouncedSearchValue
            )}`
          );
          const data = await response.json();
          console.log('Raw API Response:', data);
  
          if (data && data.results && Array.isArray(data.results)) {
            // Map the `results` array to match the `SearchResults` interface
            const mappedResults: SearchResults[] = data.results.map((item: any) => ({
              id: item.id,
              name: item.name,
              picture: item.image,
              calories: 0, // Initialize with 0
              carbs: 0,
              protein: 0,
              fats: 0,
            }));
  
            // Fetch nutrition data for each item
            const nutritionPromises = mappedResults.map(async (item) => {
              try {
                const response = await fetch(
                  `http://146.190.71.194:5000/api/ingredient/ingredient-nutrition?id=${encodeURIComponent(
                    item.id
                  )}`
                );
                const nutritionData = await response.json();
  
                const resultCals = Number(
                  nutritionData.nutrition.find((n: NutritionItem) => n.name === 'Calories')?.amount || 0
                );
                const resultCarbs = Number(
                  nutritionData.nutrition.find((n: NutritionItem) => n.name === 'Carbohydrates')?.amount || 0
                );
                const resultProt = Number(
                  nutritionData.nutrition.find((n: NutritionItem) => n.name === 'Protein')?.amount || 0
                );
                const resultFat = Number(
                  nutritionData.nutrition.find((n: NutritionItem) => n.name === 'Fat')?.amount || 0
                );
  
                return {
                  ...item,
                  calories: resultCals,
                  carbs: resultCarbs,
                  protein: resultProt,
                  fats: resultFat,
                };
              } catch (error) {
                console.error('Error fetching nutrition data for item:', item.name, error);
                return item; // Return item without nutrition data
              }
            });
  
            const resultsWithNutrition = await Promise.all(nutritionPromises);
            setFilteredResults(resultsWithNutrition);
            console.log('Results with Nutrition:', resultsWithNutrition);
          } else {
            setFilteredResults([]);
            console.log('No results found in the response:', data);
          }
        } catch (error) {
          console.error('Error fetching results:', error);
          setFilteredResults([]);
        }
      };
  
      fetchResults();
    } else {
      setFilteredResults([]); // Clear results if input is empty
    }
  }, [debouncedSearchValue]);
  

  // Function to get cookies
  const getCookie = (name: string): string => {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? decodeURIComponent(match[2]) : '';
  };

  const AutoFillPercent = () => {
    if(GoalCals == "")
      return;
    else 
    {
      setGoalCarbPercent(Math.round(100*((Number(GoalCarb)*4)/Number(GoalCals)))) 
      setGoalFatPercent(Math.round(100*((Number(GoalFats)*9)/Number(GoalCals))))
      setGoalProtPercent(Math.round(100*((Number(GoalProt)*4)/Number(GoalCals))))
    }
  }

  const adjustCalorieChange = () => {
    if (GoalCals === "" || Number(GoalCals) < 500) {
      setError("Please fill out the calories.");
      return;
    }
  
    const totalPercent = 
      Number(GoalCarbPercent || 0) + 
      Number(GoalProtPercent || 0) + 
      Number(GoalFatPercent || 0);
  
    if (totalPercent !== 100) {
      setError("Ensure all percentages add up to 100%.");
      return;
    }

    console.log("skipped error");
  
    // Clear error if validation passes
    setError("");
  
    // Save macros based on percentages
    const carbs = Number(GoalCals) * (Number(GoalCarbPercent) / 100) / 4;
    const protein = Number(GoalCals) * (Number(GoalProtPercent) / 100) / 4;
    const fats = Number(GoalCals) * (Number(GoalFatPercent) / 100) / 9;
  
    setGoalCarb(Number(carbs.toFixed(3))); // Save exact values
    setGoalProt(Number(protein.toFixed(3)));
    setGoalFats(Number(fats.toFixed(3)));
  };

  const adjustPercentChange = () => {
    // Ensure all fields are filled out
    if (
      !GoalCals ||
      !GoalCarbPercent ||
      !GoalProtPercent ||
      !GoalFatPercent
    ) {
      setError("Please fill out all fields.");
      return;
    }

    // Convert input values to numbers
    const goalCals = Number(GoalCals);
    const carbPercent = Math.round(Number(GoalCarbPercent || 0));
    const protPercent = Math.round(Number(GoalProtPercent || 0));
    const fatPercent = Math.round(Number(GoalFatPercent || 0));

    // Ensure percentages are valid
    const isValidPercent = (percent: number) =>
      Number.isInteger(percent) && percent >= 5 && percent % 5 === 0;

    if (
      !isValidPercent(carbPercent) ||
      !isValidPercent(protPercent) ||
      !isValidPercent(fatPercent)
    ) {
      setError(
        "Percentages must be integers, at least 5, and multiples of 5."
      );
      return;
    }

    // Calculate the total percentage
    const totalPercent = carbPercent + protPercent + fatPercent;

    // Validate that percentages add up to 100
    if (totalPercent !== 100) {
      setError(`Total percentage is ${totalPercent}%. Ensure it equals 100%.`);
      return;
    }

    console.log("skipped error");

    // Clear error if validation passes
    setError("");

    // Calculate macros based on percentages
    const carbs = (goalCals * (carbPercent / 100)) / 4;
    const protein = (goalCals * (protPercent / 100)) / 4;
    const fats = (goalCals * (fatPercent / 100)) / 9;

    // Update state with calculated macros, rounded to 3 decimal places
    setGoalCarb(parseFloat(carbs.toFixed(3)));
    setGoalProt(parseFloat(protein.toFixed(3)));
    setGoalFats(parseFloat(fats.toFixed(3)));

  };

  const validateWeightInput = (value: string) => /^[0-9]*\.?[0-9]*$/.test(value);
  const validateInput = (value: string) => /^[0-9]+$/.test(value);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleCalorieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if(val == "")
      setCalories("");
    else {
      if (validateInput(e.target.value))
        setCalories(e.target.value);
    }
  };

  const handleCarbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if(val == "")
      setCarbs("");
    else {
      if (validateInput(e.target.value))
        setCarbs(e.target.value);
    }
  };

  const handleFatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if(val == "")
      setFats("");
    else {
      if (validateInput(e.target.value))
        setFats(e.target.value);
    }
  };

  const handleProteinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if(val == "")
      setProteins("");
    else {
      if (validateInput(e.target.value))
        setProteins(e.target.value);
    }
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (validateWeightInput(e.target.value)) setWeight(e.target.value);
  };

  const handleToggle = () => {
    setIsChartMode((prevMode) => {
      const newMode = !prevMode;
      saveToggleState(newMode); // Save the new state
      return newMode;
    });
  };

  const handleheightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (validateInput(e.target.value)) setheight(e.target.value)
  }

  const handleUserWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (validateInput(e.target.value)) setUserweight(e.target.value)
  }

  const handleage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (validateInput(e.target.value)) setage(e.target.value)
  }

  const handleactivityLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setactivityLevel(e.target.value)
  }

  const handlesexChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setsex(e.target.value)
  }

  const handleWightLossStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setweightLossStyle(e.target.value)
  }

  const formatAsInteger = (value: number | string): string => {
    return Math.round(Number(value)).toString(); // Ensure value is rounded and returned as a string
  };

  const handleGoalCalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      setGoalCals("");
      setError(""); // Clear error when input is cleared
    } else {
      const numericVal = Number(val);
      if (numericVal < 500) {
        setError("Calories cannot be less than 500."); // Update error immediately
        return;
      }
  
      const totalPercent =
        Number(GoalCarbPercent || 0) +
        Number(GoalProtPercent || 0) +
        Number(GoalFatPercent || 0);
  
      if (totalPercent !== 100) {
        setError(`Total percentage is ${totalPercent}%. Ensure it equals 100%.`);
        return;
      }
  
      // Clear error if validation passes
      setError("");
      setGoalCals(numericVal);
  
      // Recalculate macros based on new calorie value
      const carbs = numericVal * (Number(GoalCarbPercent) / 100) / 4;
      const protein = numericVal * (Number(GoalProtPercent) / 100) / 4;
      const fats = numericVal * (Number(GoalFatPercent) / 100) / 9;
  
      setGoalCarb(Number(carbs.toFixed(3)));
      setGoalProt(Number(protein.toFixed(3)));
      setGoalFats(Number(fats.toFixed(3)));
    }
  };
  
  const handleGoalCalChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {

    const val = e.target.value;

    // Allow only digits or an empty string for backspace
    if (val === "" || /^[0-9]*$/.test(val)) {
      setGoalCals(val === "" ? "" : Number(val)); // Save raw input
      setError(""); // Clear error while typing
    }
  };

  const handleGoalFatPercentChange = () => {
    adjustPercentChange();
  };

  const handleGoalFatPercentChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if(val == "")
      setGoalFatPercent("");
    else
      setGoalFatPercent(Number(e.target.value));
  };

  const handleGoalProtPercentChange = () => {
    adjustPercentChange();
  };

  const handleGoalProtPercentChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if(val == "")
      setGoalProtPercent("");
    else
      setGoalProtPercent(Number(e.target.value));
  };

  const handleGoalCarbPercentChange = () => {
    adjustPercentChange();
  };

  const handleGoalCarbPercentChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if(val == "")
      setGoalCarbPercent("");
    else
      setGoalCarbPercent(Number(e.target.value));
  };

  const handleResultSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
  
    // Set resultSize to empty string if input is empty
    if (value === '') {
      setresultSize(NaN);
    } else {
      // Otherwise, parse the value as a number
      const numberValue = Number(value);
      if (!isNaN(numberValue)) {
        setresultSize(numberValue);
      }
    }
  
    // Call other functions if needed
    adjustSize(e);
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
    setresultName('');
    setresultCals(0);
    setresultCarbs(0);
    setresultProt(0);
    setresultFat(0);
    setresultSize(100);
    setOriginalResultCals(0);
    setOriginalResultCarbs(0);
    setOriginalResultProt(0);
    setOriginalResultFat(0);
  };

  const closeGoalsPopup = () => {
    fetchGoal();
    setisGoalsPopupVisible(false);
    setError('');
  };

  const closeCustomGoalPopup = () => {
    adjustCalorieChange();
    setisCustomGoalPopupVisible(false);
    setheight("");
    setUserweight("");
    setsex("");
    setage("");
    setactivityLevel("");
    setweightLossStyle("");
    setError('');
    setsucess('');
  }

  const showPopup = () => {
    setPopupVisible(true);
  };

  const showGoalsPopup = () => {
    setisGoalsPopupVisible(true);
    AutoFillPercent();
  };

  const ShowCustomGoalPopup = () => {
    setError("");
    setisCustomGoalPopupVisible(true);
  }

  const handleSaveGoal = async () => {
    if(error != '')
      return;
    else if (goalExists) {
      await handleUpdateGoal();
    } else {
      await handleAddGoal();
    }

    closeGoalsPopup();
  };

  const handleAddGoal = async () => {
    const userId = getCookie('id');

    if (!userId) {
      setError('User ID Is Missing. Please Log In Again.');
      return;
    }

    if (GoalCals == '') 
    {
      setError('Please Enter Valid Numbers For All Fields.');
      return;
    }

    try {
      const newGoal = {
        userId,
        calories: GoalCals,
        carbs: GoalCarb,
        fats: GoalFats,
        proteins: GoalProt,
      };

      const response = await axios.post('http://146.190.71.194:5000/api/goal/addGoal', newGoal);

      if (response.data.success) {
        setGoalExists(true);

        // Update numeric goal values
        setGoalCalories(Number(newGoal.calories));
        setGoalProtein(Number(newGoal.proteins));
        setGoalCarbs(Number(newGoal.carbs));
        setGoalFatsNumeric(Number(newGoal.fats)); // Updated setter

        closeGoalsPopup();
        console.log('Goal added successfully!');
      }
    } catch (error) {
      console.error('Error adding goal:', error);
      setError('Failed To Add Goal. Please Try Again.');
    }
  };

  const handleUpdateGoal = async () => {
    const userId = getCookie('id');

    if (!userId) {
      setError('User ID Is Missing. Please Log In Again.');
      return;
    }

    if (
      GoalCals == ''
    ) {
      setError('Please Enter Valid Numbers For All Fields.');
      return;
    }

    try {
      const updatedGoal = {
        userId,
        calories: GoalCals,
        carbs: GoalCarb,
        fats: GoalFats,
        proteins: GoalProt,
      };

      const response = await axios.put('http://146.190.71.194:5000/api/goal/updateGoal', updatedGoal);

      if (response.data.success) {
        // Update numeric goal values
        setGoalCalories(Number(updatedGoal.calories));
        setGoalProtein(Number(updatedGoal.proteins));
        setGoalCarbs(Number(updatedGoal.carbs));
        setGoalFatsNumeric(Number(updatedGoal.fats)); // Updated setter

        closeGoalsPopup();
        console.log('Goal updated successfully!');
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      setError('Failed To Update Goal. Please Try Again.');
    }
  };

  const fetchGoal = async () => {
    const userId = getCookie('id');

    if (!userId) {
      setError('User ID Is Missing. Please Log In Again.');
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
        setError('Failed To Fetch Goal. Please Try Again.');
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
      setError('User ID Is Missing. Please Log In Again.');
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
    }
  };

  const handleCustomGoal = () => { //Class updates the variables on the Goal Page based on user inputs
    let customCals = 0;
    if(height ==  ""|| Userweight==  "" || sex==  "" || age==  "" || activityLevel==  "" || weightLossStyle==  "")
    {
      setError("Please fill out all of the boxes.")
      return;
    }
    
    if(sex == "M") 
    {
      customCals = 10 * (parseFloat(Userweight) / 2.20462) + 6.25 * (parseFloat(height)  * 2.54) - 5 * parseFloat(age) + 5;
    }
    else
    {
      customCals = 10 * (parseFloat(Userweight) / 2.20462) + 6.25 * (parseFloat(height)  * 2.54) - 5 * parseFloat(age) - 16;
    }

    if(activityLevel == "1")
    {
      customCals = customCals * 1.2
    }
    else if(activityLevel == "2")
    {
      customCals = customCals * 1.375
    }
    else if(activityLevel == "3")
    {
      customCals = customCals * 1.55
    }
    else if(activityLevel == "4")
    {
      customCals = customCals * 1.725
    }
    else if(activityLevel == "5")
    {
      customCals = customCals * 1.9
    }
    else
      setError("Oopsies")

    if(weightLossStyle == "1")
    {
      customCals = customCals + 1000
    }
    else if(weightLossStyle == "2")
    {
      customCals = customCals + 500
    }
    else if (weightLossStyle == "3")
    {
      customCals = customCals
    }
    else if (weightLossStyle == "4")
    {
      customCals = customCals - 500
    }
    else if (weightLossStyle == "5")
    {
      customCals = customCals - 1000
    }
    else
      setError("Oopsies")

      customCals = Math.round(customCals)
      setGoalCals(customCals)
      setGoalCarbPercent(50)
      setGoalFatPercent(20)
      setGoalProtPercent(30)
      setsucess("Goal Generated!")
      setError("")
  }

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
        setError('User ID Is Missing. Please Log In Again.');
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
      setError('Failed To Delete Meal. Please Try Again.');
    }

    fetchMeals();
  };

  const handleConfirmDelete = (mealId: string | null) => {
    if (mealId) {
      handleDelete(mealId); // Call the existing delete function
    }
    setDeleteConfirmation({ visible: false, mealId: null, mealData: null }); // Close the popup
  };

  const handleNumericInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    const value = e.target.value;
  
    // Allow empty value for clearing the input
    if (value === '') {
      setEditMeal((prev: any) => ({ ...prev, [field]: '' }));
      return;
    }
  
    // Allow only numbers (no negative signs)
    if (/^\d*\.?\d*$/.test(value)) {
      setEditMeal((prev: any) => ({ ...prev, [field]: value }));
    }
  };

  const showEditPopup = (meal: any) => {
    setEditMeal(meal); // Set the meal to be edited
    setEditPopupVisible(true); // Show the edit popup
  };

  const handleEdit = async () => {
    if (!editMeal || !editMeal._id) {
      setError('No meal selected for editing.');
      return;
    }
  
    const { _id, foodName, calories, carbs, fats, protein, weight } = editMeal;
  
    // Validate all fields
    if (
      !_id ||
      !foodName ||
      calories == null ||
      carbs == null ||
      fats == null ||
      protein == null ||
      weight == null
    ) {
      setError('All fields are required.');
      return;
    }
  
    try {
      const userId = getCookie('id');
      if (!userId) {
        setError('User ID is missing. Please log in again.');
        return;
      }

      const oldMeal = meals.find((meal) => meal._id === _id);

      if (!oldMeal) {
        setError('Meal not found in the list.');
        return;
      }
  
      // Make the PUT request to update the meal
      const response = await axios.put('http://146.190.71.194:5000/api/ingredient/updateMeal', {
        mealId: _id,
        foodName,
        calories: parseFloat(calories),
        carbs: parseFloat(carbs),
        fats: parseFloat(fats),
        protein: parseFloat(protein),
        weight: parseFloat(weight),
      });
  
      if (response.status === 200 && response.data.message === 'Meal updated successfully') {
        const updatedMeal = response.data.data; // Assuming updated meal data is in `data`
  
        // Update the state with the edited meal
        setMeals((prevMeals) =>
          prevMeals.map((meal) =>
            meal._id === _id ? { ...meal, ...updatedMeal } : meal
          )
        );

              // Adjust totals
        setCurrentCalories((prev) =>
          prev - oldMeal.calories + parseFloat(calories)
        );
        setCurrentProtein((prev) =>
          prev - oldMeal.protein + parseFloat(protein)
        );
        setCurrentCarbs((prev) =>
          prev - oldMeal.carbs + parseFloat(carbs)
        );
        setCurrentFats((prev) =>
          prev - oldMeal.fats + parseFloat(fats)
        );
  
        fetchMeals(); // Refresh meals list
        setEditPopupVisible(false);
        setEditMeal(null);
      } else {
        setError(response.data.error || 'Failed to edit meal.');
      }
    } catch (error) {
      console.error('Error editing meal:', error);
      setError('An error occurred while editing the meal. Please try again.');
    }
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
      setError('Please fill out all fields.');
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
        'All Fields Must Contain Valid Integers Or Decimals Without Starting Or Ending With A Decimal.'
      );
      return;
    }

    setError(''); // Clear error if inputs are valid

    try {
      const userId = getCookie('id'); // Retrieve the user ID from the cookie

      if (!userId) {
        setError('User ID Is Missing. Please Log In Again.');
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
      setError('Failed To Add Meal. Please Try Again.');
    }
  };

  const handlesearchValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setsearchValue(e.target.value);
  }

  interface NutritionItem {
    name: string;
    amount: number; // Amount will be a number (float or integer)
    unit: string;
  }

  
  const handleClickedItem = async (index: number) => {
    const objectid = filteredResults[index]?.id;
  
    try {
      const response = await fetch(
        `http://146.190.71.194:5000/api/ingredient/ingredient-nutrition?id=${encodeURIComponent(
          objectid
        )}`
      );
      const data = await response.json();
  
      setresultName(data.name);
      const fat = Number(
        data.nutrition.find((item: NutritionItem) => item.name === 'Fat')?.amount || 0
      );
      const prot = Number(
        data.nutrition.find((item: NutritionItem) => item.name === 'Protein')?.amount || 0
      );
      const carbs = Number(
        data.nutrition.find((item: NutritionItem) => item.name === 'Carbohydrates')?.amount || 0
      );
      const cals = Number(
        data.nutrition.find((item: NutritionItem) => item.name === 'Calories')?.amount || 0
      );
      setresultFat(fat);
      setresultProt(prot);
      setresultCarbs(carbs);
      setresultCals(cals);
      setresultSize(100);
  
      // Store original values
      setOriginalResultFat(fat);
      setOriginalResultProt(prot);
      setOriginalResultCarbs(carbs);
      setOriginalResultCals(cals);
  
      setsearchValue('');
    } catch (error) {
      console.error('Error fetching ingredient nutrition:', error);
    }
  };

  const addSearchItem = async () => {

    if (!resultSize || isNaN(resultSize)) {
      setError('Please enter a weight.');
      return;
    }

    const userid = getCookie("id");
    const datar = 
    { 
      userId: userid, 
      foodName: resultName,
      calories: resultCals.toFixed(0),
      carbs: resultCarbs.toFixed(0),
      fats: resultFat.toFixed(0),
      protein: resultProt.toFixed(0),
      weight: resultSize
    };

    console.log('Data being sent:', datar);

    try {
      const response = await fetch('http://146.190.71.194:5000/api/ingredient/addIngredient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json' },
          body: JSON.stringify(datar) 
      });
      
      const data = await response.json();

      console.log(data);

      if (data.message === 'Ingredient added successfully') {
        // Update meals state with the new meal
        setMeals((prevMeals) => [...prevMeals, data.data]);
        console.log('Success!');
        closePopup();
        fetchMeals();
        setresultName('');
      }
    } catch (error) {
      console.error('Error adding item:', error);
      setError('Failed to add item. Please try again.');
    }
  };

  const adjustSize = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNum = Number(e.target.value);
    const ratio = newNum / 100;
    setresultCals(Number((originalResultCals * ratio).toFixed(0)));
    setresultCarbs(Number((originalResultCarbs * ratio).toFixed(0)));
    setresultProt(Number((originalResultProt * ratio).toFixed(0)));
    setresultFat(Number((originalResultFat * ratio).toFixed(0)));
  };

  return (
    <>
      <div id="stars-container">
        <div id="stars"></div>
        <div id="stars2"></div>
        <div id="stars3"></div>
      </div>

      {deleteConfirmation.visible && (
        <div className="deleteoverlay">
          <div className="delete-confirmation-popup">
            <p style={{ fontSize: '20px', marginBottom: '50px' }}>
              Are you sure you want to delete this meal?
            </p>
            <div className="displayed-info">
              {deleteConfirmation.mealData && (
                <>
                  <p>
                    <strong>Name:</strong> {deleteConfirmation.mealData.foodName}
                  </p>
                  <p>
                    <strong>Calories:</strong> {deleteConfirmation.mealData.calories}
                  </p>
                  <p>
                    <strong>Carbs:</strong> {deleteConfirmation.mealData.carbs}g
                  </p>
                  <p>
                    <strong>Protein:</strong> {deleteConfirmation.mealData.protein}g
                  </p>
                  <p>
                    <strong>Fats:</strong> {deleteConfirmation.mealData.fats}g
                  </p>
                  <p>
                    <strong>Weight:</strong> {deleteConfirmation.mealData.weight}g
                  </p>
                </>
              )}
            </div>
            <div style={{ marginBottom: '60px' }}></div>
            <div className="confirmation-buttons">
              <button
                className="yes-button"
                onClick={() => handleConfirmDelete(deleteConfirmation.mealId)}
              >
                Yes
              </button>
              <button
                className="no-button"
                onClick={() =>
                  setDeleteConfirmation({ visible: false, mealId: null, mealData: null })
                }
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="Nutrition_box">
        <p className="Nutrition_box_title">Goals</p>
        <hr />
        <div className="Nutrition_box_items">
          <p>Calories: {GoalCals}</p>
          <p>Protein: {formatAsInteger(GoalProt)}g</p>
          <p>Carbs: {formatAsInteger(GoalCarb)}g</p>
          <p>Fats: {formatAsInteger(GoalFats)}g</p>
          <button className="Nutrition_box_button" onClick={showGoalsPopup}>
            Edit
          </button>
          {isGoalsPopupVisible && (
            <div className="GoalChangeOverlay">
              <div className="GoalChangePopup">
                <h2>Update Your Goals</h2>
                <div style={{ paddingBottom: '35px'}}></div>
                {error && <div className="GoalsError" style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
                  <div className="subtitles">Calories</div>
                  <div style={{paddingTop: '10px'}}></div> {/* Empty placeholder for alignment */}
                  <input
                    type="number"
                    id="Cals"
                    name="Cals"
                    value={GoalCals}
                    onChange={handleGoalCalChange1}
                    onBlur={handleGoalCalChange}
                    placeholder="Calories"
                    className="GoalInputBoxes"
                    style={{ width: '20%', marginBottom: '15px' }}
                  />

                  <div className="GroupEntryGrid" style={{ marginTop: '0px' }}>
                  <div className="subtitles">Carbohydrates</div>
                  <div className="InputWithUnit">
                    <input
                      type="number"
                      className="GoalInputBoxes"
                      id="%carb"
                      value={GoalCarbPercent}
                      onChange={handleGoalCarbPercentChange1}
                      onBlur={handleGoalCarbPercentChange}
                      placeholder="%"
                    />
                    <span className="BoldUnit">%</span> 
                  </div>
                  <p style={{ fontWeight: 100 }}>{formatAsInteger(GoalCarb)}g</p>

                  <div className="subtitles">Protein</div>
                  <div className="InputWithUnit">
                    <input
                      type="number"
                      className="GoalInputBoxes"
                      id="%prot"
                      value={GoalProtPercent}
                      onChange={handleGoalProtPercentChange1}
                      onBlur={handleGoalProtPercentChange}
                      placeholder="%"
                    />
                    <span className="BoldUnit">%</span>
                  </div>
                  <p style={{ fontWeight: 100 }}>{formatAsInteger(GoalProt)}g</p>

                  <div className="subtitles">Fats</div>
                  <div className="InputWithUnit">
                    <input
                      type="number"
                      className="GoalInputBoxes"
                      id="%fats"
                      value={GoalFatPercent}
                      onChange={handleGoalFatPercentChange1}
                      onBlur={handleGoalFatPercentChange}
                      placeholder="%"
                    />
                    <span className="BoldUnit">%</span>
                  </div>
                  <p style={{ fontWeight: 100 }}>{formatAsInteger(GoalFats)}g</p>
                </div>
                <div className="Buttons">
                  <button onClick={handleSaveGoal}>Save</button>
                  <button className = "CustomGoalButton" onClick={ShowCustomGoalPopup}>Generate Custom Calorie Goal</button>
                  {isCustomGoalPopupVisible && (
                      <div className="GoalChangeOverlay">
                        <div className="CustomGoalPopup">
                          <h2>Generate a Custom Goal</h2>
                          <p>KnighTracks will <span style={{ color: 'red' }}>never</span> store your information.</p>
                          {error && <div className="CustomGoalError" style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
                          <div className="CustomGoalGrid">
                            <div className="CustomGoalinp">
                              <input
                              type="text"
                              className="circular-input-Gen"
                              id="Height"
                              value={height}
                              onChange={handleheightChange}
                              placeholder="Height"
                              />
                              <span className="BoldUnit1">in.</span>
                            </div>
                            <div className="CustomGoalinp">
                              <input
                              type="text"
                              className="circular-input-Gen"
                              id="weight"
                              value={Userweight}
                              onChange={handleUserWeightChange}
                              placeholder="Weight"
                              />
                              <span className="BoldUnit1">lbs.</span>
                            </div>
                            <div className="SmallCustomInp">
                              <input
                              type="text"
                              className="circular-input-Gen"
                              id="age"
                              value={age}
                              onChange={handleage}
                              placeholder="Age"
                              />
                              <span className="BoldUnit1">yrs.</span>
                            </div>
                            </div>
                            <div className="dropdown-group">
                            <select className="smallDropdown" value={sex} onChange={handlesexChange}>
                              <option value="" disabled>Sex</option>
                              <option value = "M">Male</option>
                              <option value = "F">Female</option>
                            </select>
                            <select id="dropdown" className="dropdown" value={activityLevel} onChange={handleactivityLevelChange}>
                              <option value="" disabled>Activity Level</option>
                              <option value="1">Sedentary</option>
                              <option value="2">Lightly Exercise</option>
                              <option value = "3">Moderately Active</option>
                              <option value="4">Very Active</option>
                              <option value="5">Super Active</option>
                            </select>
                            <select className= "dropdown" value={weightLossStyle} onChange={handleWightLossStyleChange}>
                              <option value="" disabled>Weight Goal</option>
                              <option value ="1">Rapid Gain (+2lbs/Week)</option>
                              <option value="2">Light Gain (+1lb/Week)</option>
                              <option value="3">Maintain (+0lb/Week)</option>
                              <option value="4">Slight Loss (-1lb/Week)</option>
                              <option value="5">Rapid Loss (-2lb/Week)</option>
                            </select>
                          </div>
                          
                          <div style={{ paddingTop: '100px' }}>
                          <button onClick={handleCustomGoal}>Generate</button>
                          </div>
                          {sucess && <div className="CustomSucess">{sucess}</div>}
                          <div className="x-add" onClick={closeCustomGoalPopup}>
                          &times;
                          </div>
                        </div>
                      </div>


                  )}

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
                        <button className="pen" onClick={() => showEditPopup(meal)}>
                          <img src={edit} />
                        </button>
                        <button
                          className="trash"
                          onClick={() =>
                            setDeleteConfirmation({
                              visible: true,
                              mealId: meal._id,
                              mealData: meal,
                            })
                          }
                        >
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

          <div className="calories-container">
          <h2 className="calories-title">Calories</h2>
          <ProgressBar
            value={currentCalories}
            max={goalCalories}
            classNameBar="progress-bar-calories"
            classNameFill="fill-bar-calories"
            showGrams={false}
          />
          </div>

          <div className="protein-container">
          <h2 className="protein-title">Protein</h2>
          <ProgressBar
            value={currentProtein}
            max={goalProtein}
            classNameBar="progress-bar-protein"
            classNameFill="fill-bar-protein"
            showGrams={true}
          />
          </div>

          <div className="fats-container">
          <h2 className="fats-title">Fats</h2>
          <ProgressBar
            value={currentFats}
            max={goalFats}
            classNameBar="progress-bar-fats"
            classNameFill="fill-bar-fats"
            showGrams={true}
          />
          </div>

          <div className="carbs-container">
          <h2 className="carbs-title">Carbohydrates</h2>
          <ProgressBar
            value={currentCarbs}
            max={goalCarbs}
            classNameBar="progress-bar-carbs"
            classNameFill="fill-bar-carbs"
            showGrams={true}
          />
          </div>

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

      {isEditPopupVisible && (
        <div className="overlay">
          <div className="popup-edit" onClick={(e) => e.stopPropagation()}>
            <div className="x-add" onClick={() => { setEditPopupVisible(false); setError('');}}>
              &times;
            </div>
            <div className="add-title">Edit Meal</div>

            <div style={{paddingTop: '15px'}}></div>

            {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

            <div style={{ marginTop: '30px'}}></div>

            <div className="edit-meal-container">
              <div className="input-row">
                <label className="input-label">Name:</label>
                <input
                  type="text"
                  value={editMeal?.foodName || ''}
                  onChange={(e) => {setEditMeal({ ...editMeal, foodName: e.target.value });}}
                  className="circular-input edit-meal-input"
                />
              </div>
              <div className="input-row">
                <label className="input-label">Calories:</label>
                <input
                  type="text"
                  value={editMeal?.calories || ''}
                  onChange={(e) => handleNumericInput(e, 'calories')}
                  className="circular-input edit-meal-input"
                />
              </div>
              <div className="input-row">
                <label className="input-label">Carbohydrates (g):</label>
                <input
                  type="text"
                  value={editMeal?.carbs || ''}
                  onChange={(e) => handleNumericInput(e, 'carbs')}
                  className="circular-input edit-meal-input"
                />
              </div>
              <div className="input-row">
                <label className="input-label">Fats (g):</label>
                <input
                  type="text"
                  value={editMeal?.fats || ''}
                  onChange={(e) => handleNumericInput(e, 'fats')}
                  className="circular-input edit-meal-input"
                />
              </div>
              <div className="input-row">
                <label className="input-label">Proteins (g):</label>
                <input
                  type="text"
                  value={editMeal?.protein || ''}
                  onChange={(e) => handleNumericInput(e, 'protein')}
                  className="circular-input edit-meal-input"
                />
              </div>
              <div className="input-row">
                <label className="input-label">Weight (g):</label>
                <input
                  type="text"
                  value={editMeal?.weight || ''}
                  onChange={(e) => handleNumericInput(e, 'weight')}
                  className="circular-input edit-meal-input"
                />
              </div>
            </div>

            <div>
              <button style={{ marginTop: '25px' }} onClick={handleEdit}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {isPopupVisible && (
          <div className="overlay">
            <div className="popup-add" onClick={(e) => e.stopPropagation()}>
              <div className="x-add" onClick={closePopup}>
                &times;
              </div>
              <div className="add-title">
                <button
                  className={`add-button ${activeMode === 'Search' ? 'active' : ''}`}
                  onClick={() => {setActiveMode('Search'); setError('');}}
                >
                  Search
                </button>
                |
                <button
                  className={`add-button ${activeMode === 'Custom' ? 'active' : ''}`}
                  onClick={() => {setActiveMode('Custom'); setError('');}}
                >
                  Custom
                </button>
              </div>

              {activeMode === 'Search' && (
                <>
                  <div style={{marginTop: '10px'}}>Search for your food, powered by Spoonacular!</div>
                  {error && <div style={{ color: 'red', marginTop: '15px', marginBottom: '-10px' }}>{error}</div>}
                  <div className="searchBarContainer">
                    <input
                      type="text"
                      value={searchValue}
                      onChange={handlesearchValueChange}
                      placeholder="Search..."
                      className="searchBar circular-input"
                    />

                    {filteredResults.length > 0 && (
                      <ul className="results-dropdown">
                        {filteredResults.map((result, index) => (
                          <li key={result.id} onClick={() => handleClickedItem(index)}>                              
                            <div className="nutrition-info">
                              <span className="result-name">{result.name}</span>
                              <span>Cal: {result.calories.toFixed(0)}</span>
                              <span>Carbs: {result.carbs.toFixed(0)}g</span>
                              <span>Protein: {result.protein.toFixed(0)}g</span>
                              <span>Fats: {result.fats.toFixed(0)}g</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Display selected item details */}
                  {resultName && (
                    <div className="selected-item-details">
                      <p><strong>Name:</strong> {resultName}</p>
                      <p><strong>Calories:</strong> {resultCals.toFixed(0)}</p>
                      <p><strong>Carbs:</strong> {resultCarbs.toFixed(0)}g</p>
                      <p><strong>Protein:</strong> {resultProt.toFixed(0)}g</p>
                      <p><strong>Fats:</strong> {resultFat.toFixed(0)}g</p>
                      <div className="weight-input">
                        <label>Weight (g): </label>
                        <input
                          type="number"
                          value={resultSize}
                          onChange={handleResultSizeChange}
                          className="circular-input edit-meal-input"
                        />
                        <div style={{ marginTop: '10px' }}></div>
                      </div>
                      <button onClick={addSearchItem}>Add</button>
                    </div>
                  )}
                </>
              )}
            <div className={activeMode === 'Custom' ? 'fade-in' : 'fade-out'}>
              {activeMode === 'Custom' && (
                <>
                  <div style={{marginTop: '5px'}}>Add in your own meal!</div>
                  {error && <div style={{ color: 'red', marginTop: '15px' }}>{error}</div>}
                  <div style={{ marginTop: '10px'}} className="add-meal-container">
                    <div className="input-row">
                      <input
                        type="text"
                        value={name}
                        onChange={handleNameChange}
                        placeholder="Name"
                        className="circular-input edit-meal-input"
                      />
                    </div>
                    <div className="input-row">
                      <input
                        type="text"
                        value={calories}
                        onChange={handleCalorieChange}
                        placeholder="Calories"
                        className="circular-input edit-meal-input"
                      />
                    </div>
                    <div className="input-row">
                      <input
                        type="text"
                        value={carbs}
                        onChange={handleCarbChange}
                        placeholder="Carbohydrates (g)"
                        className="circular-input edit-meal-input"
                      />
                    </div>
                    <div className="input-row">
                      <input
                        type="text"
                        value={fats}
                        onChange={handleFatChange}
                        placeholder="Fats (g)"
                        className="circular-input edit-meal-input"
                      />
                    </div>
                    <div className='input-row'>
                      <input
                        type="text"
                        value={proteins}
                        onChange={handleProteinChange}
                        placeholder="Proteins (g)"
                        className="circular-input edit-meal-input"
                      />
                    </div>
                    <div className='input-row'>
                      <input
                        type="text"
                        value={weight}
                        onChange={handleWeightChange}
                        placeholder="Weight (g)"
                        className="circular-input edit-meal-input"
                      />
                    </div>
                  </div>
                  <div>
                    <button style={{ marginTop: '20px' }} onClick={handleAdd}>
                      Add
                    </button>
                  </div>
                </>
              )}
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
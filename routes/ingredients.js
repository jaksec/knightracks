import express from 'express';
import axios from 'axios';
import 'dotenv/config';
import { client } from '../server.js';  // Import the client from server.js to use in all routes

const router = express.Router();

const spoonacularApiKey = process.env.API_KEY;
const spoonacularBaseUrl = 'https://api.spoonacular.com';

//Required Nutritional fields
const requiredNutrients = ["Calories", "Carbohydrates", "Fat", "Protein"];

//Connect to Database 
const db = client.db('COP4331LargeProject');

// Route to perform partial matching on ingredient names
router.get('/search-ingredients', async (req, res) => {
  const query = req.query.q; // Expecting partial term from query parameter

  if (!query) {
    return res.status(400).send('Ingredient query is required');
  }

  try {
    const response = await axios.get(`${spoonacularBaseUrl}/food/ingredients/search`, {
      params: {
        query: query, // Pass the partial ingredient name
        number: 5,    // Limit results to 5 suggestions for partial matching
        apiKey: spoonacularApiKey,
      },
    });

    res.json(response.data); // Send the matching ingredients to the client
  } catch (error) {
    console.error('Error fetching ingredients from Spoonacular:', error);
    res.status(500).send('Error fetching ingredients from Spoonacular');
  }
});


// Route to fetch nutritional information for a specific ingredient ID
router.get('/ingredient-nutrition', async (req, res) => {
  const ingredientId = req.query.id; // Expecting ingredient ID from query parameter
  const amount = req.query.amount || 100; // Default amount to 100 if not provided
  const unit = 'g'; // Default unit to grams

  if (!ingredientId) {
    return res.status(400).send('Ingredient ID is required');
  }

  try {
    const response = await axios.get(`${spoonacularBaseUrl}/food/ingredients/${ingredientId}/information`, {
      params: {
        amount: amount,
        unit: unit,
        apiKey: spoonacularApiKey,
      },
    });

    // Extract the required nutrient information
    const nutritionData = response.data.nutrition.nutrients.filter(nutrient => 
      requiredNutrients.includes(nutrient.name)
    ).map(nutrient => ({
      name: nutrient.name,
      amount: nutrient.amount,
      unit: nutrient.unit
    }));

    res.json({
      ingredientId,
      name: response.data.name,
      nutrition: nutritionData
    });

  } catch (error) {
    console.error('Error fetching ingredient nutrition from Spoonacular:', error);
    res.status(500).send('Error fetching nutrition data from Spoonacular');
  }

});


router.post('/addIngredient', async (req, res) => {
  const {foodName, calories, carbs, fats, protein, weight } = req.body;

  // Check if all fields are provided
  if (!foodName || !calories || !carbs || !fats || !protein || !weight) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Create a new ingredient object
  const newIngredient = {
    foodId: foodId,
    foodName: foodName,
    calories: calories,
    carbs: carbs,
    fats: fats,
    protein: protein,
    weight: weight, //defualted to grams
  };

  try {
    // Insert the new ingredient into the 'Meals' collection
    const result = await db.collection('Meals').insertOne(newIngredient);

    // Send a success response
    res.status(201).json({ message: 'Ingredient added successfully', data: result.ops[0] });
  } catch (error) {
    console.error('Error adding ingredient:', error);
    res.status(500).json({ error: 'Failed to add ingredient' });
  }
});



export { router as ingredientRouter };



import express from 'express';
import axios from 'axios';
import 'dotenv/config';
import { client } from '../server.js';  // Import the client from server.js to use in all routes

const router = express.Router();

const spoonacularApiKey = process.env.API_KEY;
const spoonacularBaseUrl = 'https://api.spoonacular.com';

//Required Nutritional fields
const requiredNutrients = ["Calories", "Carbohydrates", "Fat", "Protein"];


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
  const { userId, foodName, calories, carbs, fats, protein, weight } = req.body;

  // Validate the input to make sure all fields are present
  if (!userId || !foodName || !calories || !carbs || !fats || !protein || !weight) {
    return res.status(400).json({ error: 'All fields are required, especially the userId' });
  }

  // Connect to the database and log connection status
  const db = client.db('COP4331LargeProject');
  console.log('Connected to Database');

  // Create a new ingredient object with the provided data
  const newIngredient = {
    userId: userId, // Relationship to a specific user
    foodName: foodName,
    calories: calories,
    carbs: carbs,
    fats: fats,
    protein: protein,
    weight: weight, // Defaulted to grams
  };

  try {
    // Attempt to insert the ingredient into the Meals collection
    const result = await db.collection('Meals').insertOne(newIngredient);
    //console.log('Insert operation result:', result); // Log the full result object to inspect its properties

    // Check if the document was successfully inserted
    if (result.insertedId) {
      res.status(201).json({
        message: 'Ingredient added successfully',
        data: { _id: result.insertedId, ...newIngredient } // Include the new ID and ingredient data in the response
      });
    } else {
      // Log an error if `insertedId` is not present
      console.error('Insert operation did not return an insertedId');
      res.status(500).json({ error: 'Failed to add ingredient, no insertedId returned' });
    }
  } catch (error) {
    // Catch and log any errors during the insertion process
    console.error('Error adding ingredient:', error);
    res.status(500).json({ error: 'Failed to add ingredient' });
  }
});



export { router as ingredientRouter };



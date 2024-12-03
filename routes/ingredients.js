import express from 'express';
import axios from 'axios';
import 'dotenv/config';
import { client } from '../server.js';  // Import the client from server.js to use in all routes
import { ObjectId } from 'mongodb';

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

router.put('/updateMeal', async (req, res) => {
  const { mealId, foodName, calories, carbs, fats, protein, weight } = req.body;

  // Validate input
  if (!mealId || !foodName || !calories || !carbs || !fats || !protein || !weight) {
    return res.status(400).json({ error: 'All fields are required, especially mealId.' });
  }

  // Validate mealId format
  if (!ObjectId.isValid(mealId)) {
    return res.status(400).json({ error: 'Invalid mealId format.' });
  }

  const db = client.db('COP4331LargeProject');

  try {
    // Debugging: Check if meal exists
    const meal = await db.collection('Meals').findOne({ _id: new ObjectId(mealId) });
    console.log('Meal exists:', meal);
    if (!meal) {
      return res.status(404).json({ error: 'Meal not found in database.' });
    }

    // Debugging: Log the fields being updated
    const updateFields = { foodName, calories, carbs, fats, protein, weight };
    console.log('Update Fields:', updateFields);

    // Perform the update
    const updatedMeal = await db.collection('Meals').findOneAndUpdate(
      { _id: new ObjectId(mealId) },
      { $set: updateFields },
      { returnOriginal: false } // Use for MongoDB < 4.4
    );

    // Debugging: Log the result of findOneAndUpdate
    console.log('findOneAndUpdate result:', updatedMeal);

    if (!updatedMeal) {
      return res.status(404).json({ error: 'Meal not found.' });
    }

    return res.status(200).json({
      message: 'Meal updated successfully',
      data: updatedMeal.value
    });
  } catch (error) {
    console.error('Error updating meal:', error);
    return res.status(500).json({ error: 'Failed to update meal.' });
  }
});

// Route to get all meals for a specific user
router.get('/getMeals', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const db = client.db('COP4331LargeProject');

  try {
    const meals = await db.collection('Meals').find({ userId: new ObjectId(userId) }).toArray();
    res.status(200).json(meals);
  } catch (error) {
    console.error('Error fetching meals:', error);
    res.status(500).json({ error: 'An error occurred while fetching the meals' });
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
    userId: new ObjectId(userId), // Relationship to a specific user
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


router.delete('/deleteMeal', async (req, res) => {
  const { mealId } = req.body; // Expecting the unique _id of the meal to delete

  if (!mealId) {
    return res.status(400).json({ error: 'Meal ID is required' });
  }

  const db = client.db('COP4331LargeProject');
  try {
    const result = await db.collection('Meals').deleteOne({ _id: new ObjectId(mealId) });

    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Meal deleted successfully', mealId });
    } else {
      res.status(404).json({ error: 'Meal not found' });
    }
  } catch (error) {
    console.error('Error deleting meal:', error);
    res.status(500).json({ error: 'An error occurred while deleting the meal' });
  }
});


export { router as ingredientRouter };



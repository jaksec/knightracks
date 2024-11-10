import express from 'express';
import axios from 'axios';
import 'dotenv/config';

const router = express.Router();

const spoonacularApiKey = process.env.API_KEY;
const spoonacularBaseUrl = 'https://api.spoonacular.com';

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


// Route to fetch nutritional information for a specific ingredient ID from the search function
router.get('/ingredient-nutrition', async (req, res) => {
    const ingredientId = req.query.id; // Expecting ingredient ID from query parameter
  
    if (!ingredientId) {
      return res.status(400).send('Ingredient ID is required');
    }
  
    try {
      const response = await axios.get(`${spoonacularBaseUrl}/food/ingredients/${ingredientId}/information`, {
        params: {
          amount: 100, // Amount in grams for standardized nutrition data
          unit: 'g',
          apiKey: spoonacularApiKey,
        },
      });
  
      res.json(response.data.nutrition); // Send nutrition data to the client
    } catch (error) {
      console.error('Error fetching ingredient nutrition from Spoonacular:', error);
      res.status(500).send('Error fetching nutrition data from Spoonacular');
    }
  });

  export { router as ingredientRouter };


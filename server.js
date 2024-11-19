import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';

const url = process.env.MONGODB_URL;
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Initialize MongoDB connection
let client;
async function initializeMongoClient() {
  try {
    client = new MongoClient(url);
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (e) {
    console.error('MongoDB connection failed:', e);
  }
}

initializeMongoClient(); // Call the async function to connect to MongoDB

// Export the client so it can be used in other files
export { client };

// Import routers after MongoDB connection
import { userRouter } from './routes/users.js';
import { ingredientRouter } from './routes/ingredients.js';
import { goalsRouter } from './routes/goals.js';

// API endpoints
app.use('/api/user', userRouter);
app.use('/api/ingredient', ingredientRouter);
app.use('/api/goal', goalsRouter);

// Set CORS headers to allow requests from any origin
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  next();
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

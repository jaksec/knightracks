import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';

const url = process.env.MONGODB_URL;
const app = express();

app.use(express.json());
//app.use(cors);
app.use(cors());


// Initialize MongoDB connection
const client = new MongoClient(url);
client.connect()
  .then(() => console.log('Connected to MongoDB'))
  .catch(e => console.error('MongoDB connection failed:', e));

export { client };//global variable 

//import routers
import {userRouter} from './routes/users.js' 
import { ingredientRouter } from './routes/ingredients.js';


// To use API endpoints in user router file  
app.use('/api/user', userRouter); 

// To use API endpoints in ingredient router file  
app.use('/api/ingredient', ingredientRouter); 



// Set CORS headers to allow requests from any origin
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    next();
}); 

// Check if server is running 
app.listen (5000,() => console.log ("Server is running")); 

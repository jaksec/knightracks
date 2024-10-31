const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt'); // For password hashing
const saltRounds =10; //length of encrypted password 


const app = express();
app.use(cors());
app.use(bodyParser.json());

require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb+srv://RickL:COP4331@cluster0.3dvux.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(url);
client.connect();



// Register new Users  
app.post('/api/register', async (req, res) => 
  {
    // Incoming: login, password, firstName, lastName, and email
    const { login, password, firstName, lastName, email } = req.body;
  
    // Input validation to check if all fields are provided
    if (!login || !password || !firstName || !lastName || !email) 
    {
        return res.status(400).json({ id: -1, firstName: '', lastName: '', error: 'All fields (Login, Password, FirstName, LastName, and Email) are required' });
    }
  
    const db = client.db('COP4331LargeProject');
  
    try 
    {
        // Check if the user already exists 
        const userExists = await db.collection('Users').findOne({ Login: login });
        if (userExists) 
        {
            return res.status(400).json({ id: -1, firstName: '', lastName: '', error: 'User already exists' });
        }
        
        const hashedPassword = await bcrypt.hash(password,saltRounds);

        // Prepare new user details and insert into MongoDB
        const newUser = { Login: login, Password: hashedPassword, FirstName: firstName, LastName: lastName, Email: email }; 
        
        const result = await db.collection('Users').insertOne(newUser); // Insert new user into database 
  
        // Retrieve the UserId (MongoDB generates _id which is the UserId here)
        const userId = result.insertedId; // The insertedId is the unique ID of the new document
  
        // Prepare the response in the same structure as the login response
        const response = { id: userId, firstName, lastName, error: '' };
        res.status(200).json(response); // Send a successful response
    } 
    catch (e) 
    {
        // Catch any unexpected errors
        console.error(e); // Log the error for debugging
        res.status(500).json({ id: -1, firstName: '', lastName: '', error: 'An error occurred during registration' });
    }
  });
  



// Login User 
app.post('/api/login', async (req, res) => 
{
    // Incoming: login, password
    // Outgoing: id, firstName, lastName, error
  
    const { login, password } = req.body;

    // Connect to the database
    const db = client.db('COP4331LargeProject');

    // Initialize variables for user details
    let id = -1;
    let fn = '';
    let ln = '';
    
    // Input validation to check if both fields are provided
    if (!login || !password) 
    {
        // Set error message and return 400 status
        return res.status(400).json({ id, firstName: fn, lastName: ln, error: 'Login and Password are required' });
    }

    try 
    {
        // Search for the user in the database
        const results = await db.collection('Users').findOne({ Login: login });
        
        // If a user was found, extract their details
        if (results && await bcrypt.compare(password,results.Password)) 
        {
            id = results._id;
            fn = results.FirstName;
            ln = results.LastName;
            
         }
        else 
        {
            // If no user is found, send an appropriate error response
            return res.status(401).json({ id, firstName: fn, lastName: ln, error: 'Invalid login or password' });
        }

        // Prepare and send the response
        const ret = { id, firstName: fn, lastName: ln, error: '' };
        res.status(200).json(ret);
    } 
    catch (error) 
    {
        console.error(error); // Log the error for debugging
        res.status(500).json({ error: 'An error occurred during login' });
    }
});



// Endpoint to add cards
const { ObjectId } = require('mongodb');

app.post('/api/addcard', async (req, res) => 
    {
    const { userId, card } = req.body;

    // Check for missing fields
    if (!userId || !card) 
    {
        return res.status(400).json({ error: 'UserId and card details are required' });
    }

    let error = '';

    try 
    {
        const db = client.db('COP4331LargeProject');

        // Convert userId to ObjectId
        const newCard = 
        {
            Card: card, UserId: ObjectId.createFromHexString(userId)
        };

        // Insert the new card
        const result = await db.collection('Cards').insertOne(newCard);

        // Send back the success response
        res.status(200).json({ cardId: result.insertedId, userId, error: '' });
    } 
    catch (e) 
    {
        error = e.toString();
        console.error('Error in addCard endpoint:', error);  // Log the error details

    }
});




//Search Cards 
app.post('/api/searchcards', async (req, res, next) => 
    {
    // Incoming: userId, search
    // Outgoing: results[], error

    let error = ''; 
    const { userId, search } = req.body; 
    const _search = search.trim(); 

    try 
    {
        const db = client.db('COP4331LargeProject');

        // Find cards matching the search term and belonging to the specified userId
        const results = await db.collection('Cards').find({

            "UserId": ObjectId.createFromHexString(userId), // Ensure userId is an ObjectId
            "Card": { $regex: _search + '.*', $options: 'i' }  // Case-insensitive search
        }).toArray();

        // Prepare the results to send back
        const _ret = results.map(result => result.Card); 

        // Response object
        const ret = { results: _ret, error: error }; 
        res.status(200).json(ret); 

    } 
    catch (e) 
    {
        console.error(e);
        // Update error message for response
        error = e.toString();
        res.status(500).json({ results: [], error: error });
    }
});


    


// Set CORS headers to allow requests from any origin
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    next();
});

// Start the node + express server on port 5000
app.listen(5000);

require('dotenv').config();


const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt'); // For password hashing
const jwt = require('jsonwebtoken'); // Import jwt
const nodemailer = require('nodemailer');
const MongoClient = require('mongodb').MongoClient;


const saltRounds = 10; //length of encrypted password 
const MongoClient = require('mongodb').MongoClient;
const url = process.env.MONGODB_URL; //databse url form .env
const jwtSecret = process.env.JWT_SECRET || "defaultSecretKey"; // Ensure JWT_SECRET is available and if not set, sets to default 


const app = express();
/*app.use(cors());*/
app.use(cors({
    origin: 'http://localhost:5173/', // Specify the frontend origin
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Authorization']
  }));
app.use(bodyParser.json());


// Connect to Database
const client = new MongoClient(url);
client.connect()
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection failed:', err));


//Nodemail Transporter connection 
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",  //sender email type 
    port: 465,
    auth: {
       user: process.env.GMAIL_USER,  //sender email
       pass: process.env.GMAIL_PASS,  //passcode for sender email 
    },
});


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
  
    //Connect to Database 
    const db = client.db('COP4331LargeProject');
  
    try 
    {
        // Check if the user already exists 
        const userExists = await db.collection('Users').findOne({ Email:email });
        if (userExists) 
        {
            return res.status(400).json({ id: -1, firstName: '', lastName: '', error: 'User already exists' });
        }
        
        const hashedPassword = await bcrypt.hash(password,saltRounds); //password hashed 
        const verificationToken = jwt.sign({ email }, jwtSecret, { expiresIn: '24h' }); // Generate a verification token w/exppiration 

        // Prepare new user details for insertion into database 
        const newUser = 
        { 
            Login: login, 
            Password: hashedPassword, 
            FirstName: firstName, 
            LastName: lastName, 
            Email: email, 
            isVerified: false,             //email verification field default 
            emailToken:verificationToken, //email token shows when unverified, removed when verified 
            createdAt: new Date(),       // Set createdAt to the current date
            updatedAt: new Date()       // Set updatedAt to the current date initially 
        };   
        
        
        const result = await db.collection('Users').insertOne(newUser); // Insert new user into database 
  
        // Retrieve the UserId (MongoDB generates _id which is the UserId here)
        const userId = result.insertedId; // The insertedId is the unique ID of the new document/each new user 


        // Send verification email to registered email, message seen by user 
        //Passing back email verification token 
        await transporter.sendMail({
            to: email,
            subject: 'Verify Your Email',
            html: `<p>Please click <a href="http://localhost:5000/confirmation/${verificationToken}">here</a> to verify your email.</p>
    <p>If the link doesn't work, you can also copy and paste the following URL into your browser:</p>
    <p>http://localhost:5000/confirmation/${verificationToken}</p>`, 
        });

  
        // Prepare the response in the same structure as the login response
        const response = { id: userId, firstName, lastName, error: '' };
        res.status(200).json(response); // Send a successful response
    } 
    catch (e) 
    {
        // Catch all other errors
        console.error(e); // Log the error for debugging
        res.status(500).json({ id: -1, firstName: '', lastName: '', error: 'An error occurred during registration' });
    }
  });
  

// Email Verification Route to read email token 
app.get('/confirmation/:token', async (req, res) => 
{
    const token = req.params.token;

    try {
        // Verify and decode the token
        const decoded = jwt.verify(token, jwtSecret);

        // Connect to database
        const db = client.db('COP4331LargeProject');

        // Find the user using the email from the decoded token
        const user = await db.collection('Users').findOne({ Email: decoded.email });

        // Check if user exists and if the token matches
        if (!user || !user.emailToken || user.emailToken !== token) {
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }

        // Update verification status
        await db.collection('Users').updateOne(
            { emailToken: token },
            { $set: { isVerified: true }, $unset: { emailToken: "" } }
        );

        // Send success response
        res.json({ success: true, message: 'Email verified successfully' });
    } 
    catch (e) 
    {
        console.error(e); // Log error for debugging
        res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

});


// Login User 
app.post('/api/login', async (req, res) => 
    {
        // Incoming: login, password
        // Outgoing: id, firstName, lastName, token, error
    
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
            return res.status(400).json({ id, firstName: fn, lastName: ln, token: '', error: 'Login and Password are required' });
        }
    
        try 
        {
            // Search for the user in the database
            const results = await db.collection('Users').findOne({ Login: login });
            
            // If a user was found
            if (results) 
            {
                // Check if the password matches
                const passwordMatches = await bcrypt.compare(password, results.Password);
                // Check if the user is verified
                const isVerified = results.isVerified;
    
                //if password matches database and user has verified email
                if (passwordMatches && isVerified) 
                {
                    id = results._id;
                    fn = results.FirstName;
                    ln = results.LastName;
    
                    // Generate JWT token
                    const token = jwt.sign({ id, firstName: fn, lastName: ln }, jwtSecret, { expiresIn: '1h' });
    
                    // Prepare and send the response with the token
                    return res.status(200).json({ id, firstName: fn, lastName: ln, token, error: '' });
                }
                else if (!isVerified) 
                {
                    // If the user is not verified
                    return res.status(403).json({ id, firstName: fn, lastName: ln, token: '', error: 'Email not verified. Please check your inbox for the verification email.' });
                }
            }
            // If no user was found or password is incorrect
            return res.status(401).json({ id, firstName: fn, lastName: ln, token: '', error: 'Invalid login or password' });
        } 
        catch (e) 
        {
            console.error(e); // Log the error for debugging
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
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    next();
});

// Start the node + express server on port 5000
app.listen(5000);

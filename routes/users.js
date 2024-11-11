import express from 'express' 
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import nodemailer from 'nodemailer';
const jwtSecret = process.env.JWT_SECRET || "defaultSecretKey";  
const saltRounds = 10; 
import { client } from '../server.js';  // Import the client from server.js to use in all routes 


const router = express.Router();



// Register new users route   
router.post('/register', async (req, res) => 
    {
      
      //Incoming: login, password, firstName, lastName, and email
      //Outgoing: _id, firstName, LastName, error message 
        
      const { login, password, firstName, lastName, email } = req.body;
      
      if (!login || !password || !firstName || !lastName || !email) 
      {   
          return res.status(399).json({ error: 'All fields are required' });
      }
    
      //Connect to Database 
      const db = client.db('COP4331LargeProject');
    
      try 
      {
          const userExists = await db.collection('Users').findOne({ Email:email });

          if (userExists) 
          { 
              return res.status(400).json({ error: 'User already exists' });
          }
          
          const hashedPassword = await bcrypt.hash(password,saltRounds); //password hashed 
          const verificationToken = jwt.sign({email }, jwtSecret, { expiresIn: '24h' }); // Generate a email verification token w/exppiration 


          //Creating user for insertion into database 
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
          
          
          const result = await db.collection('Users').insertOne(newUser); 
    
          //MongoDB generated _id set to UserId here
          const userId = result.insertedId; 

          // Send verification email, with url linked token
          await transporter.sendMail({
            to: email,
            subject: 'Verify Your Email',
            html: `<p>Please click <a href="http://localhost:5000/api/user/confirmation/${verificationToken}">here</a> to verify your email.</p>
            <p>If the link doesn't work, you can also copy and paste the following URL into your browser:</p>
            <p>http://localhost:5000/api/user/confirmation/${verificationToken}</p>`, 
        });
          const response = { id: userId, firstName, lastName, error: '' };
          res.status(200).json(response); 
      } 
      catch (e) 
      {
        return res.status(500).json({ error: 'An error occurred during registration' });
      }
    });
    

    //Email Verification Route 
    router.get('/confirmation/:token', async (req, res) => 
    {
        
        const token = req.params.token;
    
        try {

            const decoded = jwt.verify(token, jwtSecret);
            const db = client.db('COP4331LargeProject');
            const user = await db.collection('Users').findOne({ Email: decoded.email });
            
            if (!user || !user.emailToken || user.emailToken !== token) {
                return res.status(400).json({ success: false, message: 'Invalid or expired token' });
            }
            //Email Verification sucess response removes token from database 
            await db.collection('Users').updateOne(
                { emailToken: token },{ $set: { isVerified: true }, $unset: { emailToken: "" } });
         
            return res.redirect('http://COP4331-13.xyz');  //redirect for successful verification 
            
    
        } 
        catch (e) 
        {
            return res.status(400).json({ success: false, message: 'An error occurred while verifying token' });
        }
    });
    
  
//Nodemail Transporter connection 
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",  //sender email type 
    port: 465,
    auth: {
       user: process.env.GMAIL_USER,  
       pass: process.env.GMAIL_PASS,  
    },
});


//login users route 
router.post('/login', async (req, res) => 
    {
        // Incoming: login, password
        // Outgoing: id, firstName, lastName, token, error
    
        const { login, password } = req.body;
    
        const db = client.db('COP4331LargeProject');
    
        // Initialize variables for user details
        let id = -1;
        let fn = '';
        let ln = '';
        
    
        if (!login || !password) 
        {
            return res.status(400).json({ id, firstName: fn, lastName: ln, token: '', error: 'Login and Password are required' });
        }
    
        try 
        {
            console.log("we are trying to reach the database");
            const results = await db.collection('Users').findOne({ Login: login });
            
            if (results) 
            {
                // Check if the password matches
                const passwordMatches = await bcrypt.compare(password, results.Password);

                // Check if the user is verified
                const isVerified = results.isVerified;
    
                
                if (passwordMatches && isVerified) 
                {
                    id = results._id;
                    fn = results.FirstName;
                    ln = results.LastName;
    
                    // Generate JWT token
                    const token = jwt.sign({ id, firstName: fn, lastName: ln }, jwtSecret, { expiresIn: '1h' });
                    return res.status(200).json({ id, firstName: fn, lastName: ln, token, error: '' });
                }
                else if (!isVerified) 
                {
                    
                    return res.status(403).json({ id, firstName: fn, lastName: ln, token: '', error: 'Email not verified. Please check your inbox for the verification email.' });
                }
            }
            // If no user was found or password is incorrect
            return res.status(401).json({ id, firstName: fn, lastName: ln, token: '', error: 'Invalid login or password' });
        } 
        catch (e) 
        {
            console.error(e); 
            res.status(500).json({ error: 'An error occurred during login' });
        }
    });

router.post("/reset-password", async (req, res) => 
{
    const {email } = req.body;

    if(!email)
    {
        return res.status(339).json({ error: 'Please enter an Email' });
    }

    const db = client.db('COP4331LargeProject');  // Ensure db connection

    try
    {
        const user = await db.collection('Users').findOne({ Email: email });

        if(!user)
        {
            return res.status(339).json({ error: 'No user with that email was found' });
        }
        // Check if the user is verified before sending reset email 
        if (!user.isVerified) 
        {
        return res.status(400).json({ error: 'Your email is not verified. Please verify your email before requesting a password reset.' });
        }

        //Generate Password reset token 
        const resetPasswordToken = jwt.sign({ 
            email: user.Email, userId: user._id }, jwtSecret,{ expiresIn: '1h' });

        const resetLink = `http://localhost:5000/api/user/reset-password/${resetPasswordToken}`; //will need to change to livedomain 
        
        await transporter.sendMail({
            to: email,
            subject: 'Password Reset Request',
            html: `<p>Please click <a href="${resetLink}">here</a> to reset your password. The link will expire in 1 hour.</p>`
        });

        res.status(200).json({ 
            message: 'Password reset email sent', 
            resetPasswordToken  // Including the token in the response for testing
        });
        
    } 
    catch (error) 
    {
        res.status(500).json({ error: 'An error occurred during the reset process' });
    }
});
 

router.post("/reset-password/:token", async (req, res) => 
{
    const { token } = req.params;  //reset token extracted from url 
    const { password } = req.body; //new password 

    if (!password) 
    {
        return res.status(400).json({ error: 'Password is required' });
    }

    try 
    {
        // Verify the reset token  
        const decoded = jwt.verify(token, jwtSecret); 

        const db = client.db('COP4331LargeProject'); 

        //find user based on email 
        const user = await db.collection('Users').findOne({ Email: decoded.email });

        if (!user) 
        {
            return res.status(404).json({ error: 'User not found' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Update the user's password in the database
        await db.collection('Users').updateOne({ _id: user._id }, { $set: { Password: hashedPassword } }); //updates password belonging to _id 

        res.status(200).json({ message: 'Password has been reset successfully' });

    } 
    catch (error) 
    {
        res.status(400).json({ error: 'Invalid or expired token' }); 
    }
});
    

export { router as userRouter}; 

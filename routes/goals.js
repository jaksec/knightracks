import express from 'express';
import 'dotenv/config';
import { client } from '../server.js';  // Import the client from server.js to use in all routes
import { ObjectId } from 'mongodb';

const router = express.Router();

router.post('/addGoal', async (req, res) => 
{
    //Incoming: userId, calories, proteins, fats, carbs
    //Outgoing: userId, calories, proteins, fats, carbs
    const{userId, calories, proteins, carbs, fats} = req.body;

    if (!userId || !calories || !proteins || !carbs || !fats)
    {
        return res.status(399).json({error: 'All fields required' });
    }

    //Connect to Database 
    const db = client.db('COP4331LargeProject');

    const newGoal = 
    {
        userId: new ObjectId(userId), //Convert userId to an ObjectId
        calories: calories,
        carbs: carbs,
        fats: fats,
        proteins: proteins
    };

    try
    {
        const result = await db.collection('DailyGoals').insertOne(newGoal);

        if (result.insertedId) {
            res.status(201).json({
              message: 'New Goal added successfully',
              data: { _id: result.insertedId, ...newGoal} // Include the new ID and ingredient data in the response
            });
        }  else {
            // Log an error if `insertedId` is not present
            console.error('Insert operation did not return an insertedId');
            res.status(500).json({ error: 'Failed to add the Daily Goal, no insertedId returned' });
          }
        
    }
    catch (e)
    {
        return res.status(500).json({ error: 'An error occurred while adding a new goal'});
    }
});


router.put('/updateGoal', async (req, res) => 
{
    // Incoming: userId, calories, proteins, fats, carbs
    // Outgoing: Updated goal data or an error message
    const { userId, calories, proteins, carbs, fats } = req.body;
  
    if (!userId || !calories || !proteins || !carbs || !fats) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    // Connect to Database
    const db = client.db('COP4331LargeProject');
  
    try {
      // Convert userId to ObjectId for querying
      const filter = { userId: new ObjectId(userId) };
  
      // Define the update operation
      const update = {
        $set: {
          calories: calories,
          proteins: proteins,
          carbs: carbs,
          fats: fats,
        },
      };
  
      // Perform the update operation
      const result = await db.collection('DailyGoals').updateOne(filter, update);
  
      if (result.matchedCount > 0) {
        if (result.modifiedCount > 0) {
          res.status(200).json({
            message: 'Daily Goal updated successfully',
            data: { userId, calories, proteins, carbs, fats },
          });
        } else {
          res.status(200).json({ message: 'No changes were made to the Daily Goal' });
        }
      } else {
        res.status(404).json({ error: 'Daily Goal not found for the given userId' });
      }
    } catch (e) {
      console.error('Error occurred during update:', e);
      res.status(500).json({ error: 'An error occurred while updating the Daily Goal' });
    }
});


export { router as goalsRouter };
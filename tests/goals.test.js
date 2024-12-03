import request from 'supertest';
import app from '../server.js'; // Import the app for testing

describe('POST /api/goal/addGoal', () => {
  it('should add a new goal successfully', async () => {
    const mockGoal = {
      userId: '64b2fb3c8e1234567890abcd',
      calories: 2000,
      proteins: 50,
      carbs: 250,
      fats: 70,
    };

    const response = await request(app).post('/api/goal/addGoal').send(mockGoal);

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('message', 'New Goal added successfully');
    expect(response.body.data).toMatchObject({
      calories: mockGoal.calories,
      proteins: mockGoal.proteins,
      carbs: mockGoal.carbs,
      fats: mockGoal.fats,
    });
  });

  it('should return an error if required fields are missing', async () => {
    const response = await request(app).post('/api/goal/addGoal').send({});

    expect(response.statusCode).toBe(399);
    expect(response.body).toHaveProperty('error', 'All fields required');
  });
});


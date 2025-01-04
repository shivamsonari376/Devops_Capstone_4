const request = require('supertest');
const app = require('../index');
const Auth = require('../models/auth.model');
const mongoose = require('mongoose');
const redis = require('../utils/redis');
const bcrypt = require('bcrypt');
const { producer } = require('../utils/kafka');

// Mock Redis and Kafka
jest.mock('../utils/redis');
jest.mock('../utils/kafka');

describe('Auth Service', () => {
    beforeAll(async () => {
        await producer.connect();
    });

    afterEach(() => {
        jest.clearAllMocks(); // Clear all mocks after each test
    });

    afterAll(async () => {
        await new Promise((resolve) => redis.quit(resolve)); // Properly close Redis connection
        await producer.disconnect(); // Disconnect Kafka producer
        await mongoose.connection.close(); // Close database connection
    });

    describe('POST /auth/register', () => {
        it('should register a new user', async () => {
            jest.spyOn(Auth.prototype, 'save').mockImplementationOnce(() => Promise.resolve());

            const res = await request(app)
                .post('/auth/register')
                .send({
                    email: 'newuser@example.com',
                    password: 'password',
                    role: 'student',
                });

            expect(res.status).toBe(201);
            expect(res.body.message).toBe('User registered successfully');
        });

        it('should fail if the user already exists', async () => {
            jest.spyOn(Auth, 'findOne').mockImplementationOnce(() =>
                Promise.resolve({ email: 'existinguser@example.com' })
            );

            const res = await request(app)
                .post('/auth/register')
                .send({
                    email: 'existinguser@example.com',
                    password: 'password',
                    role: 'student',
                });

            expect(res.status).toBe(500);
            expect(res.body.error).toBeDefined();
        });
    });

    describe('POST /auth/login', () => {
        it('should login successfully with valid credentials', async () => {
            const hashedPassword = await bcrypt.hash('password', 10); // Pre-hash password

            jest.spyOn(Auth, 'findOne').mockImplementationOnce(async () =>
                Promise.resolve({
                    _id: 'userId',
                    email: 'existinguser@example.com',
                    password: hashedPassword,
                    role: 'student',
                })
            );

            const res = await request(app)
                .post('/auth/login')
                .send({
                    email: 'existinguser@example.com',
                    password: 'password',
                });

            expect(res.status).toBe(200);
            expect(res.body.token).toBeDefined();
        });

        it('should fail login with invalid credentials', async () => {
            const hashedPassword = await bcrypt.hash('password', 10); // Pre-hash password

            jest.spyOn(Auth, 'findOne').mockImplementationOnce(async () =>
                Promise.resolve({
                    _id: 'userId',
                    email: 'existinguser@example.com',
                    password: hashedPassword,
                    role: 'student',
                })
            );

            const res = await request(app)
                .post('/auth/login')
                .send({
                    email: 'existinguser@example.com',
                    password: 'wrongpassword',
                });

            expect(res.status).toBe(401);
            expect(res.body.error).toBe('Invalid credentials');
        });

        it('should fail if the user does not exist', async () => {
            jest.spyOn(Auth, 'findOne').mockImplementationOnce(async () => Promise.resolve(null));

            const res = await request(app)
                .post('/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password',
                });

            expect(res.status).toBe(404);
            expect(res.body.error).toBe('User not found');
        });
    });
});

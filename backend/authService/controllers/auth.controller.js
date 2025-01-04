const Auth = require('../models/auth.model');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/jwt');
const { producer } = require('../utils/kafka');
const connectRedis = require('../utils/redis');

exports.register = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user to database
        const user = new Auth({ email, password: hashedPassword, role });
        await user.save();

        // Publish event to Kafka
        await producer.connect();
        await producer.send({
            topic: 'UserRegistered',
            messages: [{ value: JSON.stringify({ email, role }) }],
        });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await Auth.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const token = generateToken({ id: user._id, role: user.role }, process.env.JWT_SECRET, '1h');

        const redisClient = await connectRedis(); // Get the Redis client
        await redisClient.set(`authToken:${user._id}`, token, { EX: 3600 }); // Set token with expiration

        res.status(200).json({ token });
    } catch (err) {
        console.error('Login Error:', err.message);
        res.status(500).json({ error: err.message });
    }
};
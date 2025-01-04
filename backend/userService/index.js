require('dotenv').config(); // Load environment variables
const express = require('express');
const userRoutes = require('./routes/user.route'); // User routes
const cors = require('cors')


const app = express();

// Middleware
app.use(express.json()); // Parse JSON requests

app.use(cors())

// Register Routes
app.use('/user', userRoutes);

// Default Route
app.get('/', (req, res) => {
    res.status(200).json({ message: 'User Service is running!' });
});

// Start Server
const PORT = process.env.PORT || 5001; // Default port 5001 for userService
app.listen(PORT, () => {
    console.log(`User Service running on port ${PORT}`);
});

module.exports = app;

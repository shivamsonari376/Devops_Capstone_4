require('dotenv').config(); // Load environment variables
const express = require('express');
const companyRoutes = require('./routes/company.route'); // Company routes
const cors = require('cors')


const app = express();

// Middleware
app.use(express.json()); // Parse JSON requests
app.use(cors())

// Register Routes
app.use('/company', companyRoutes); // Protect all company routes with JWT middleware

// Default Route
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Company Service is running!' });
});

// Start Server
const PORT = process.env.PORT || 5002; // Default port for companyService
app.listen(PORT, () => {
    console.log(`Company Service running on port ${PORT}`);
});

module.exports = app;

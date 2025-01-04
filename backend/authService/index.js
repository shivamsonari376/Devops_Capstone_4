require('dotenv').config();
const express = require('express');
const cors = require('cors')
const connectRedis = require('./utils/redis');

process.on('SIGINT', async () => {
    const redisClient = await connectRedis();
    await redisClient.quit(); // Gracefully close the Redis connection
    console.log('Redis connection closed');
    process.exit(0);
});


const app = express();

// Middleware
app.use(express.json());
app.use(cors())

const authRoutes = require('./routes/auth.route');

app.use('/auth', authRoutes);

const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Auth Service running on port ${PORT}`);
    });


module.exports = app;

const { createClient } = require('redis');

let redisClient;

const connectRedis = async () => {
    if (!redisClient) {
        redisClient = createClient({
            url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
        });

        redisClient.on('error', (err) => console.error('Redis Error:', err));
        redisClient.on('connect', () => console.log('Connected to Redis'));

        await redisClient.connect();
    }
    return redisClient;
};

module.exports = connectRedis;

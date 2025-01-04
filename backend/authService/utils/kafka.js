const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    brokers: [process.env.KAFKA_BROKERS],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'auth-service-group' });

module.exports = { producer, consumer };

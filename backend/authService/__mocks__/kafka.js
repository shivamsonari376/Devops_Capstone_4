module.exports = {
    Kafka: jest.fn(() => ({
        producer: jest.fn(() => ({
            connect: jest.fn(),
            send: jest.fn(),
            disconnect: jest.fn(),
        })),
        consumer: jest.fn(() => ({
            connect: jest.fn(),
            subscribe: jest.fn(),
            run: jest.fn(),
        })),
    })),
};

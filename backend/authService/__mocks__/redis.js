module.exports = {
    createClient: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        quit: jest.fn((callback) => callback && callback()), // Simulate quit as async
        on: jest.fn(),
    })),
};

const db = require('../utils/dbconn')
const mongoose = require("../utils/dbconn").mongoose;
const authSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin', 'company'], default: 'student' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Auth', authSchema);

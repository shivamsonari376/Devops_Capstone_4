const db = require('../utils/dbconn');
const mongoose = require("../utils/dbconn").mongoose;
require('./auth.model');


const companySchema = new mongoose.Schema({
    authId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth', required: true }, // Reference to the auth model
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth', required: true }, // User who created the company
    name: { type: String, required: true, unique: true }, // Company name
    contactNumber: { type: String, required: true }, // Contact phone number
    website: { type: String }, // Company website URL
    address: {
        street: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip: { type: String },
        country: { type: String, required: true },
    },
    logoUrl: { type: String }, // URL for the company logo (stored in S3)
    subscription: {
        status: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
        startDate: { type: Date, default: Date.now },
        endDate: { type: Date, default: function () {
            return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // Add 1 year in milliseconds
        }, },
    },
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);

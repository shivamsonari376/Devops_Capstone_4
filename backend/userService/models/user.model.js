const db = require('../utils/dbconn')
const mongoose = require("../utils/dbconn").mongoose;

const userProfileSchema = new mongoose.Schema({
    authId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth', required: true, unique: true }, // Reference to Auth collection
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dob: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    contactNumber: { type: String, required: true },
    address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        zip: { type: String },
        country: { type: String }
    },
    profilePictureUrl: { type: String }, // S3 URL for profile picture
    resumeUrl: { type: String }, // S3 URL for resume
    education: [
        {
            degree: { type: String, required: true },
            institution: { type: String, required: true },
            startYear: { type: Number, required: true },
            endYear: { type: Number },
            grade: { type: String } // GPA or percentage
        }
    ],
    workExperience: [
        {
            companyName: { type: String, required: true },
            position: { type: String, required: true }, // e.g., Intern, Developer
            startDate: { type: Date, required: true },
            endDate: { type: Date },
            description: { type: String } // Summary of responsibilities
        }
    ],
}, { timestamps: true });

module.exports = mongoose.model('UserProfile', userProfileSchema);

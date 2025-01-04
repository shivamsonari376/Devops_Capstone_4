const express = require('express');
const multer = require('multer');
const {
    createOrUpdateProfile,
    getProfile,
    getProfileById,
    addEducation,
    addWorkExperience,
    uploadResume
} = require('../controllers/user.controller');
const verifyToken = require('../middlewares/auth.middleware');

const router = express.Router();
const upload = multer(); // For handling file uploads in memory

// Profile Routes
router.post('/profile', verifyToken, upload.single('file'), createOrUpdateProfile); // Create or Update Profile
router.get('/profile', verifyToken, getProfile); // Get Profile
router.get('/profile/:id', verifyToken, getProfileById); // Get Profile by ID

// Education Routes
router.post('/profile/education', verifyToken, addEducation); // Add Education

// Work Experience Routes
router.post('/profile/work', verifyToken, addWorkExperience); // Add Work Experience

router.post('/profile/upload-resume', verifyToken, upload.single('file'), uploadResume); // Upload Resume


module.exports = router;

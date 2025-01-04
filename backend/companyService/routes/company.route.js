const express = require('express');
const multer = require('multer');
const {
    getCompany,
    createOrUpdateCompany,
    uploadLogo,
    deleteCompany,
} = require('../controllers/company.controller');
const verifyToken = require('../middlewares/auth.middleware');

const router = express.Router();
const upload = multer(); // For handling file uploads in memory

// Middleware to check if the user has a "company" role
const verifyCompanyRole = (req, res, next) => {
    if (req.user.role !== 'company') {
        return res.status(403).json({ error: 'Access denied: Only companies can perform this action' });
    }
    next();
};

// Routes
router.post('/',verifyToken, verifyCompanyRole, createOrUpdateCompany); // Create or update company
router.get('/', verifyToken, getCompany); // Get company details
router.post('/logo', verifyToken, verifyCompanyRole, upload.single('file'), uploadLogo); // Upload company logo
router.delete('/', verifyToken, verifyCompanyRole, deleteCompany); // Delete a company

module.exports = router;

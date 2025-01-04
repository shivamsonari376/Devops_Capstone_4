const express = require('express');
const { register, login } = require('../controllers/auth.controller');
const verifyToken = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/protected', verifyToken, (req, res) => {
    res.status(200).json({
        message: 'Access to protected route granted',
        user: req.user,
    });
});


module.exports = router;

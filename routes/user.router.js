const express = require('express');
const router = express.Router();
const { signUp, logIn } = require('../controllers/user.controller');
const { signupValidation, loginValidation } = require('../utils/authenticationSchema');

router.post('/signup', signupValidation, signUp)

router.post('/login', loginValidation, logIn)

module.exports = router;
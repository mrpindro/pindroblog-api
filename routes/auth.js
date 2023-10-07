const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();
const loginLimiter = require('../middleware/loginLimiter');
// const verifyJWT = require('../middleware/verifyJWT');

router.route('/')
    .post(loginLimiter, authController.login)
;

router.route('/refresh')
    .get(authController.refresh)
;

router.route('/logout')
    .post(authController.logout)
;

module.exports = router;
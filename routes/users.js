const express = require('express');
const router = express.Router();
const usersController = require('../controllers/userController');
const upload = require('../config/multer');
const verifyJWT = require('../middleware/verifyJWT');

// router.use(verifyJWT);

router.route('/')
    .get(verifyJWT, usersController.getAllUsers)
    .post(upload.single('image'), usersController.createUser)
    .delete(verifyJWT, usersController.deleteUser)
;

router.route('/:id')
    .patch(upload.single('image'), usersController.updateUser)
;


module.exports = router;
// routes/api/private/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../../../controllers/userController.js');

router.post('/sign-in', userController.signIn);

// Fetch User Details
router.get('/:userId', userController.fetchUserDetails);

// Update User Details
router.put('/', userController.updateUserDetails);

// Delete User
router.delete('/:userId', userController.deleteUser);

router.post('/new-user', userController.createUser);

router.post('/forgotPassword', userController.forgotPassword)

router.post('/confirmForgetLink', userController.confirmForgetLink)


router.post('/upgradePassword', userController.upgradePassword)

module.exports = router;

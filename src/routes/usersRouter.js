const express = require("express");
const router = express.Router();
const usersControllers = require("../controllers/users.controllers.js");
const { authToken } = require("../utils.js");

router.get('/users', usersControllers.getAllUsers);
router.post('/api/users', usersControllers.createUser);
router.post('/register', usersControllers.registerUserAndMessage);
router.post('/login', usersControllers.loginUser);
router.get('/api/sessions/user', authToken, usersControllers.getUserInfo);
router.get('/logout', usersControllers.logoutUser);
router.put('/users/:uid', usersControllers.updateUser);
router.delete('/users/:uid', usersControllers.deleteUser);

module.exports = router;
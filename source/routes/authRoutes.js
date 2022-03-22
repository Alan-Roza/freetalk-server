const { Router } = require('express');

const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const authentication = require('../middleware/authentication');

const router = Router();

router.post('/register', authController.register_post);
router.post('/login', authController.login_post);
router.post('/user', authentication.authentication, userController.get_user)
router.get('/refreshToken', authentication.authentication, authController.refresh_token);

module.exports = router;
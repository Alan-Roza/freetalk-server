const { Router } = require('express');
const authController = require('../controllers/authController');
const authentication = require('../middleware/authentication');

const router = Router();

router.post('/register', authController.register_post);
router.post('/login', authentication.authentication, authController.login_post);

module.exports = router;
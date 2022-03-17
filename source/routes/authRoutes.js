const { Router } = require('express');
const authController = require('../controllers/authController');
const authentication = require('../middleware/authentication');

const router = Router();

router.post('/register', authController.register_post);
router.post('/login', authController.login_post);
router.get('/refreshToken', authentication.authentication, async (request, response) => response.send('Usuário autenticado com sucesso.'));

module.exports = router;
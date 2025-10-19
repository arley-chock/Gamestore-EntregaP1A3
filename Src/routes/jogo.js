const express = require('express');
const router = express.Router();
const jogoController = require('../controllers/JogoController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Rotas públicas (não precisam de autenticação)
router.get('/', jogoController.index);
router.get('/:id', jogoController.show);

// Rotas protegidas (precisam de autenticação)
router.use(authMiddleware);
router.post('/', [adminMiddleware], jogoController.create);
router.put('/:id', [adminMiddleware], jogoController.update);
router.delete('/:id', [adminMiddleware], jogoController.delete);

module.exports = router;

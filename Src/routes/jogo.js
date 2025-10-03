const express = require('express');
const router = express.Router();
const jogoController = require('../controllers/JogoController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Rotas públicas (sem autenticação)
router.get('/', jogoController.index);
router.get('/:id', jogoController.show);

// Rotas protegidas (requerem autenticação)
router.post('/', [authMiddleware, adminMiddleware], jogoController.create);
router.put('/:id', [authMiddleware, adminMiddleware], jogoController.update);
router.delete('/:id', [authMiddleware, adminMiddleware], jogoController.delete);

module.exports = router;

const express = require('express');
const router = express.Router();
const avaliacaoController = require('../controllers/AvaliacaoController');
const authMiddleware = require('../middleware/authMiddleware');

// Rotas públicas (não precisam de autenticação)
router.get('/media/:jogoId', avaliacaoController.mediaAvaliacoes);

// Rotas protegidas (precisam de autenticação)
router.use(authMiddleware);
router.post('/', avaliacaoController.create);
router.put('/', avaliacaoController.update);
router.get('/', avaliacaoController.index);

module.exports = router;
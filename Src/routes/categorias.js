const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/CategoriaController');

// Rotas públicas
router.get('/', categoriaController.index);
router.get('/:id', categoriaController.show);

module.exports = router;

const express = require('express');
const router = express.Router();
const empresaController = require('../controllers/EmpresaController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Rotas públicas (não precisam de autenticação)
router.get('/', empresaController.index);
router.get('/:id', empresaController.show);

// Rotas protegidas (precisam de autenticação)
router.use(authMiddleware);
router.post('/', [adminMiddleware], empresaController.create);
router.put('/:id', [adminMiddleware], empresaController.update);
router.delete('/:id', [adminMiddleware], empresaController.delete);

module.exports = router;
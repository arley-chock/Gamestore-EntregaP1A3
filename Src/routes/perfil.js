const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const UsuarioDAO = require('../daos/UsuarioDAO');
const JogoDAO = require('../daos/JogoDAO');
const { verifyPassword, hashPassword } = require('../util/cripto');

// Todas as rotas de /perfil requerem autenticação
router.use(authMiddleware);

// Retorna os dados do usuário autenticado (sem senha)
router.get('/', async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Usuário não autenticado.' });

    const usuario = await UsuarioDAO.get(userId);
    if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado.' });

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar perfil.', error: error.message });
  }
});

// Biblioteca do usuário
router.get('/biblioteca', async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Usuário não autenticado.' });

    const jogos = await JogoDAO.findByUser(userId);
    res.json(jogos || []);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar biblioteca.', error: error.message });
  }
});

// Atualizar senha do usuário (requere senha atual)
router.post('/senha', async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Usuário não autenticado.' });

    const { senhaAtual, novaSenha } = req.body;
    if (!senhaAtual || !novaSenha) return res.status(400).json({ message: 'senhaAtual e novaSenha são obrigatórios.' });

    const usuario = await UsuarioDAO.getWithPasswd(userId);
    if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado.' });

    const match = await verifyPassword(senhaAtual, usuario.senha);
    if (!match) return res.status(400).json({ message: 'Senha atual incorreta.' });

    const hashed = await hashPassword(novaSenha);
    await UsuarioDAO.updatePassword(userId, hashed);

    res.json({ message: 'Senha atualizada com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar senha.', error: error.message });
  }
});

module.exports = router;

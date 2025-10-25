const CategoriaDAO = require('../daos/CategoriaDAO');

class CategoriaController {
  async index(req, res) {
    try {
      const categorias = await CategoriaDAO.findAll();
      res.json(categorias);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar categorias.', error: error.message });
    }
  }

  async show(req, res) {
    try {
      const id = req.params.id;
      if (!id) return res.status(400).json({ message: 'ID é obrigatório.' });
      const categoria = await CategoriaDAO.findById(id);
      if (!categoria) return res.status(404).json({ message: 'Categoria não encontrada.' });
      res.json(categoria);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar categoria.', error: error.message });
    }
  }
}

module.exports = new CategoriaController();

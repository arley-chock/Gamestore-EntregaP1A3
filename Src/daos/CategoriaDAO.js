const dbService = require('../services/DatabaseService');

class CategoriaDAO {
  async findAll() {
    const sql = 'SELECT * FROM categorias';
    const rows = await dbService.all(sql);
    return rows || [];
  }

  async findById(id) {
    const sql = 'SELECT * FROM categorias WHERE id = ?';
    const row = await dbService.get(sql, [id]);
    return row || null;
  }
}

module.exports = new CategoriaDAO();

const db = require('../config/db');
const responderErro = require('../utils/responderErro');
const {
  textoValido,
  textoOpcionalValido,
  validarIdDaRota
} = require('../utils/validacao');

function cadastrarRotasCategorias(app) {
  app.get('/categorias', async function (req, res) {
    try {
      const categorias = await db.Categoria.findAll({
        order: [['nome', 'ASC']]
      });
      return res.send(categorias);
    } catch (erro) {
      return responderErro(res, erro, 'GET /categorias');
    }
  });

  app.get('/categorias/:id', async function (req, res) {
    try {
      if (!validarIdDaRota(res, req.params.id, 'id')) {
        return;
      }

      const categoria = await db.Categoria.findByPk(Number(req.params.id));

      if (!categoria) {
        return res.status(404).send({
          erro: 'Categoria não encontrada.'
        });
      }

      return res.send(categoria);
    } catch (erro) {
      return responderErro(res, erro, 'GET /categorias/:id');
    }
  });

  app.post('/categorias', async function (req, res) {
    try {
      const corpo = req.body && typeof req.body === 'object'
        ? req.body
        : {};

      if (!textoValido(corpo.nome, 100)) {
        return res.status(400).send({
          erro: 'nome deve ser um texto de 1 a 100 caracteres.'
        });
      }
      if (!textoOpcionalValido(corpo.descricao, 1000)) {
        return res.status(400).send({
          erro: 'descricao deve ser um texto de até 1000 caracteres.'
        });
      }

      const categoria = await db.Categoria.create({
        nome: corpo.nome.trim(),
        descricao: corpo.descricao ? corpo.descricao.trim() : null
      });

      return res.send(categoria);
    } catch (erro) {
      return responderErro(res, erro, 'POST /categorias');
    }
  });

  app.post('/categorias/:id/atualizar', async function (req, res) {
    try {
      if (!validarIdDaRota(res, req.params.id, 'id')) {
        return;
      }

      const categoria = await db.Categoria.findByPk(Number(req.params.id));
      const corpo = req.body && typeof req.body === 'object'
        ? req.body
        : {};

      if (!categoria) {
        return res.status(404).send({
          erro: 'Categoria não encontrada.'
        });
      }
      if (!textoValido(corpo.nome, 100)) {
        return res.status(400).send({
          erro: 'nome deve ser um texto de 1 a 100 caracteres.'
        });
      }
      if (!textoOpcionalValido(corpo.descricao, 1000)) {
        return res.status(400).send({
          erro: 'descricao deve ser um texto de até 1000 caracteres.'
        });
      }

      categoria.nome = corpo.nome.trim();
      categoria.descricao = corpo.descricao ? corpo.descricao.trim() : null;
      await categoria.save();

      return res.send(categoria);
    } catch (erro) {
      return responderErro(res, erro, 'POST /categorias/:id/atualizar');
    }
  });

  app.post('/categorias/:id/excluir', async function (req, res) {
    try {
      if (!validarIdDaRota(res, req.params.id, 'id')) {
        return;
      }

      const categoria = await db.Categoria.findByPk(Number(req.params.id));

      if (!categoria) {
        return res.status(404).send({
          erro: 'Categoria não encontrada.'
        });
      }

      const jogos = await db.Jogo.findAll({
        where: {
          categoriaId: categoria.id
        }
      });

      if (jogos.length > 0) {
        return res.status(400).send({
          erro: 'Exclua ou altere os jogos desta categoria antes.'
        });
      }

      await categoria.destroy();
      return res.send({
        mensagem: 'Categoria excluída.'
      });
    } catch (erro) {
      return responderErro(res, erro, 'POST /categorias/:id/excluir');
    }
  });
}

module.exports = cadastrarRotasCategorias;

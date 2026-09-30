const { Op } = require('sequelize');

const db = require('../config/db');
const AvaliacoesJogo = require('../models/avaliacoesJogo');
const JogoRetro = require('../classes/JogoRetro');
const responderErro = require('../utils/responderErro');
const {
  numeroInteiroPositivo,
  validarIdDaRota
} = require('../utils/validacao');

function cadastrarRotasJogos(app) {
  app.get('/jogos', async function (req, res) {
    try {
      const where = {};
      const pagina = numeroInteiroPositivo(req.query.pagina)
        ? Number(req.query.pagina)
        : 1;
      const limite = numeroInteiroPositivo(req.query.limite)
        ? Number(req.query.limite)
        : 10;
      const ordenarPor = req.query.ordenarPor === 'preco'
        ? 'preco'
        : 'titulo';
      const ordem = req.query.ordem === 'DESC' ? 'DESC' : 'ASC';

      if (req.query.titulo) {
        where.titulo = {
          [Op.like]: '%' + req.query.titulo + '%'
        };
      }
      if (req.query.categoriaId !== undefined) {
        if (!numeroInteiroPositivo(req.query.categoriaId)) {
          return res.status(400).send({
            erro: 'categoriaId deve ser um inteiro positivo.'
          });
        }
        where.categoriaId = Number(req.query.categoriaId);
      }

      const jogos = await db.Jogo.findAll({
        where: where,
        offset: (pagina - 1) * limite,
        limit: limite,
        order: [[ordenarPor, ordem]]
      });

      return res.send(jogos);
    } catch (erro) {
      return responderErro(res, erro, 'GET /jogos');
    }
  });

  app.get('/jogos/:id/detalhes', async function (req, res) {
    try {
      if (!validarIdDaRota(res, req.params.id, 'id')) {
        return;
      }

      const jogoId = Number(req.params.id);
      const jogo = await db.Jogo.findByPk(jogoId);

      if (!jogo) {
        return res.status(404).send({
          erro: 'Jogo não encontrado.'
        });
      }

      const categoria = await db.Categoria.findByPk(jogo.categoriaId);
      const desenvolvedora = await db.Desenvolvedora.findByPk(
        jogo.desenvolvedoraId
      );
      const avaliacoes = await AvaliacoesJogo.find({
        jogoId: jogoId
      });

      return res.send({
        jogo: jogo,
        categoria: categoria,
        desenvolvedora: desenvolvedora,
        avaliacoes: avaliacoes
      });
    } catch (erro) {
      return responderErro(res, erro, 'GET /jogos/:id/detalhes');
    }
  });

  app.get('/jogos/:id', async function (req, res) {
    try {
      if (!validarIdDaRota(res, req.params.id, 'id')) {
        return;
      }

      const jogo = await db.Jogo.findByPk(Number(req.params.id));

      if (!jogo) {
        return res.status(404).send({
          erro: 'Jogo não encontrado.'
        });
      }

      return res.send(jogo);
    } catch (erro) {
      return responderErro(res, erro, 'GET /jogos/:id');
    }
  });

  app.post('/jogos', async function (req, res) {
    try {
      const dadosJogo = new JogoRetro(req.body);
      const camposInvalidos = dadosJogo.validar();

      if (camposInvalidos.length > 0) {
        return res.status(400).send({
          erro: 'Há campos obrigatórios ausentes ou inválidos.',
          campos: camposInvalidos
        });
      }

      const categoria = await db.Categoria.findByPk(
        Number(req.body.categoriaId)
      );
      const desenvolvedora = await db.Desenvolvedora.findByPk(
        Number(req.body.desenvolvedoraId)
      );

      if (!categoria || !desenvolvedora) {
        return res.status(400).send({
          erro: 'categoriaId e desenvolvedoraId devem existir.'
        });
      }

      const jogo = await db.Jogo.create(dadosJogo.paraObjeto());
      return res.send(jogo);
    } catch (erro) {
      return responderErro(res, erro, 'POST /jogos');
    }
  });

  app.post('/jogos/:id/atualizar', async function (req, res) {
    try {
      if (!validarIdDaRota(res, req.params.id, 'id')) {
        return;
      }

      const jogo = await db.Jogo.findByPk(Number(req.params.id));

      if (!jogo) {
        return res.status(404).send({
          erro: 'Jogo não encontrado.'
        });
      }

      const dadosJogo = new JogoRetro(req.body);
      const camposInvalidos = dadosJogo.validar();

      if (camposInvalidos.length > 0) {
        return res.status(400).send({
          erro: 'Há campos obrigatórios ausentes ou inválidos.',
          campos: camposInvalidos
        });
      }

      const categoria = await db.Categoria.findByPk(
        Number(req.body.categoriaId)
      );
      const desenvolvedora = await db.Desenvolvedora.findByPk(
        Number(req.body.desenvolvedoraId)
      );

      if (!categoria || !desenvolvedora) {
        return res.status(400).send({
          erro: 'categoriaId e desenvolvedoraId devem existir.'
        });
      }

      const valores = dadosJogo.paraObjeto();
      jogo.titulo = valores.titulo;
      jogo.descricao = valores.descricao;
      jogo.preco = valores.preco;
      jogo.anoLancamento = valores.anoLancamento;
      jogo.plataforma = valores.plataforma;
      jogo.estoque = valores.estoque;
      jogo.categoriaId = valores.categoriaId;
      jogo.desenvolvedoraId = valores.desenvolvedoraId;
      await jogo.save();

      return res.send(jogo);
    } catch (erro) {
      return responderErro(res, erro, 'POST /jogos/:id/atualizar');
    }
  });

  app.post('/jogos/:id/excluir', async function (req, res) {
    try {
      if (!validarIdDaRota(res, req.params.id, 'id')) {
        return;
      }

      const jogoId = Number(req.params.id);
      const jogo = await db.Jogo.findByPk(jogoId);

      if (!jogo) {
        return res.status(404).send({
          erro: 'Jogo não encontrado.'
        });
      }

      const avaliacoes = await AvaliacoesJogo.find({
        jogoId: jogoId
      });

      if (avaliacoes.length > 0) {
        return res.status(400).send({
          erro: 'Exclua as avaliações deste jogo antes.'
        });
      }

      await jogo.destroy();
      return res.send({
        mensagem: 'Jogo excluído.'
      });
    } catch (erro) {
      return responderErro(res, erro, 'POST /jogos/:id/excluir');
    }
  });
}

module.exports = cadastrarRotasJogos;

const db = require('../config/db');
const AvaliacoesJogo = require('../models/avaliacoesJogo');
const responderErro = require('../utils/responderErro');
const {
  numeroInteiroPositivo,
  validarIdDaRota,
  validarAvaliacoes
} = require('../utils/validacao');

function cadastrarRotasAvaliacoes(app) {
  app.get('/avaliacoes', async function (req, res) {
    try {
      const filtro = {};

      if (req.query.jogoId !== undefined) {
        if (!numeroInteiroPositivo(req.query.jogoId)) {
          return res.status(400).send({
            erro: 'jogoId deve ser um inteiro positivo.'
          });
        }
        filtro.jogoId = Number(req.query.jogoId);
      }

      const documentos = await AvaliacoesJogo.find(filtro);
      return res.send(documentos);
    } catch (erro) {
      return responderErro(res, erro, 'GET /avaliacoes');
    }
  });

  app.get('/avaliacoes/:jogoId', async function (req, res) {
    try {
      if (!validarIdDaRota(res, req.params.jogoId, 'jogoId')) {
        return;
      }

      const documentos = await AvaliacoesJogo.find({
        jogoId: Number(req.params.jogoId)
      });

      if (documentos.length === 0) {
        return res.status(404).send({
          erro: 'Avaliações não encontradas para este jogo.'
        });
      }

      return res.send(documentos);
    } catch (erro) {
      return responderErro(res, erro, 'GET /avaliacoes/:jogoId');
    }
  });

  app.post('/avaliacoes', async function (req, res) {
    try {
      const corpo = req.body && typeof req.body === 'object'
        ? req.body
        : {};
      const jogoId = Number(corpo.jogoId);
      const erros = validarAvaliacoes(jogoId, corpo.avaliacoes);

      if (erros.length > 0) {
        return res.status(400).send({
          erro: 'Há campos obrigatórios ausentes ou inválidos.',
          campos: erros
        });
      }

      const jogo = await db.Jogo.findByPk(jogoId);

      if (!jogo) {
        return res.status(400).send({
          erro: 'O jogoId informado não existe no PostgreSQL.'
        });
      }

      const existentes = await AvaliacoesJogo.find({
        jogoId: jogoId
      });

      if (existentes.length > 0) {
        return res.status(400).send({
          erro: 'Já existe um documento de avaliações para este jogo.'
        });
      }

      const documento = new AvaliacoesJogo({
        jogoId: jogoId,
        avaliacoes: corpo.avaliacoes
      });
      await documento.save();

      return res.send(documento);
    } catch (erro) {
      return responderErro(res, erro, 'POST /avaliacoes');
    }
  });

  app.post('/avaliacoes/:jogoId/atualizar', async function (req, res) {
    try {
      if (!validarIdDaRota(res, req.params.jogoId, 'jogoId')) {
        return;
      }

      const jogoId = Number(req.params.jogoId);
      const corpo = req.body && typeof req.body === 'object'
        ? req.body
        : {};
      const erros = validarAvaliacoes(jogoId, corpo.avaliacoes);

      if (erros.length > 0) {
        return res.status(400).send({
          erro: 'Há campos obrigatórios ausentes ou inválidos.',
          campos: erros
        });
      }

      const jogo = await db.Jogo.findByPk(jogoId);

      if (!jogo) {
        return res.status(400).send({
          erro: 'O jogoId informado não existe no PostgreSQL.'
        });
      }

      const documento = await AvaliacoesJogo.findOneAndUpdate(
        {
          jogoId: jogoId
        },
        {
          jogoId: jogoId,
          avaliacoes: corpo.avaliacoes
        },
        {
          runValidators: true
        }
      );

      if (!documento) {
        return res.status(404).send({
          erro: 'Documento de avaliações não encontrado.'
        });
      }

      const atualizado = await AvaliacoesJogo.find({
        jogoId: jogoId
      });
      return res.send(atualizado);
    } catch (erro) {
      return responderErro(
        res,
        erro,
        'POST /avaliacoes/:jogoId/atualizar'
      );
    }
  });

  app.post('/avaliacoes/:jogoId/excluir', async function (req, res) {
    try {
      if (!validarIdDaRota(res, req.params.jogoId, 'jogoId')) {
        return;
      }

      const documento = await AvaliacoesJogo.findOneAndDelete({
        jogoId: Number(req.params.jogoId)
      });

      if (!documento) {
        return res.status(404).send({
          erro: 'Documento de avaliações não encontrado.'
        });
      }

      return res.send({
        mensagem: 'Documento de avaliações excluído.'
      });
    } catch (erro) {
      return responderErro(
        res,
        erro,
        'POST /avaliacoes/:jogoId/excluir'
      );
    }
  });
}

module.exports = cadastrarRotasAvaliacoes;

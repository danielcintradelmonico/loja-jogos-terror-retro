const db = require('../config/db');
const responderErro = require('../utils/responderErro');
const {
  textoValido,
  textoComLetraValido,
  anoFundacaoValido,
  validarIdDaRota
} = require('../utils/validacao');

function cadastrarRotasDesenvolvedoras(app) {
  app.get('/desenvolvedoras', async function (req, res) {
    try {
      const desenvolvedoras = await db.Desenvolvedora.findAll({
        order: [['nome', 'ASC']]
      });
      return res.send(desenvolvedoras);
    } catch (erro) {
      return responderErro(res, erro, 'GET /desenvolvedoras');
    }
  });

  app.get('/desenvolvedoras/:id', async function (req, res) {
    try {
      if (!validarIdDaRota(res, req.params.id, 'id')) {
        return;
      }

      const desenvolvedora = await db.Desenvolvedora.findByPk(
        Number(req.params.id)
      );

      if (!desenvolvedora) {
        return res.status(404).send({
          erro: 'Desenvolvedora não encontrada.'
        });
      }

      return res.send(desenvolvedora);
    } catch (erro) {
      return responderErro(res, erro, 'GET /desenvolvedoras/:id');
    }
  });

  app.post('/desenvolvedoras', async function (req, res) {
    try {
      const corpo = req.body && typeof req.body === 'object'
        ? req.body
        : {};
      const anoInformado = corpo.anoFundacao !== undefined &&
        corpo.anoFundacao !== null &&
        String(corpo.anoFundacao).trim() !== '';

      if (!textoValido(corpo.nome, 150) ||
          !textoComLetraValido(corpo.pais, 100)) {
        return res.status(400).send({
          erro: 'nome e pais devem ser textos válidos.'
        });
      }
      if (anoInformado && !anoFundacaoValido(corpo.anoFundacao)) {
        return res.status(400).send({
          erro: 'anoFundacao deve estar entre 1950 e o ano atual.'
        });
      }

      const desenvolvedora = await db.Desenvolvedora.create({
        nome: corpo.nome.trim(),
        pais: corpo.pais.trim(),
        anoFundacao: anoInformado
          ? Number(corpo.anoFundacao)
          : null
      });

      return res.send(desenvolvedora);
    } catch (erro) {
      return responderErro(res, erro, 'POST /desenvolvedoras');
    }
  });

  app.post('/desenvolvedoras/:id/atualizar', async function (req, res) {
    try {
      if (!validarIdDaRota(res, req.params.id, 'id')) {
        return;
      }

      const desenvolvedora = await db.Desenvolvedora.findByPk(
        Number(req.params.id)
      );
      const corpo = req.body && typeof req.body === 'object'
        ? req.body
        : {};
      const anoInformado = corpo.anoFundacao !== undefined &&
        corpo.anoFundacao !== null &&
        String(corpo.anoFundacao).trim() !== '';

      if (!desenvolvedora) {
        return res.status(404).send({
          erro: 'Desenvolvedora não encontrada.'
        });
      }
      if (!textoValido(corpo.nome, 150) ||
          !textoComLetraValido(corpo.pais, 100)) {
        return res.status(400).send({
          erro: 'nome e pais devem ser textos válidos.'
        });
      }
      if (anoInformado && !anoFundacaoValido(corpo.anoFundacao)) {
        return res.status(400).send({
          erro: 'anoFundacao deve estar entre 1950 e o ano atual.'
        });
      }

      desenvolvedora.nome = corpo.nome.trim();
      desenvolvedora.pais = corpo.pais.trim();
      desenvolvedora.anoFundacao = anoInformado
        ? Number(corpo.anoFundacao)
        : null;
      await desenvolvedora.save();

      return res.send(desenvolvedora);
    } catch (erro) {
      return responderErro(
        res,
        erro,
        'POST /desenvolvedoras/:id/atualizar'
      );
    }
  });

  app.post('/desenvolvedoras/:id/excluir', async function (req, res) {
    try {
      if (!validarIdDaRota(res, req.params.id, 'id')) {
        return;
      }

      const desenvolvedora = await db.Desenvolvedora.findByPk(
        Number(req.params.id)
      );

      if (!desenvolvedora) {
        return res.status(404).send({
          erro: 'Desenvolvedora não encontrada.'
        });
      }

      const jogos = await db.Jogo.findAll({
        where: {
          desenvolvedoraId: desenvolvedora.id
        }
      });

      if (jogos.length > 0) {
        return res.status(400).send({
          erro: 'Exclua ou altere os jogos desta desenvolvedora antes.'
        });
      }

      await desenvolvedora.destroy();
      return res.send({
        mensagem: 'Desenvolvedora excluída.'
      });
    } catch (erro) {
      return responderErro(
        res,
        erro,
        'POST /desenvolvedoras/:id/excluir'
      );
    }
  });
}

module.exports = cadastrarRotasDesenvolvedoras;

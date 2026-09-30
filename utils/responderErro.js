const registrarErro = require('./log');

function responderErro(res, erro, contexto) {
  registrarErro(erro, contexto);
  return res.status(500).send({
    erro: 'Ocorreu um erro interno. Consulte logs/errors.log.'
  });
}

module.exports = responderErro;

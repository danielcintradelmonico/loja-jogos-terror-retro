const fs = require('fs');
const path = require('path');

function registrarErro(erro, contexto) {
  const caminho = path.join(__dirname, '..', 'logs', 'errors.log');
  const data = new Date().toISOString();
  const detalhes = erro.stack || erro.message || String(erro);
  const linha = '[' + data + '] ' + contexto + '\n' + detalhes + '\n\n';

  fs.appendFile(caminho, linha, function (erroDoLog) {
    if (erroDoLog) {
      console.log('Não foi possível gravar o arquivo de log.');
    }
  });
}

module.exports = registrarErro;

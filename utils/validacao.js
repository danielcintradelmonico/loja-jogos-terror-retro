function numeroInteiroPositivo(valor) {
  if (valor === undefined || valor === null || String(valor).trim() === '') {
    return false;
  }

  return Number.isInteger(Number(valor)) && Number(valor) > 0;
}

function textoValido(valor, tamanhoMaximo) {
  if (typeof valor !== 'string') {
    return false;
  }

  const texto = valor.trim();
  return texto.length > 0 && texto.length <= tamanhoMaximo;
}

function textoComLetraValido(valor, tamanhoMaximo) {
  return textoValido(valor, tamanhoMaximo) && /[A-Za-zÀ-ÿ]/.test(valor);
}

function textoOpcionalValido(valor, tamanhoMaximo) {
  if (valor === undefined || valor === null || valor === '') {
    return true;
  }

  return typeof valor === 'string' && valor.trim().length <= tamanhoMaximo;
}

function numeroNoIntervalo(valor, minimo, maximo) {
  if (valor === undefined || valor === null || String(valor).trim() === '') {
    return false;
  }

  const numero = Number(valor);
  return Number.isFinite(numero) && numero >= minimo && numero <= maximo;
}

function inteiroNoIntervalo(valor, minimo, maximo) {
  return numeroNoIntervalo(valor, minimo, maximo) &&
    Number.isInteger(Number(valor));
}

function anoFundacaoValido(valor) {
  return inteiroNoIntervalo(valor, 1950, new Date().getFullYear());
}

function anoLancamentoValido(valor) {
  return inteiroNoIntervalo(
    valor,
    1970,
    new Date().getFullYear() + 1
  );
}

function validarIdDaRota(res, valor, nomeDoCampo) {
  if (!numeroInteiroPositivo(valor)) {
    res.status(400).send({
      erro: 'O campo ' + nomeDoCampo + ' deve ser um inteiro positivo.'
    });
    return false;
  }

  return true;
}

function validarAvaliacoes(jogoId, avaliacoes) {
  const erros = [];

  if (!numeroInteiroPositivo(jogoId)) {
    erros.push('jogoId');
  }

  if (!Array.isArray(avaliacoes) || avaliacoes.length === 0) {
    erros.push('avaliacoes');
    return erros;
  }

  for (let i = 0; i < avaliacoes.length; i++) {
    const item = avaliacoes[i];

    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      erros.push('avaliacoes[' + i + ']');
      continue;
    }

    if (!textoValido(item.usuario, 100)) {
      erros.push('avaliacoes[' + i + '].usuario');
    }
    if (!Number.isInteger(Number(item.nota)) ||
        Number(item.nota) < 1 || Number(item.nota) > 5) {
      erros.push('avaliacoes[' + i + '].nota');
    }
    if (!textoValido(item.comentario, 1000)) {
      erros.push('avaliacoes[' + i + '].comentario');
    }
  }

  return erros;
}

module.exports = {
  numeroInteiroPositivo: numeroInteiroPositivo,
  textoValido: textoValido,
  textoComLetraValido: textoComLetraValido,
  textoOpcionalValido: textoOpcionalValido,
  numeroNoIntervalo: numeroNoIntervalo,
  inteiroNoIntervalo: inteiroNoIntervalo,
  anoFundacaoValido: anoFundacaoValido,
  anoLancamentoValido: anoLancamentoValido,
  validarIdDaRota: validarIdDaRota,
  validarAvaliacoes: validarAvaliacoes
};

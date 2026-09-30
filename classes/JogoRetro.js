const {
  textoValido,
  textoComLetraValido,
  numeroNoIntervalo,
  inteiroNoIntervalo,
  numeroInteiroPositivo,
  anoLancamentoValido
} = require('../utils/validacao');

class JogoRetro {
  constructor(dados) {
    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
      dados = {};
    }

    this.titulo = dados.titulo;
    this.descricao = dados.descricao;
    this.preco = dados.preco;
    this.anoLancamento = dados.anoLancamento;
    this.plataforma = dados.plataforma;
    this.estoque = dados.estoque;
    this.categoriaId = dados.categoriaId;
    this.desenvolvedoraId = dados.desenvolvedoraId;
  }

  validar() {
    const erros = [];

    if (!textoValido(this.titulo, 150)) {
      erros.push('titulo');
    }
    if (!textoValido(this.descricao, 2000)) {
      erros.push('descricao');
    }
    if (!numeroNoIntervalo(this.preco, 0, 10000)) {
      erros.push('preco');
    }
    if (!anoLancamentoValido(this.anoLancamento)) {
      erros.push('anoLancamento');
    }
    if (!textoComLetraValido(this.plataforma, 100)) {
      erros.push('plataforma');
    }
    if (!inteiroNoIntervalo(this.estoque, 0, 1000000)) {
      erros.push('estoque');
    }
    if (!numeroInteiroPositivo(this.categoriaId)) {
      erros.push('categoriaId');
    }
    if (!numeroInteiroPositivo(this.desenvolvedoraId)) {
      erros.push('desenvolvedoraId');
    }

    return erros;
  }

  paraObjeto() {
    return {
      titulo: String(this.titulo).trim(),
      descricao: String(this.descricao).trim(),
      preco: Number(this.preco),
      anoLancamento: Number(this.anoLancamento),
      plataforma: String(this.plataforma).trim(),
      estoque: Number(this.estoque),
      categoriaId: Number(this.categoriaId),
      desenvolvedoraId: Number(this.desenvolvedoraId)
    };
  }
}

module.exports = JogoRetro;

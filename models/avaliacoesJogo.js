const mongoose = require('mongoose');

const avaliacao = mongoose.Schema({
  usuario: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  nota: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comentario: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  }
});

const avaliacoesJogo = mongoose.Schema({
  jogoId: {
    type: Number,
    required: true,
    min: 1
  },
  avaliacoes: {
    type: [avaliacao],
    required: true,
    validate: {
      validator: function (itens) {
        return Array.isArray(itens) && itens.length > 0;
      },
      message: 'Deve existir pelo menos uma avaliação.'
    }
  }
});

module.exports = mongoose.model('AvaliacoesJogo', avaliacoesJogo);

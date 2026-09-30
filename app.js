const express = require('express');
const mongoose = require('mongoose');

const db = require('./config/db');
const dbMongoose = require('./config/db_mongoose');
const registrarErro = require('./utils/log');
const cadastrarRotasCategorias = require('./rotas/categorias');
const cadastrarRotasDesenvolvedoras = require('./rotas/desenvolvedoras');
const cadastrarRotasJogos = require('./rotas/jogos');
const cadastrarRotasAvaliacoes = require('./rotas/avaliacoes');

const app = express();
const porta = 8081;

app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());

app.get('/', function (req, res) {
  res.send({
    projeto: 'Loja de Jogos de Terror Retrô',
    bancos: [
      'PostgreSQL com Sequelize',
      'MongoDB com Mongoose'
    ],
    rotasPrincipais: [
      '/categorias',
      '/desenvolvedoras',
      '/jogos',
      '/avaliacoes',
      '/painel'
    ]
  });
});

cadastrarRotasCategorias(app);
cadastrarRotasDesenvolvedoras(app);
cadastrarRotasJogos(app);
cadastrarRotasAvaliacoes(app);

app.get('/painel', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/estilo.css', function (req, res) {
  res.sendFile(__dirname + '/public/estilo.css');
});

db.sequelize.sync()
  .then(function () {
    return mongoose.connect(dbMongoose.connection);
  })
  .then(function () {
    app.listen(porta, function () {
      console.log('Servidor em http://localhost:' + porta);
      console.log('PostgreSQL e MongoDB conectados.');
    });
  })
  .catch(function (erro) {
    registrarErro(erro, 'Inicialização da aplicação');
    console.log('Erro ao conectar aos bancos. Consulte logs/errors.log.');
  });

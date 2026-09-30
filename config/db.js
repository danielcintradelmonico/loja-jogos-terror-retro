const Sequelize = require('sequelize');

const sequelize = new Sequelize(
  'loja_terror_retro',
  'postgres',
  '1234',
  {
    host: 'localhost',
    dialect: 'postgres'
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Categoria = require('../models/categoria')(sequelize, Sequelize);
db.Desenvolvedora = require('../models/desenvolvedora')(sequelize, Sequelize);
db.Jogo = require('../models/jogo')(sequelize, Sequelize);

db.Categoria.hasMany(db.Jogo, {
  foreignKey: 'categoriaId'
});
db.Jogo.belongsTo(db.Categoria, {
  foreignKey: 'categoriaId'
});

db.Desenvolvedora.hasMany(db.Jogo, {
  foreignKey: 'desenvolvedoraId'
});
db.Jogo.belongsTo(db.Desenvolvedora, {
  foreignKey: 'desenvolvedoraId'
});

module.exports = db;

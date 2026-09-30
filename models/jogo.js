module.exports = (sequelize, Sequelize) => {
  const Jogo = sequelize.define('jogo', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    titulo: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 150]
      }
    },
    descricao: {
      type: Sequelize.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 2000]
      }
    },
    preco: {
      type: Sequelize.DOUBLE,
      allowNull: false,
      validate: {
        min: 0,
        max: 10000
      }
    },
    anoLancamento: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: 1970,
        max: new Date().getFullYear() + 1
      }
    },
    plataforma: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100]
      }
    },
    estoque: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: 0,
        max: 1000000
      }
    },
    categoriaId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: 1
      }
    },
    desenvolvedoraId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: 1
      }
    }
  });

  return Jogo;
};

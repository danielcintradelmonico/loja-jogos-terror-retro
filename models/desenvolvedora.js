module.exports = (sequelize, Sequelize) => {
  const Desenvolvedora = sequelize.define('desenvolvedora', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    nome: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 150]
      }
    },
    pais: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100]
      }
    },
    anoFundacao: {
      type: Sequelize.INTEGER,
      validate: {
        isInt: true,
        min: 1950,
        max: new Date().getFullYear()
      }
    }
  });

  return Desenvolvedora;
};

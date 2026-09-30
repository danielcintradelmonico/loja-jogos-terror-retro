module.exports = (sequelize, Sequelize) => {
  const Categoria = sequelize.define('categoria', {
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
        len: [1, 100]
      }
    },
    descricao: {
      type: Sequelize.TEXT
    }
  });

  return Categoria;
};

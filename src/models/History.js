module.exports = (sequelize, DataTypes) => {
  const History = sequelize.define("History", {
    ulasan: DataTypes.STRING,
    sentiment: DataTypes.STRING,
  });
  return History;
};

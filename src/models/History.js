module.exports = (sequelize, DataTypes) => {
  const History = sequelize.define("History", {
    ulasan: DataTypes.TEXT,
    sentiment: DataTypes.STRING,
  });
  return History;
};

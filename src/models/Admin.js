module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define("Admin", {
    unique_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.STRING,
  });
  return Admin;
};

import sequelize from '../config/database.js';

const { models } = sequelize;

/* =====================
   Roles & Users
===================== */
models.Role.hasMany(models.User, {
  foreignKey: 'role_id',

});

models.User.belongsTo(models.Role, {
  foreignKey: 'role_id',

});

/* =====================
   Refresh Tokens
===================== */
models.User.hasMany(models.RefreshToken, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
  as: 'refreshTokens',
});

models.RefreshToken.belongsTo(models.User, {
  foreignKey: 'user_id',
  as: 'user',
});

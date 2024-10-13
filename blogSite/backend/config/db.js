const { Sequelize } = require('sequelize');

// PostgreSQL connection
const sequelize = new Sequelize('doctorAuth', 'postgres', 'irfan', {
  host: 'localhost',
  dialect: 'postgres',
});

module.exports = sequelize;

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './testeShopper.sqlite'
});

const Measure = sequelize.define('Measure', {
  customer_code: {
    type: DataTypes.STRING,
    allowNull: false
  },
  measure_uuid: {
    type: DataTypes.STRING,
    allowNull: false
  },
  datetime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  has_confirmed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  measure_value: {
    type: DataTypes.DOUBLE,
    allowNull: true
  }
}, {
  tableName: 'measures',
  timestamps: false
});

module.exports = Measure;
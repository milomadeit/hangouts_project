'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Group.init({
    organizerId: {
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 60],
      }
    },
    about: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [50, 250],
      }
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        validType(value) {
          if (value !== 'Online' || value !== 'In person') {
            throw new Error("Type must be 'Online' or 'In person")
          }
        }
      }
    },
    private: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'Group',
  });
  return Group;
};

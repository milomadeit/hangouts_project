'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Event.belongsToMany(models.User, {
        through: models.Attendance
      });

      Event.hasMany(models.Image, {
        foreignKey: 'imageableId',
        constraints: false,
        scope: {
          imageableType: 'EventImages'
        }
      });
      Event.belongsTo(models.Group, {
        foreignKey: 'groupId'
      })
    }
  }
  Event.init({
    groupId: {
      type: DataTypes.INTEGER
    },
    venueId: {
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.STRING
    },
    type: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.STRING
    },
    capacity: {
      type: DataTypes.INTEGER
    },
    price: {
      type: DataTypes.DECIMAL
    },
    startDate: {
      type: DataTypes.DATE
    },
    endDate: {
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'Event',
  });
  return Event;
};

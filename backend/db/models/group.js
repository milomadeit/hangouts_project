'use strict';
const {Model} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Group.belongsTo(models.User, {
        foreignKey: 'organizerId',
        as: 'Organizer',
      })

      Group.hasMany(models.Member, {
        foreignKey: 'groupId',
      })

      Group.hasMany(models.Venue, {
        foreignKey: 'groupId',
      })

      Group.hasMany(models.Event, {
        foreignKey: 'groupId',
        onDelete: 'CASCADE'
      })

      Group.hasMany(models.Image, {
        foreignKey: 'imageableId',
        as: 'GroupImages',
        constraints: false,
        scope: {
          imageableType: 'GroupImages',
        }
      });

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
        len: [10, 250],
      }
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        validType(value) {
          if (value !== 'Online' && value !== 'In person') {
            throw new Error("Type must be 'Online' or 'In person'")
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
    },
    numMembers: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    previewImage: {
      type: DataTypes.STRING,
    }
  }, {
    sequelize,
    modelName: 'Group',
  });
  return Group;
};

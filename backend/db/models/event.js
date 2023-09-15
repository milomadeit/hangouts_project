'use strict';
const {
  Model
} = require('sequelize');

const {Attendance} = require('./attendance')

module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    // static async getAttendees(eventId) {
    //   const attendees = await Attendance.findAll({
    //     where: {
    //       eventId: eventId,
    //     },
    //     include: [
    //       {
    //         model: User, // Include user details
    //         attributes: ['id', 'username', 'email'],
    //       },
    //     ],
    //   });
    // }

    // async updateNumAttending() {
    //   const numAttending = this.countAttendances();
    //   this.numAttending = numAttending;
    //   await this.save();
    // }

    static associate(models) {
      // define association here
      Event.belongsToMany(models.User, {
        through: models.Attendance,
        foreignKey: 'eventId',
        otherKey: 'userId'
      });

      Event.hasMany(models.Image, {
        foreignKey: 'imageableId',
        as: 'EventImages',
        constraints: false,
        scope: {
          imageableType: 'EventImages'
        }
      });
      Event.belongsTo(models.Group, {
        foreignKey: 'groupId',
        onDelete: 'CASCADE'
      })
      Event.belongsTo(models.Venue, {
        foreignKey: 'venueId'
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
    numAttending: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    previewImage: {
      type: DataTypes.STRING,
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

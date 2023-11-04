'use strict';

const { Event } = require('./backend/db/models');

// /** @type {import('sequelize-cli').Migration} */
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}


const eventData = [
  {
    id: 1,
    groupId: 1,
    venueId: 1,
    name: "Tennis Group First Meet and Greet",
    type: "Online",
    capacity: 10,
    price: 18.50,
    description: "The first meet and greet for our group! Come say hello!",
    startDate: "2023-11-19 20:00:00",
    endDate: "2023-11-19 22:00:00"
  },
  {
    id: 2,
    groupId: 2,
    venueId: 2,
    name: "Beach Yoga and Meditation",
    type: "In person",
    capacity: 15,
    price: 20.00,
    description: "Join us for a rejuvenating yoga and meditation session by the beach.",
    startDate: "2024-05-15 07:30:00",
    endDate: "2024-05-15 09:30:00"
  },
  {
    id: 3,
    groupId: 1,
    venueId: 3,
    name: "Outdoor Movie Night Under the Stars",
    type: "In person",
    capacity: 50,
    price: 0.00,
    description: "Watch a classic movie under the open sky with your friends and family.",
    startDate: "2024-07-08 19:00:00",
    endDate: "2024-07-08 22:00:00"
  }
]


module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
   await Event.bulkCreate(eventData, { validate: true });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    options.tableName = 'Events';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      venueId: { [Op.in]: [1, 2, 3] }
    }, {});
  }
};

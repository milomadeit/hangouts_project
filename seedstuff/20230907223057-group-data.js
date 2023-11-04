"use strict";

const { Group } = require("../backend/db/models");

// /** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

const groupData = [
  {
    organizerId: 1,
    name: "Dog People Group",
    about: "A group for people who love dogs",
    type: "In person",
    private: false,
    city: "Decatur",
    state: "GA",
  },
  {
    organizerId: 2,
    name: "Cat People Group",
    about: "A group for people who love cats",
    type: "In person",
    private: false,
    city: "Atlanta",
    state: "GA",
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */

    await Group.bulkCreate(groupData, { validate: true });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

    options.tableName = "Groups";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      options,
      {
        name: { [Op.in]: ["Dog People Group", "Cat People Group"] },
      },
      {}
    );
  },
};

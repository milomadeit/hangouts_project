"use strict";

const { Group } = require("../models");

// /** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

const groupData = [
  {
    organizerId: 1,
    name: "Pixel_Squad",
    about: "Lorem ipsum dolor sit amet, consectetuer adipiscin",
    type: "Online",
    private: false,
    city: "Meta",
    state: "VERSE",
    previewImage:
      "https://i.pinimg.com/originals/d7/06/42/d70642e3c1fb33fd56772e5cdf3ae944.png",
  },
  {
    organizerId: 1,
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

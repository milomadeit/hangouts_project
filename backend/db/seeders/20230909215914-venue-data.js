'use strict';

/** @type {import('sequelize-cli').Migration} */


const venueData = [
  {
    address: "123 Disney Lane",
    groupId: 1,
    city: "New York",
    state: "NY",
    lat: 37.7645358,
    lng: -122.4730327
  },
  {
    address: "456 Oceanfront Avenue",
    groupId: 2,
    city: "Los Angeles",
    state: "CA",
    lat: 34.052235,
    lng: -118.243683
  },
  {
    address: "789 Parkside Drive",
    groupId: 3,
    city: "Chicago",
    state: "IL",
    lat: 41.878113,
    lng: -87.629799
  }
];

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
   await queryInterface.bulk
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};

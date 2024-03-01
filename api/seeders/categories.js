'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('categories', [
      {
        category: ['Apartments'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category: ['Bungalow'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category: ['Houses'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category: ['Simplex'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category: ['Duplex'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category: ['Penthouse'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category: ['Villa'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};

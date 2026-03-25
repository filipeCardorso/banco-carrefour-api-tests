const { faker } = require('@faker-js/faker');

const UserFactory = {
  build(overrides = {}) {
    return {
      nome: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      administrador: 'true',
      ...overrides,
    };
  },
};

module.exports = UserFactory;

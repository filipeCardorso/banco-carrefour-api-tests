const supertest = require('supertest');
const { BASE_URL } = require('../config/environment');

const request = supertest(BASE_URL);

module.exports = request;

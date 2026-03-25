const request = require('../utils/request');

async function login(email, password) {
  return request.post('/login').send({ email, password });
}

async function getToken(email, password) {
  const response = await login(email, password);
  return response.body.authorization;
}

module.exports = { login, getToken };

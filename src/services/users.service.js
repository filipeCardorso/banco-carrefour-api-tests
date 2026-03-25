const request = require('../utils/request');

function create(payload) {
  return request.post('/usuarios').send(payload);
}

function getAll(queryParams = {}) {
  return request.get('/usuarios').query(queryParams);
}

function getById(id) {
  return request.get(`/usuarios/${id}`);
}

function update(id, payload) {
  return request.put(`/usuarios/${id}`).send(payload);
}

function remove(id) {
  return request.delete(`/usuarios/${id}`);
}

module.exports = { create, getAll, getById, update, remove };

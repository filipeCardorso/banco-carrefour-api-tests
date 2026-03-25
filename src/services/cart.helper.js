const request = require('../utils/request');
const { getToken } = require('./auth.service');
const { create: createUser } = require('./users.service');
const { faker } = require('@faker-js/faker');

async function createCartForUser() {
  // 1. Create admin user
  const email = faker.internet.email();
  const password = 'teste123';
  const userResponse = await createUser({
    nome: faker.person.fullName(),
    email,
    password,
    administrador: 'true',
  });
  const userId = userResponse.body._id;

  // 2. Get token
  const token = await getToken(email, password);

  // 3. Create a product (required for cart)
  const productResponse = await request
    .post('/produtos')
    .set('Authorization', token)
    .send({
      nome: `Produto ${Date.now()}`,
      preco: 100,
      descricao: 'Produto de teste',
      quantidade: 10,
    });
  const productId = productResponse.body._id;

  // 4. Create cart
  const cartResponse = await request
    .post('/carrinhos')
    .set('Authorization', token)
    .send({
      produtos: [{ idProduto: productId, quantidade: 1 }],
    });

  return {
    userId,
    email,
    password,
    token,
    productId,
    cartId: cartResponse.body._id,
  };
}

async function cancelCart(token) {
  return request.delete('/carrinhos/cancelar-compra').set('Authorization', token);
}

module.exports = { createCartForUser, cancelCart };

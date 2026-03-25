const { create, getAll, remove } = require('../../src/services/users.service');
const UserFactory = require('../../src/factories/user.factory');
const { matchers } = require('jest-json-schema');
const { usersListSchema } = require('../../src/schemas/users-list.schema');

expect.extend(matchers);

describe('GET /usuarios', () => {
  let createdUser;

  beforeAll(async () => {
    const payload = UserFactory.build({ nome: 'Filtro Teste Unico' });
    const res = await create(payload);
    createdUser = { ...payload, _id: res.body._id };
  });

  afterAll(async () => {
    if (createdUser._id) await remove(createdUser._id);
  });

  it('should list all users', async () => {
    const response = await getAll();

    expect(response.status).toBe(200);
    expect(response.body.quantidade).toBeGreaterThan(0);
    expect(response.body.usuarios).toBeInstanceOf(Array);
    expect(response.body).toMatchSchema(usersListSchema);
    expect(response.headers['content-type']).toMatch(/application\/json/);
  });

  it('should filter by name via query param', async () => {
    const response = await getAll({ nome: createdUser.nome });

    expect(response.status).toBe(200);
    expect(response.body.quantidade).toBeGreaterThanOrEqual(1);
    response.body.usuarios.forEach((user) => {
      expect(user.nome).toBe(createdUser.nome);
    });
  });

  it('should filter by multiple query params', async () => {
    const response = await getAll({
      nome: createdUser.nome,
      email: createdUser.email,
    });

    expect(response.status).toBe(200);
    expect(response.body.quantidade).toBe(1);
    expect(response.body.usuarios[0]._id).toBe(createdUser._id);
  });

  it('should return error for unknown query param', async () => {
    const request = require('../../src/utils/request');
    const response = await request.get('/usuarios').query({ parametro_fake: 'xyz' });

    expect(response.status).toBe(400);
    expect(response.body.parametro_fake).toMatch(/não é permitido/);
  });
});

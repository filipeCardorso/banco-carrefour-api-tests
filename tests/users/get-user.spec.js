const { create, getById, remove } = require('../../src/services/users.service');
const UserFactory = require('../../src/factories/user.factory');
const { MESSAGES, VALIDATION } = require('../../src/config/constants');
const { matchers } = require('jest-json-schema');
const { userSchema } = require('../../src/schemas/user.schema');

expect.extend(matchers);

describe('GET /usuarios/{_id}', () => {
  let createdUser;

  beforeAll(async () => {
    const payload = UserFactory.build();
    const res = await create(payload);
    createdUser = { ...payload, _id: res.body._id };
  });

  afterAll(async () => {
    if (createdUser._id) await remove(createdUser._id);
  });

  it('should get an existing user', async () => {
    const response = await getById(createdUser._id);

    expect(response.status).toBe(200);
    expect(response.body._id).toBe(createdUser._id);
    expect(response.body.nome).toBe(createdUser.nome);
    expect(response.body.email).toBe(createdUser.email);
    expect(response.body).toMatchSchema(userSchema);
    expect(response.headers['content-type']).toMatch(/application\/json/);
  });

  it('should return error for non-existent ID', async () => {
    const response = await getById('ABCDEFGH12345678');

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(MESSAGES.USUARIO_NAO_ENCONTRADO);
  });

  it('should return error for invalid ID format', async () => {
    const response = await getById('id_invalido');

    expect(response.status).toBe(400);
    expect(response.body.id).toBe(VALIDATION.ID_INVALIDO);
  });
});

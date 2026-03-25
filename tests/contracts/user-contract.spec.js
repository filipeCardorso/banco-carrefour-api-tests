const { create, getAll, getById, update, remove } = require('../../src/services/users.service');
const { login } = require('../../src/services/auth.service');
const UserFactory = require('../../src/factories/user.factory');
const { matchers } = require('jest-json-schema');
const {
  userSchema,
  userCreatedSchema,
  userUpdatedSchema,
} = require('../../src/schemas/user.schema');
const { usersListSchema } = require('../../src/schemas/users-list.schema');
const { loginSuccessSchema, loginErrorSchema } = require('../../src/schemas/login.schema');
const {
  messageErrorSchema,
  fieldValidationErrorSchema,
} = require('../../src/schemas/error.schema');

expect.extend(matchers);

describe('Contract Tests', () => {
  let userId;
  const userData = UserFactory.build({ password: 'teste123' });

  beforeAll(async () => {
    const res = await create(userData);
    userId = res.body._id;
  });

  afterAll(async () => {
    if (userId) await remove(userId);
  });

  describe('POST /login', () => {
    it('success response should follow the schema', async () => {
      const response = await login(userData.email, userData.password);
      expect(response.body).toMatchSchema(loginSuccessSchema);
    });

    it('error response should follow the schema', async () => {
      const response = await login('fake@email.com', 'wrong');
      expect(response.body).toMatchSchema(loginErrorSchema);
    });
  });

  describe('POST /usuarios', () => {
    it('creation response should follow the schema', async () => {
      const payload = UserFactory.build();
      const response = await create(payload);

      expect(response.body).toMatchSchema(userCreatedSchema);
      await remove(response.body._id);
    });

    it('validation error response should have string fields', async () => {
      const response = await create({});
      expect(response.body).toMatchSchema(fieldValidationErrorSchema);
    });

    it('duplicate email response should follow the schema', async () => {
      const response = await create(userData);
      expect(response.body).toMatchSchema(messageErrorSchema);
    });
  });

  describe('GET /usuarios', () => {
    it('list response should follow the schema', async () => {
      const response = await getAll();
      expect(response.body).toMatchSchema(usersListSchema);
    });
  });

  describe('GET /usuarios/{_id}', () => {
    it('get response should follow the schema', async () => {
      const response = await getById(userId);
      expect(response.body).toMatchSchema(userSchema);
    });

    it('not found response should follow the schema', async () => {
      const response = await getById('ABCDEFGH12345678');
      expect(response.body).toMatchSchema(messageErrorSchema);
    });
  });

  describe('PUT /usuarios/{_id}', () => {
    it('update response should follow the schema', async () => {
      const payload = UserFactory.build({ email: userData.email });
      const response = await update(userId, payload);
      expect(response.body).toMatchSchema(userUpdatedSchema);
    });
  });
});

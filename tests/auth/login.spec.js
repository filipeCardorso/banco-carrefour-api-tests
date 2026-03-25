const { login } = require('../../src/services/auth.service');
const { create, remove } = require('../../src/services/users.service');
const UserFactory = require('../../src/factories/user.factory');
const { MESSAGES, VALIDATION } = require('../../src/config/constants');
const { matchers } = require('jest-json-schema');
const { loginSuccessSchema, loginErrorSchema } = require('../../src/schemas/login.schema');

expect.extend(matchers);

describe('POST /login', () => {
  let userData;

  beforeAll(async () => {
    userData = UserFactory.build({ password: 'teste123' });
    const res = await create(userData);
    userData._id = res.body._id;
  });

  afterAll(async () => {
    if (userData._id) await remove(userData._id);
  });

  it('should login successfully', async () => {
    const response = await login(userData.email, userData.password);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(MESSAGES.LOGIN_SUCESSO);
    expect(response.body.authorization).toMatch(/^Bearer /);
    expect(response.body).toMatchSchema(loginSuccessSchema);
    expect(response.headers['content-type']).toMatch(/application\/json/);
  });

  it('should return error for unregistered email', async () => {
    const response = await login('naoexiste@email.com', 'qualquersenha');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(MESSAGES.LOGIN_INVALIDO);
    expect(response.body).toMatchSchema(loginErrorSchema);
  });

  it('should return error for wrong password', async () => {
    const response = await login(userData.email, 'senhaerrada');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(MESSAGES.LOGIN_INVALIDO);
  });

  it('should return error without email field', async () => {
    const response = await login(undefined, 'teste123');

    expect(response.status).toBe(400);
    expect(response.body.email).toBe(VALIDATION.EMAIL_OBRIGATORIO);
  });

  it('should return error without password field', async () => {
    const response = await login('email@test.com', undefined);

    expect(response.status).toBe(400);
    expect(response.body.password).toBe(VALIDATION.PASSWORD_OBRIGATORIO);
  });

  it('should return error with empty body', async () => {
    const request = require('../../src/utils/request');
    const response = await request.post('/login').send({});

    expect(response.status).toBe(400);
    expect(response.body.email).toBe(VALIDATION.EMAIL_OBRIGATORIO);
    expect(response.body.password).toBe(VALIDATION.PASSWORD_OBRIGATORIO);
  });

  it('should return error for invalid email format', async () => {
    const response = await login('emailinvalido', 'teste123');

    expect(response.status).toBe(400);
    expect(response.body.email).toBe(VALIDATION.EMAIL_INVALIDO);
  });
});

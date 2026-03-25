const { create, update, getAll, getById } = require('../../src/services/users.service');
const UserFactory = require('../../src/factories/user.factory');
const { MESSAGES, VALIDATION } = require('../../src/config/constants');
const { trackId, deleteAllTracked } = require('../../src/utils/cleanup');

describe('PUT /usuarios/{_id}', () => {
  let existingUser;

  beforeAll(async () => {
    const payload = UserFactory.build();
    const res = await create(payload);
    existingUser = { ...payload, _id: res.body._id };
    trackId(existingUser._id);
  });

  afterAll(async () => {
    await deleteAllTracked();
  });

  it('should update an existing user', async () => {
    const newPayload = UserFactory.build({ email: existingUser.email });
    const response = await update(existingUser._id, newPayload);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(MESSAGES.ALTERADO_SUCESSO);
    expect(response.headers['content-type']).toMatch(/application\/json/);
  });

  it('should create a new user when ID does not exist', async () => {
    const payload = UserFactory.build();
    const response = await update('IDQUENAOEXISTE01', payload);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe(MESSAGES.CADASTRO_SUCESSO);
    expect(response.body._id).toBeDefined();
    trackId(response.body._id);
  });

  it('should return error when email is already used by another user', async () => {
    const otherUser = UserFactory.build();
    const otherRes = await create(otherUser);
    trackId(otherRes.body._id);

    const payload = UserFactory.build({ email: otherUser.email });
    const response = await update(existingUser._id, payload);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(MESSAGES.EMAIL_JA_USADO);
  });

  it('should allow PUT with the user own email', async () => {
    const currentData = await getById(existingUser._id);
    const payload = UserFactory.build({ email: currentData.body.email });
    const response = await update(existingUser._id, payload);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(MESSAGES.ALTERADO_SUCESSO);
  });

  it('should return error without required field', async () => {
    const payload = UserFactory.build();
    delete payload.nome;

    const response = await update(existingUser._id, payload);

    expect(response.status).toBe(400);
    expect(response.body.nome).toBe(VALIDATION.NOME_OBRIGATORIO);
  });

  it('should return error with empty body', async () => {
    const response = await update(existingUser._id, {});

    expect(response.status).toBe(400);
    expect(response.body.nome).toBe(VALIDATION.NOME_OBRIGATORIO);
    expect(response.body.email).toBe(VALIDATION.EMAIL_OBRIGATORIO);
  });

  it('should return error when administrador is not true/false', async () => {
    const payload = UserFactory.build({ administrador: 'sim' });
    const response = await update(existingUser._id, payload);

    expect(response.status).toBe(400);
    expect(response.body.administrador).toBe(VALIDATION.ADMINISTRADOR_INVALIDO);
  });

  it('should accept SQL injection in name without side effects', async () => {
    const payload = UserFactory.build({
      nome: "'; DROP TABLE usuarios;--",
      email: existingUser.email,
    });
    const response = await update(existingUser._id, payload);

    expect(response.status).toBe(200);

    const listResponse = await getAll();
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.usuarios).toBeInstanceOf(Array);
  });

  it('should accept XSS in name and store as literal string', async () => {
    const xssPayload = "<script>alert('xss')</script>";
    const payload = UserFactory.build({
      nome: xssPayload,
      email: existingUser.email,
    });
    const response = await update(existingUser._id, payload);

    expect(response.status).toBe(200);

    const getResponse = await getById(existingUser._id);
    expect(getResponse.body.nome).toBe(xssPayload);
  });

  it('should accept large payload without returning 500 error', async () => {
    const bigName = 'A'.repeat(10000);
    const payload = UserFactory.build({
      nome: bigName,
      email: existingUser.email,
    });
    const response = await update(existingUser._id, payload);

    expect(response.status).not.toBe(500);
  });
});

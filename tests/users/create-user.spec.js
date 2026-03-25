const { create, getAll } = require('../../src/services/users.service');
const UserFactory = require('../../src/factories/user.factory');
const { MESSAGES, VALIDATION } = require('../../src/config/constants');
const { trackId, deleteAllTracked } = require('../../src/utils/cleanup');
const request = require('../../src/utils/request');

describe('POST /usuarios', () => {
  afterAll(async () => {
    await deleteAllTracked();
  });

  it('should create a user successfully', async () => {
    const payload = UserFactory.build();
    const response = await create(payload);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe(MESSAGES.CADASTRO_SUCESSO);
    expect(response.body._id).toBeDefined();
    expect(response.headers['content-type']).toMatch(/application\/json/);
    trackId(response.body._id);
  });

  it('should return error for duplicate email', async () => {
    const payload = UserFactory.build();
    const first = await create(payload);
    trackId(first.body._id);

    const response = await create(payload);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(MESSAGES.EMAIL_JA_USADO);
  });

  describe.each([
    ['nome', VALIDATION.NOME_OBRIGATORIO],
    ['email', VALIDATION.EMAIL_OBRIGATORIO],
    ['password', VALIDATION.PASSWORD_OBRIGATORIO],
    ['administrador', VALIDATION.ADMINISTRADOR_OBRIGATORIO],
  ])('required field: %s', (field, message) => {
    it(`should return error without field ${field}`, async () => {
      const payload = UserFactory.build();
      delete payload[field];

      const response = await create(payload);

      expect(response.status).toBe(400);
      expect(response.body[field]).toBe(message);
    });
  });

  it('should return error for invalid email format', async () => {
    const payload = UserFactory.build({ email: 'emailinvalido' });
    const response = await create(payload);

    expect(response.status).toBe(400);
    expect(response.body.email).toBe(VALIDATION.EMAIL_INVALIDO);
  });

  it('should return error with empty body', async () => {
    const response = await create({});

    expect(response.status).toBe(400);
    expect(response.body.nome).toBe(VALIDATION.NOME_OBRIGATORIO);
    expect(response.body.email).toBe(VALIDATION.EMAIL_OBRIGATORIO);
    expect(response.body.password).toBe(VALIDATION.PASSWORD_OBRIGATORIO);
    expect(response.body.administrador).toBe(VALIDATION.ADMINISTRADOR_OBRIGATORIO);
  });

  it('should return error when administrador is not true/false', async () => {
    const payload = UserFactory.build({ administrador: 'invalido' });
    const response = await create(payload);

    expect(response.status).toBe(400);
    expect(response.body.administrador).toBe(VALIDATION.ADMINISTRADOR_INVALIDO);
  });

  it('should accept SQL injection in name without side effects', async () => {
    const payload = UserFactory.build({ nome: "'; DROP TABLE usuarios;--" });
    const response = await create(payload);

    expect(response.status).toBe(201);
    trackId(response.body._id);

    // Verify user list remains intact
    const listResponse = await getAll();
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.usuarios).toBeInstanceOf(Array);
    expect(listResponse.body.quantidade).toBeGreaterThan(0);
  });

  it('should accept XSS in name and store as literal string', async () => {
    const xssPayload = "<script>alert('xss')</script>";
    const payload = UserFactory.build({ nome: xssPayload });
    const response = await create(payload);

    expect(response.status).toBe(201);
    trackId(response.body._id);

    // Verify the value is stored as a literal string
    const getResponse = await request.get(`/usuarios/${response.body._id}`);
    expect(getResponse.body.nome).toBe(xssPayload);
  });

  it('should accept large payload without returning 500 error', async () => {
    const bigName = 'A'.repeat(10000);
    const payload = UserFactory.build({ nome: bigName });
    const response = await create(payload);

    expect(response.status).not.toBe(500);
    if (response.status === 201) trackId(response.body._id);
  });

  it('should return error with Content-Type text/plain', async () => {
    const payload = UserFactory.build();
    const response = await request
      .post('/usuarios')
      .set('Content-Type', 'text/plain')
      .send(JSON.stringify(payload));

    expect(response.status).toBe(400);
  });
});

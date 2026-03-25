const request = require('../../src/utils/request');
const { MESSAGES } = require('../../src/config/constants');

describe('Authentication Tests (via /carrinhos)', () => {
  it('should return 401 without Authorization header', async () => {
    const response = await request
      .post('/carrinhos')
      .send({ produtos: [{ idProduto: 'qualquer', quantidade: 1 }] });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(MESSAGES.TOKEN_AUSENTE);
  });

  it('should return 401 with invalid/malformed token', async () => {
    const response = await request
      .post('/carrinhos')
      .set('Authorization', 'Bearer token_invalido_123')
      .send({ produtos: [{ idProduto: 'qualquer', quantidade: 1 }] });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(MESSAGES.TOKEN_AUSENTE);
  });

  it('should return 401 with expired token', async () => {
    // JWT token with past expiration
    const expiredToken =
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RlQHRlc3RlLmNvbSIsInBhc3N3b3JkIjoiMTIzIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE2MDAwMDA2MDB9.invalid';
    const response = await request
      .post('/carrinhos')
      .set('Authorization', expiredToken)
      .send({ produtos: [{ idProduto: 'qualquer', quantidade: 1 }] });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(MESSAGES.TOKEN_AUSENTE);
  });
});

describe('Unsupported HTTP Method Tests', () => {
  it('should return 405 for PATCH /usuarios/{_id}', async () => {
    const response = await request.patch('/usuarios/ABCDEFGH12345678').send({ nome: 'Patch Test' });

    expect(response.status).toBe(405);
    expect(response.body.message).toMatch(/Não é possível realizar PATCH/);
  });
});

const { create, update, remove } = require('../../src/services/users.service');
const UserFactory = require('../../src/factories/user.factory');
const { MESSAGES } = require('../../src/config/constants');

describe('Idempotency Tests', () => {
  describe('Idempotent DELETE', () => {
    it('should return different messages when deleting same ID twice', async () => {
      const payload = UserFactory.build();
      const createRes = await create(payload);
      const id = createRes.body._id;

      const firstDelete = await remove(id);
      expect(firstDelete.status).toBe(200);
      expect(firstDelete.body.message).toBe(MESSAGES.EXCLUIDO_SUCESSO);

      const secondDelete = await remove(id);
      expect(secondDelete.status).toBe(200);
      expect(secondDelete.body.message).toBe(MESSAGES.NENHUM_EXCLUIDO);
    });
  });

  describe('Idempotent PUT', () => {
    it('should return same result when sending PUT twice with same payload', async () => {
      const payload = UserFactory.build();
      const createRes = await create(payload);
      const id = createRes.body._id;

      const updatePayload = UserFactory.build({ email: payload.email });

      const firstPut = await update(id, updatePayload);
      expect(firstPut.status).toBe(200);
      expect(firstPut.body.message).toBe(MESSAGES.ALTERADO_SUCESSO);

      const secondPut = await update(id, updatePayload);
      expect(secondPut.status).toBe(200);
      expect(secondPut.body.message).toBe(MESSAGES.ALTERADO_SUCESSO);

      // Cleanup
      await remove(id);
    });
  });
});

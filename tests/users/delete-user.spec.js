const { create, remove } = require('../../src/services/users.service');
const { createCartForUser, cancelCart } = require('../../src/services/cart.helper');
const UserFactory = require('../../src/factories/user.factory');
const { MESSAGES } = require('../../src/config/constants');

describe('DELETE /usuarios/{_id}', () => {
  it('should delete an existing user', async () => {
    const payload = UserFactory.build();
    const createRes = await create(payload);
    const id = createRes.body._id;

    const response = await remove(id);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(MESSAGES.EXCLUIDO_SUCESSO);
    expect(response.headers['content-type']).toMatch(/application\/json/);
  });

  it('should return success when deleting non-existent ID', async () => {
    const response = await remove('ABCDEFGH12345678');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(MESSAGES.NENHUM_EXCLUIDO);
  });

  it('should return error when deleting user with active cart', async () => {
    let cartData;
    try {
      cartData = await createCartForUser();
      const response = await remove(cartData.userId);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/carrinho/i);
    } finally {
      // Cleanup: cancel cart and delete user
      if (cartData?.token) {
        await cancelCart(cartData.token);
        await remove(cartData.userId);
      }
    }
  });
});

const { userSchema } = require('./user.schema');

const usersListSchema = {
  type: 'object',
  required: ['quantidade', 'usuarios'],
  properties: {
    quantidade: { type: 'integer' },
    usuarios: {
      type: 'array',
      items: userSchema,
    },
  },
  additionalProperties: false,
};

module.exports = { usersListSchema };

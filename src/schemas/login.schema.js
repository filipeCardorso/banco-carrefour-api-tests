const loginSuccessSchema = {
  type: 'object',
  required: ['message', 'authorization'],
  properties: {
    message: { type: 'string' },
    authorization: { type: 'string', pattern: '^Bearer ' },
  },
  additionalProperties: false,
};

const loginErrorSchema = {
  type: 'object',
  required: ['message'],
  properties: {
    message: { type: 'string' },
  },
  additionalProperties: false,
};

module.exports = { loginSuccessSchema, loginErrorSchema };

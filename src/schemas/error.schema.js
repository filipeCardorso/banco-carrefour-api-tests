const messageErrorSchema = {
  type: 'object',
  required: ['message'],
  properties: {
    message: { type: 'string' },
  },
  additionalProperties: false,
};

// Field validation error — dynamic keys with string messages
const fieldValidationErrorSchema = {
  type: 'object',
  additionalProperties: { type: 'string' },
};

module.exports = { messageErrorSchema, fieldValidationErrorSchema };

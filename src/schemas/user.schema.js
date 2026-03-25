const userSchema = {
  type: 'object',
  required: ['_id', 'nome', 'email', 'password', 'administrador'],
  properties: {
    _id: { type: 'string' },
    nome: { type: 'string' },
    email: { type: 'string' },
    password: { type: 'string' },
    administrador: { type: 'string', enum: ['true', 'false'] },
  },
  additionalProperties: false,
};

const userCreatedSchema = {
  type: 'object',
  required: ['message', '_id'],
  properties: {
    message: { type: 'string' },
    _id: { type: 'string' },
  },
  additionalProperties: false,
};

const userUpdatedSchema = {
  type: 'object',
  required: ['message'],
  properties: {
    message: { type: 'string' },
  },
  additionalProperties: false,
};

module.exports = { userSchema, userCreatedSchema, userUpdatedSchema };

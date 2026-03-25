require('dotenv').config();

module.exports = {
  BASE_URL: process.env.BASE_URL || 'https://serverest.dev',
  TIMEOUT: 10000,
};

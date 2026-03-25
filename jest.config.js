module.exports = {
  setupFiles: ['./jest.setup.js'],
  testMatch: ['**/tests/**/*.spec.js'],
  testTimeout: 30000,
  verbose: true,
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './reports',
        filename: 'report.html',
        openReport: false,
        pageTitle: 'Banco Carrefour - API Tests Report',
      },
    ],
    [
      'jest-junit',
      {
        outputDirectory: './reports',
        outputName: 'junit.xml',
      },
    ],
  ],
};

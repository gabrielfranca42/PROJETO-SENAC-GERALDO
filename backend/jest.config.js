module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/app.js',
    '!src/config/**',
    '!src/seed.js'
  ],
  coverageReporters: ['json', 'html', 'text'],
  clearMocks: true
};

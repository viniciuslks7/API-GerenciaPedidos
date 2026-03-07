/**
 * @fileoverview Configuração do Jest para testes unitários e de integração.
 * @author Vinicius (viniciuslks7)
 */

module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/app.js',
    '!src/config/initDb.js',
    '!src/swagger/**'
  ],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  verbose: true
};

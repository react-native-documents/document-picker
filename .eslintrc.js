module.exports = {
  root: true,
  extends: ['@react-native', 'plugin:prettier/recommended', 'plugin:jest/recommended'],
  rules: {
    // flags jest.config.ts as a problem
    'jest/no-jest-import': 'off',
  },
  ignorePatterns: ['**/lib/*', 'node_modules/*', '**/build/*'],
}

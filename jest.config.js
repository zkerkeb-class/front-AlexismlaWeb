module.exports = {
  testEnvironment: "jsdom",
  collectCoverage: true,
  coverageReporters: ["text", "lcov"],
  testMatch: ["**/__tests__/**/*.test.js", "**/__tests__/**/*.spec.js"],
  coverageDirectory: "coverage",
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|@react-native|@react-navigation|expo|@expo|react-native-.*)/)"
  ],
  globals: {
    __DEV__: true,
  },
  setupFiles: [
    "<rootDir>/jest.setup.js"
  ],
  moduleFileExtensions: ['js', 'jsx', 'json', 'ts', 'tsx', 'node']
};

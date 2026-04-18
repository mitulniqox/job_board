module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  setupFiles: ["<rootDir>/tests/setup-env.ts"],
  testMatch: ["**/*.test.ts"],
  clearMocks: true,
  testTimeout: 30000,
};

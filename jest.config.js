module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/setupTests.js"],
  moduleNameMapper: {
    "\.(css|less|sass|scss)$": "identity-obj-proxy"
  },
};

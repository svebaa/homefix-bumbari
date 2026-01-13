module.exports = {
    testEnvironment: "node",
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
    },
    testMatch: ["**/__tests__/**/*.test.js"],
    collectCoverageFrom: ["lib/**/*.js", "!lib/**/*.test.js"],
    transform: {
        "^.+\\.js$": ["babel-jest", { configFile: "./jest.babel.config.js" }],
    },
    transformIgnorePatterns: [
        "node_modules/(?!(.*\\.mjs$))",
    ],
};

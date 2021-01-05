module.exports = {
    moduleFileExtensions: ['js',
        'jsx',
        'json'
    ],
    transform: {
        '^.+\\.(js|jsx)?$': 'babel-jest'
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
    },
    testMatch: [
        '<rootDir>/src/**/(*.spec.(js))'
    ],
    transformIgnorePatterns: ['<rootDir>/node_modules/']
};

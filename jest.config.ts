import type { JestConfigWithTsJest } from 'ts-jest'

const config: JestConfigWithTsJest = {
    extensionsToTreatAsEsm: ['.ts'],
    verbose: true,
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        '^.+\\.(ts|tsx)?$': 'ts-jest',
        "^.+\\.(js|jsx)$": "babel-jest",
    },
    testPathIgnorePatterns: ['./dist'],
    collectCoverage: true
}

export default config
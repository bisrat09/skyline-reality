import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@anthropic-ai/sdk$': '<rootDir>/__mocks__/@anthropic-ai/sdk.ts',
    '^firebase/app$': '<rootDir>/__mocks__/firebase/app.ts',
    '^firebase/firestore$': '<rootDir>/__mocks__/firebase/firestore.ts',
    '^firebase-admin$': '<rootDir>/__mocks__/firebase-admin.ts',
  },
  testPathIgnorePatterns: ['<rootDir>/__tests__/e2e/'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/scripts/**',
  ],
};

export default createJestConfig(config);

// Variables globales React Native
global.__DEV__ = true;

// Mock de twrnc (tailwind)
jest.mock('twrnc', () => ({
  __esModule: true,
  default: jest.fn((strings, ...values) => {
    return strings.reduce((result, string, index) => {
      return result + string + (values[index] || '');
    }, '');
  }),
}));

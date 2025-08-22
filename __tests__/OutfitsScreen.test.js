test('OutfitsScreen can be imported', () => {
  expect(() => {
    require('../src/screens/OutfitsScreen');
  }).not.toThrow();
});

test('OutfitsScreen is a function component', () => {
  const OutfitsScreen = require('../src/screens/OutfitsScreen').default;
  expect(typeof OutfitsScreen).toBe('function');
});

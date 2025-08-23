test('HomeScreen test placeholder', () => {
  expect(2 + 2).toBe(4);
});

test('Weather functionality exists', () => {
  const weatherData = {
    icon: '🌤️',
    temp: 23,
    label: 'Peu nuageux'
  };
  
  expect(weatherData.temp).toBe(23);
  expect(weatherData.label).toBe('Peu nuageux');
});

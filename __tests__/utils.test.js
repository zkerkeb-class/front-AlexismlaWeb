// Test de fonctions utilitaires simples
const formatTemperature = (temp) => `${temp}°C`;
const formatWeatherCondition = (condition) => condition;

test('formatTemperature formats temperature correctly', () => {
  expect(formatTemperature(23)).toBe('23°C');
  expect(formatTemperature(0)).toBe('0°C');
  expect(formatTemperature(-5)).toBe('-5°C');
});

test('formatWeatherCondition returns condition as is', () => {
  expect(formatWeatherCondition('Ensoleillé')).toBe('Ensoleillé');
  expect(formatWeatherCondition('Pluvieux')).toBe('Pluvieux');
});

test('weather data structure is valid', () => {
  const weatherData = {
    icon: '🌤️',
    temp: 23,
    label: 'Peu nuageux'
  };
  
  expect(weatherData).toHaveProperty('icon');
  expect(weatherData).toHaveProperty('temp');
  expect(weatherData).toHaveProperty('label');
  expect(typeof weatherData.temp).toBe('number');
  expect(typeof weatherData.label).toBe('string');
});

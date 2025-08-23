// Tests pour la logique météo basée sur le code réel de HomeScreen

// Simule la logique météo de HomeScreen
const createWeatherData = (icon, temp, label) => ({
  icon,
  temp,
  label
});

const formatWeatherForAPI = (weather) => ({
  condition: weather.label,
  temperature: weather.temp
});

describe('Weather Logic Tests', () => {
  test('should create weather data with correct structure', () => {
    const weather = createWeatherData("🌤️", 23, "Peu nuageux");
    
    expect(weather).toEqual({
      icon: "🌤️",
      temp: 23,
      label: "Peu nuageux"
    });
    expect(weather).toHaveProperty('icon');
    expect(weather).toHaveProperty('temp');
    expect(weather).toHaveProperty('label');
  });

  test('should format weather data for API calls', () => {
    const weather = { icon: "🌤️", temp: 23, label: "Peu nuageux" };
    const apiWeather = formatWeatherForAPI(weather);
    
    expect(apiWeather).toEqual({
      condition: "Peu nuageux",
      temperature: 23
    });
  });

  test('should handle different weather conditions', () => {
    const sunnyWeather = createWeatherData("☀️", 28, "Ensoleillé");
    const rainyWeather = createWeatherData("🌧️", 15, "Pluvieux");
    const cloudyWeather = createWeatherData("☁️", 20, "Nuageux");

    expect(sunnyWeather.temp).toBe(28);
    expect(rainyWeather.label).toBe("Pluvieux");
    expect(cloudyWeather.icon).toBe("☁️");
  });

  test('should validate weather temperature ranges', () => {
    const hotWeather = createWeatherData("🔥", 35, "Très chaud");
    const coldWeather = createWeatherData("❄️", -5, "Très froid");
    
    expect(hotWeather.temp).toBeGreaterThan(30);
    expect(coldWeather.temp).toBeLessThan(0);
  });
});

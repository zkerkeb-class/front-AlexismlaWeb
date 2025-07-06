import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  Dimensions,
  Image,
  ScrollView
} from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import tw from "twrnc";
import * as Location from "expo-location";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import TokenDialog from "../components/TokenDialog";

const screenWidth = Dimensions.get("window").width;

const getWeatherIconAndLabel = (code) => {
  if (code === 0) return { icon: "☀️", label: "Ciel clair" };
  if (code === 1) return { icon: "🌤️", label: "Peu nuageux" };
  if (code === 2) return { icon: "⛅", label: "Partiellement nuageux" };
  if (code === 3) return { icon: "☁️", label: "Couvert" };
  if (code >= 45 && code <= 48) return { icon: "🌫️", label: "Brouillard" };
  if (code >= 51 && code <= 55) return { icon: "🌦️", label: "Bruine" };
  if (code >= 61 && code <= 65) return { icon: "🌧️", label: "Pluie" };
  if (code >= 66 && code <= 67) return { icon: "🌨️", label: "Pluie verglaçante" };
  if (code >= 71 && code <= 75) return { icon: "❄️", label: "Neige" };
  if (code === 77) return { icon: "🌨️", label: "Grésil" };
  if (code >= 80 && code <= 82) return { icon: "🌦️", label: "Averses" };
  if (code >= 95 && code <= 99) return { icon: "⛈️", label: "Orage" };
  return { icon: "❓", label: "Inconnu" };
};

export default function HomeScreen() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState("");
  const [outfits, setOutfits] = useState([]);
  const { userId, userToken } = useContext(AuthContext);
  const [allClothes, setAllClothes] = useState([]);

  const fetchAllClothes = async () => {
    try {
      const res = await axios.get("http://localhost:4001/api/clothing", {
        params: { userId },
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      setAllClothes(res.data);
    } catch (err) {
      console.error("Erreur récupération vêtements:", err);
    }
  };

  const getClothingForOutfit = (clothingIds) => {
    return allClothes.filter((item) => clothingIds.includes(item.id));
  };
  
  
  const fetchOutfits = async () => {
    try {
      const res = await axios.get("http://localhost:4001/api/outfits", {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      setOutfits(res.data);
    } catch (err) {
      console.error("Erreur récupération des tenues:", err);
    }
  };
  
  const fetchWeather = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission de localisation refusée.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      const cityName = reverseGeocode[0]?.city || "Localisation inconnue";
      setCity(cityName);

      const res = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weathercode&current_weather=true&timezone=auto`
      );

      const now = new Date();
      const currentHour = now.getHours();

      const hours = res.data.hourly.time
        .map((t) => new Date(t))
        .filter((d) => d.getHours() >= currentHour && d.getDate() === now.getDate());

      const temps = res.data.hourly.temperature_2m.slice(currentHour, currentHour + hours.length);
      const codes = res.data.hourly.weathercode.slice(currentHour, currentHour + hours.length);

      const hourly = hours.map((date, index) => {
        const hour = date.getHours();
        const { icon } = getWeatherIconAndLabel(codes[index]);
        return {
          hour: `${hour}h`,
          temp: temps[index],
          condition: icon,
        };
      });

      const currentCode = res.data.current_weather.weathercode;
      const { icon, label } = getWeatherIconAndLabel(currentCode);

      setWeatherData({
        current: {
          temperature: res.data.current_weather.temperature,
          condition: icon,
          label,
        },
        hourly,
      });
    } catch (error) {
      console.error("Erreur météo :", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchWeather();
      fetchOutfits();
      fetchAllClothes();
    }, [])
  );
  
  return (
      <View style={tw`flex-1 bg-white pt-20 px-4`}>
        <View style={tw`items-end mb-4`}>
  <TokenDialog />
</View>

        {loading ? (
        <ActivityIndicator size="large" color="gray" style={tw`mt-10`} />
      ) : weatherData ? (
        <>
          <View style={tw`items-center mb-6`}>
            <View style={tw`flex-row items-center ml-5`}>
              <Text style={tw`text-3xl font-bold mx-2`}>{city}</Text>
              <Text style={tw`text-3xl`}>{weatherData.current.condition}</Text>
            </View>
            <Text style={tw`text-xl text-gray-600`}>
              {weatherData.current.temperature}°C
            </Text>
            <Text style={tw`text-md text-gray-400 mt-1`}>
              {weatherData.current.label}
            </Text>
          </View>
          <View>
          <Text style={tw`text-lg font-semibold mb-5`}>Prévision pour aujourd'hui :</Text>
          <FlatList
            data={weatherData.hourly}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={tw`pb-4`}
            renderItem={({ item }) => (
              <View style={tw`bg-gray-100 rounded-xl p-4 mx-1 items-center w-24 h-29`}>
                <Text style={tw`text-lg font-semibold`}>{item.hour}</Text>
                <Text style={tw`text-3xl`}>{item.condition}</Text>
                <Text style={tw`text-base text-gray-600`}>{item.temp}°C</Text>
              </View>
            )}
          />
          </View>
        </>
      ) : (
        <Text style={tw`text-red-500 text-center`}>Erreur lors du chargement de la météo</Text>
      )}
      <View style={tw`mt-10 h-100`}>
  <Text style={tw`text-lg font-semibold mb-2`}>👕 Tenues enregistrées :</Text>
  {outfits.length === 0 ? (
    <Text style={tw`text-gray-500`}>Aucune tenue enregistrée pour le moment.</Text>
  ) : (
<FlatList
  data={outfits}
  keyExtractor={(item) => item.id}
  contentContainerStyle={tw`items-center`} // Centrage vertical des cartes
  renderItem={({ item }) => {
    const clothes = getClothingForOutfit(item.clothingIds);

    return (
      <View style={tw`bg-white border rounded-xl p-4 mb-4 w-80 items-center shadow`}>
        <Text style={tw`font-bold text-base mb-3 text-center`}>
          {item.name || "Tenue sans nom"}
        </Text>

        {/* Images des vêtements affichées horizontalement */}
        <FlatList
          data={clothes}
          horizontal
          keyExtractor={(cloth) => cloth.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={tw`px-2`}
          renderItem={({ item: cloth }) => (
            <Image
              source={{ uri: cloth.imageUrl }}
              style={tw`w-20 h-20 mr-3 rounded-lg`}
              resizeMode="cover"
            />
          )}
        />

        <Text style={tw`text-gray-400 text-xs mt-2`}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
    );
  }}
/>


  )}
</View>

    </View>
  );
}

import React, { useContext, useState } from "react";
import { View, Text, Image, TouchableOpacity, FlatList, SafeAreaView, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import tw from "twrnc";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function HomeScreen() {
  const { userId, userToken } = useContext(AuthContext);
  const weather = { icon: "🌤️", temp: 23, label: "Peu nuageux" };
  const outfits = []; // à remplir
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Fonction suggestion IA réelle
  const getAIRecommendation = async () => {
    if (!userId || !userToken) {
      Alert.alert("Erreur", "Utilisateur non authentifié");
      return;
    }
    setAiLoading(true);
    setAiRecommendation(null);
    try {
      // Utilise la météo mockée pour l'instant
      const weatherData = { condition: weather.label, temperature: weather.temp };
      const response = await axios.post(
        "http://localhost:4002/recommendation",
        { userId, weather: weatherData },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      if (response.data.error || response.data.success === false) {
        Alert.alert("Info", response.data.error || "Aucune recommandation possible pour le moment.");
        setAiRecommendation(null);
        return;
      }
      setAiRecommendation(response.data.recommendation);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || "Erreur inconnue";
      Alert.alert("Erreur", `Impossible de générer la recommandation.\n${msg}`);
      setAiRecommendation(null);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      {/* Header minimal */}
      <View style={tw`flex-row items-center justify-between px-4 py-3 bg-white shadow-sm`}>
        <Text style={tw`text-xl font-bold text-gray-900`}>Accueil</Text>
        <View style={tw`flex-row items-center`}>
          <Text style={tw`text-2xl mr-1`}>{weather.icon}</Text>
          <Text style={tw`text-base font-semibold`}>{weather.temp}°C</Text>
        </View>
      </View>

      {/* Météo */}
      <View style={tw`flex-row items-center justify-between px-4 mt-4`}>
        <View style={tw`flex-row items-center`}>
          <Text style={tw`text-2xl mr-2`}>{weather.icon}</Text>
          <Text style={tw`text-lg font-semibold`}>{weather.temp}°C</Text>
        </View>
        <Text style={tw`text-gray-500`}>{weather.label}</Text>
      </View>

      {/* Suggestion IA */}
      <View style={tw`mx-4 mt-6 mb-2 p-4 rounded-2xl bg-gray-100`}> 
        <View style={tw`flex-row items-center justify-between mb-2`}>
          <Text style={tw`text-base font-semibold`}>Suggestion du jour</Text>
          <TouchableOpacity style={tw`bg-blue-600 rounded-full p-3`} onPress={getAIRecommendation} disabled={aiLoading}>
            {aiLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="sparkles-outline" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
        {aiRecommendation && (
          <View style={tw`mt-2`}>
            <Text style={tw`text-gray-800`}>{aiRecommendation}</Text>
          </View>
        )}
      </View>

      {/* Tenues du jour */}
      <Text style={tw`mx-4 mt-6 mb-2 text-lg font-bold`}>Tenues du jour</Text>
      <FlatList
        data={outfits}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={tw`px-4`}
        renderItem={({ item }) => (
          <View style={tw`mr-4 bg-white rounded-2xl shadow p-3 w-40`}>
            <Image source={{ uri: item.imageUrl }} style={tw`w-32 h-32 rounded-xl mb-2`} />
            <Text style={tw`font-bold text-base`}>{item.name}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={tw`text-gray-400 ml-4`}>Aucune tenue enregistrée</Text>}
      />
    </SafeAreaView>
  );
}

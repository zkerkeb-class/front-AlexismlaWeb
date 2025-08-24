import React, { useState, useEffect, useContext } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert, SafeAreaView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import tw from "twrnc";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

export default function OutfitsScreen() {
  const { userId, userToken } = useContext(AuthContext);
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOutfits = async () => {
    try {
      const response = await axios.get("http://localhost:8081/bdd/api/outfits", {
        headers: { Authorization: "Bearer " + userToken }
      });
      
      // Récupérer les détails des vêtements pour chaque outfit
      const outfitsWithImages = await Promise.all(
        response.data.map(async (outfit) => {
          try {
            // Récupérer les vêtements de cet outfit
            const clothingPromises = outfit.clothingIds?.map(async (clothingId) => {
              try {
                const clothingResponse = await axios.get(`http://localhost:8081/bdd/api/clothing/${clothingId}`, {
                  headers: { Authorization: "Bearer " + userToken }
                });
                return clothingResponse.data;
              } catch (error) {
                console.error(`Erreur récupération vêtement ${clothingId}:`, error);
                return null;
              }
            }) || [];
            
            const clothingItems = await Promise.all(clothingPromises);
            const validClothingItems = clothingItems.filter(item => item !== null);
            
            return {
              ...outfit,
              clothingItems: validClothingItems
            };
          } catch (error) {
            console.error(`Erreur récupération détails outfit ${outfit.id}:`, error);
            return outfit;
          }
        })
      );
      
      setOutfits(outfitsWithImages);
    } catch (error) {
      console.error("Erreur récupération outfits:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId && userToken) {
      fetchOutfits();
    }
  }, [userId, userToken]);

  // Rafraîchir les outfits à chaque fois qu'on revient sur l'écran
  useFocusEffect(
    React.useCallback(() => {
      if (userId && userToken) {
        fetchOutfits();
      }
    }, [userId, userToken])
  );

  const deleteOutfit = async (outfitId) => {
    try {
      await axios.delete(`http://localhost:8081/bdd/api/outfits/${outfitId}`, {
        headers: { Authorization: "Bearer " + userToken }
      });
      fetchOutfits(); // Recharger la liste
      Alert.alert("Succès", "Tenue supprimée !");
    } catch (error) {
      console.error("Erreur suppression outfit:", error);
      Alert.alert("Erreur", "Impossible de supprimer la tenue.");
    }
  };

  const renderOutfit = ({ item }) => (
    <View style={tw`bg-white p-4 mb-4 rounded-xl shadow-lg border border-gray-100`}>
      {/* En-tête avec titre et bouton de suppression */}
      <View style={tw`flex-row justify-between items-start mb-4`}>
        <View style={tw`flex-1 mr-3`}>
          <Text style={tw`text-lg font-bold text-gray-800 mb-1`} numberOfLines={2}>
            {item.name || `Tenue du ${new Date(item.createdAt).toLocaleDateString()}`}
          </Text>
          <Text style={tw`text-sm text-gray-600`}>
            {item.clothingIds?.length || 0} vêtements
          </Text>
        </View>
        
        <TouchableOpacity
          style={tw`bg-red-50 p-3 rounded-lg`}
          onPress={() => {
            Alert.alert(
              "Supprimer la tenue",
              "Êtes-vous sûr de vouloir supprimer cette tenue ?",
              [
                { text: "Annuler", style: "cancel" },
                { text: "Supprimer", style: "destructive", onPress: () => deleteOutfit(item.id) }
              ]
            );
          }}
        >
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
      
      {/* Images des vêtements - Toutes les images */}
      <View style={tw`mb-4`}>
        {item.clothingItems && item.clothingItems.length > 0 ? (
          <View style={tw`flex-row flex-wrap justify-center`}>
            {item.clothingItems.map((clothing, index) => (
              <View key={clothing.id} style={tw`m-1`}>
                <Image 
                  source={{ uri: clothing.imageUrl }} 
                  style={tw`w-14 h-14 rounded-lg border-2 border-white shadow-sm`}
                  resizeMode="cover"
                />
              </View>
            ))}
          </View>
        ) : (
          <View style={tw`w-16 h-16 rounded-lg bg-gray-200 justify-center items-center mx-auto`}>
            <Ionicons name="shirt-outline" size={24} color="#9ca3af" />
          </View>
        )}
      </View>
      
      {/* Informations supplémentaires */}
      <View style={tw`flex-row justify-between items-center`}>
        <Text style={tw`text-xs text-gray-500`}>
          Créée le {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        
        {/* Indicateur visuel des vêtements */}
        <View style={tw`flex-row items-center`}>
          <View style={tw`flex-row`}>
            {Array.from({ length: Math.min(item.clothingIds?.length || 0, 5) }).map((_, index) => (
              <View 
                key={index} 
                style={tw`w-2 h-2 rounded-full bg-blue-400 ${index > 0 ? 'ml-1' : ''}`}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={tw`flex-1 bg-gray-50`}>
        <View style={tw`flex-1 justify-center items-center`}>
          <Text style={tw`text-lg text-gray-600`}>Chargement des tenues...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50`}>
      <View style={tw`pt-6 pb-2 items-center bg-gray-50`}>
        <Text style={tw`text-2xl font-bold text-gray-900 mb-2`}>Mes Tenues</Text>
      </View>
      
      {outfits.length === 0 ? (
        <View style={tw`flex-1 justify-center items-center px-6`}>
          <Ionicons name="shirt-outline" size={80} color="#9ca3af" style={tw`mb-4`} />
          <Text style={tw`text-xl font-bold text-gray-600 mb-2`}>Aucune tenue</Text>
          <Text style={tw`text-gray-500 text-center`}>
            Créez votre première tenue en utilisant les recommandations IA dans votre dressing !
          </Text>
        </View>
      ) : (
        <FlatList
          data={outfits}
          renderItem={renderOutfit}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tw`px-4 pb-4`}
        />
      )}
    </SafeAreaView>
  );
}

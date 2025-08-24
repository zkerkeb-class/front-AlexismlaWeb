import React, { useContext, useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, FlatList, SafeAreaView, ActivityIndicator, Alert, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import tw from "twrnc";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function HomeScreen() {
  const { userId, userToken } = useContext(AuthContext);
  const weather = { icon: "🌤️", temp: 23, label: "Peu nuageux" };
  const [outfits, setOutfits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Cache simple pour éviter les rechargements
  const outfitsCache = React.useRef(null);

  // Récupérer les outfits avec les images
  const fetchOutfits = async (forceRefresh = false) => {
    // Si on a déjà des données en cache et qu'on ne force pas le refresh, on les utilise
    if (!forceRefresh && outfitsCache.current) {
      console.log("Utilisation du cache pour les outfits");
      setOutfits(outfitsCache.current);
      return;
    }
    
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const response = await axios.get("http://localhost:8081/bdd/api/outfits", {
        headers: { Authorization: "Bearer " + userToken }
      });
      
      // Trier les outfits par date de création (plus récentes en premier)
      const sortedOutfits = response.data.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      // Afficher d'abord les outfits sans images
      setOutfits(sortedOutfits);
      
      // Charger les images une par une pour éviter le rate limiting
      const outfitsWithImages = [];
      
      for (let i = 0; i < sortedOutfits.length; i++) {
        const outfit = sortedOutfits[i];
        
        if (outfit.clothingIds && outfit.clothingIds.length > 0) {
          const clothingItems = [];
          
          for (let j = 0; j < outfit.clothingIds.length; j++) {
            try {
              // Délai de 1 seconde entre chaque requête
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              const clothingResponse = await axios.get(`http://localhost:8081/bdd/api/clothing/${outfit.clothingIds[j]}`, {
                headers: { Authorization: "Bearer " + userToken }
              });
              clothingItems.push(clothingResponse.data);
            } catch (error) {
              console.error(`Erreur récupération vêtement ${outfit.clothingIds[j]}:`, error);
            }
          }
          
          outfitsWithImages.push({
            ...outfit,
            clothingItems: clothingItems
          });
        } else {
          outfitsWithImages.push(outfit);
        }
      }
      
      // Sauvegarder dans le cache et mettre à jour l'état
      outfitsCache.current = outfitsWithImages;
      setOutfits([...outfitsWithImages]); // Force un re-render
      
    } catch (error) {
      console.error("Erreur récupération outfits:", error);
    } finally {
      setIsLoading(false);
    }
  };



  // Refresh quand on revient sur l'écran (pull to refresh)
  const onRefresh = () => {
    fetchOutfits(true); // Force refresh
  };

  // Charger les outfits seulement au premier focus
  useFocusEffect(
    React.useCallback(() => {
      if (userId && userToken && !outfitsCache.current) {
        fetchOutfits();
      } else if (outfitsCache.current) {
        // Restaurer le cache si disponible
        setOutfits([...outfitsCache.current]);
      }
    }, [userId, userToken])
  );

  // Fonction pour supprimer un outfit
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

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
            {/* Header moderne */}
      <View style={tw`px-6 py-6 rounded-b-3xl shadow-lg bg-blue-300`}>

         {/* Carte météo moderne */}
                         <View style={tw`bg-blue-200 rounded-2xl p-4`}>
           <View style={tw`flex-row items-center justify-between`}>
             <View style={tw`flex-row items-center`}>
               <Text style={tw`text-3xl mr-3`}>{weather.icon}</Text>
               <View>
                 <Text style={tw`text-2xl font-bold`}>{weather.temp}°C</Text>
                 <Text style={tw`text-blue-500 text-sm`}>{weather.label}</Text>
               </View>
             </View>
             <View style={tw`items-end`}>
               <Text style={tw`text-blue-500 text-sm font-semibold`}>Aujourd'hui</Text>
             </View>
           </View>
         </View>
      </View>

      {/* Section des tenues */}
      <View style={tw`flex-1 px-6 pt-3`}>
                         <View style={tw`flex-row items-center justify-between mb-6`}>
          <View>
            <Text style={tw`text-2xl font-bold text-gray-800`}>Mes Tenues</Text>
            <Text style={tw`text-gray-600 text-sm`}>
              {outfits.length} tenue{outfits.length > 1 ? 's' : ''} créée{outfits.length > 1 ? 's' : ''}
            </Text>
          </View>

        </View>

        <FlatList
            data={outfits}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={tw`pb-6`}
            keyExtractor={(item) => item.id}
            refreshing={isLoading}
            onRefresh={onRefresh}
            renderItem={({ item }) => (
              <View style={tw`bg-white rounded-3xl shadow-xl mb-6 overflow-hidden border border-gray-100`}>
                 {/* En-tête */}
                 <View style={tw`bg-blue-300 px-6 py-1`}>
                  <View style={tw`flex-row items-center justify-between`}>
                    <View style={tw`flex-1 mr-4`}>
                      <Text style={tw`text-lg font-bold mb-1`}>
                        {item.name || `Tenue du ${new Date(item.createdAt).toLocaleDateString()}`}
                      </Text>
                      <View style={tw`flex-row items-center`}>
                        <Ionicons name="shirt-outline" size={16} />
                        <Text style={tw`text-blue-900 text-sm ml-1`}>
                          {item.clothingIds?.length || 0} vêtements
                        </Text>
                      </View>
                    </View>
                    
                    {/* Bouton de suppression */}
                    <TouchableOpacity
                      style={tw`bg-red-500 w-8 h-8 rounded-full items-center justify-center shadow-md`}
                      onPress={() => {
                        Alert.alert(
                          "Supprimer la tenue",
                          "Êtes-vous sûr de vouloir supprimer cette tenue ?",
                          [
                            { text: "Annuler", style: "cancel" },
                            { 
                              text: "Supprimer", 
                              style: "destructive", 
                              onPress: () => deleteOutfit(item.id) 
                            }
                          ]
                        );
                      }}
                    >
                      <Ionicons name="trash-outline" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                                 {/* Images des vêtements */}
                 <View style={tw`p-6`}>
                   {item.clothingItems && item.clothingItems.length > 0 ? (
                     <View style={tw`flex-row justify-center`}>
                       {item.clothingItems.map((clothing, index) => (
                         <View key={clothing.id} style={tw`mx-1`}>
                           <Image 
                             source={{ uri: clothing.imageUrl }} 
                             style={tw`w-16 h-16 rounded-2xl border-2 border-white shadow-lg`}
                             resizeMode="cover"
                           />
                         </View>
                       ))}
                     </View>
                   ) : item.clothingIds && item.clothingIds.length > 0 ? (
                     <View style={tw`flex-row justify-center`}>
                       {item.clothingIds.map((clothingId, index) => (
                         <View key={clothingId} style={tw`mx-1`}>
                           <View style={tw`w-16 h-16 rounded-2xl bg-gray-200 justify-center items-center shadow-lg`}>
                             <ActivityIndicator size="small" color="#3B82F6" />
                           </View>
                         </View>
                       ))}
                     </View>
                   ) : (
                     <View style={tw`w-20 h-20 rounded-2xl bg-gray-100 justify-center items-center mx-auto`}>
                       <Ionicons name="shirt-outline" size={32} color="#9ca3af" />
                     </View>
                   )}
                 </View>
                
                {/* Pied de carte */}
                <View style={tw`px-6 pb-4`}>
                  <View style={tw`flex-row items-center justify-between`}>
                    <View style={tw`flex-row items-center`}>
                      <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                      <Text style={tw`text-gray-500 text-sm ml-1`}>
                        Créée le {new Date(item.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={tw`flex-1 items-center justify-center py-12`}>
                <View style={tw`bg-white rounded-3xl p-8 shadow-lg items-center max-w-sm`}>
                  <View style={tw`w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-4`}>
                    <Ionicons name="shirt-outline" size={32} color="#3B82F6" />
                  </View>
                  <Text style={tw`text-gray-800 text-lg font-bold text-center mb-2`}>
                    Aucune tenue encore
                  </Text>
                                     <Text style={tw`text-gray-600 text-center mb-6`}>
                     Créez votre première tenue dans votre dressing pour la voir apparaître ici !
                   </Text>

                 </View>
               </View>
            }
          />
      </View>
    </SafeAreaView>
  );
}

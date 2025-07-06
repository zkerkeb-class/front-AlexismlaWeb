import React, { useState, useContext, useEffect } from "react";
import {
  View, Text, TouchableOpacity, Alert, Image, FlatList, Modal,
  ScrollView, TextInput, ActivityIndicator, LayoutAnimation, Platform, UIManager, Animated, Easing
} from "react-native";
import tw from "twrnc";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

export default function DressingScreen() {
  const [clothingItems, setClothingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userId, userToken } = useContext(AuthContext);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [suggestedIds, setSuggestedIds] = useState([]);
  const [suggestionText, setSuggestionText] = useState("");
  const [styleModalVisible, setStyleModalVisible] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [recommending, setRecommending] = useState(false);
  const [filters, setFilters] = useState({
    type: "",
    color: "",
    season: "",
    style: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const rotation = useState(new Animated.Value(0))[0]; // 0 = fermé, 1 = ouvert


  

  useEffect(() => {
    fetchClothingItems();

    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Autorisez l’accès à la galerie.');
      }
    })();

    if (Platform.OS === "android") {
      UIManager.setLayoutAnimationEnabledExperimental &&
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const rotateStyle = {
    transform: [
      {
        rotate: rotation.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "180deg"],
        }),
      },
    ],
  };
  

  const toggleFilters = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Animated.timing(rotation, {
      toValue: showFilters ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.ease),
    }).start();
    setShowFilters(!showFilters);
  };

  const fetchClothingItems = async () => {
    try {
      const response = await axios.get('http://localhost:4001/api/clothing', {
        params: { userId },
        headers: { Authorization: "Bearer " + userToken },
      });
      setClothingItems(response.data);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de récupérer les vêtements.");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item) => {
    console.log("Ouverture modal pour l'item :", item);
    setSelectedItem(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setModalVisible(false);
    setIsEditing(false);
  };

  const pickAndSendImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });
  
      if (!result.canceled) {
        setUploading(true);
        const imageUri = result.assets[0].uri;
        const formData = new FormData();
        formData.append("image", {
          uri: imageUri,
          type: "image/jpeg",
          name: "photo.jpg",
        });
        formData.append("userId", userId);
        await axios.post("http://localhost:4002/analyze", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: "Bearer " + userToken,
          },
        });
  
        Alert.alert("Succès", "Vêtement ajouté avec succès !");
        fetchClothingItems();
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'ajouter le vêtement.");
    } finally {
      setUploading(false);
    }
  };
  

  const getWeatherFromLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission refusée", "Impossible d'accéder à la localisation.");
        return null;
      }
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const weatherRes = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );
      const data = weatherRes.data.current_weather;
      return {
        temperature: Math.round(data.temperature),
        condition: data.weathercode < 3 ? "Ensoleillé" : "Variable",
      };
    } catch (err) {
      console.error("Erreur météo :", err);
      return {
        temperature: 20,
        condition: "Inconnue",
      };
    }
  };

  const launchRecommendation = async (style) => {
    setStyleModalVisible(false);
    
    const weather = await getWeatherFromLocation();
    
    setRecommending(true);
    try {
      const response = await axios.post("http://localhost:4002/recommendation", {
        userId,
        style,
        weather,
      }, {
        headers: {
          Authorization: "Bearer " + userToken,
        },
      });
  
      setSuggestedIds(response.data.selectedItemIds);
      setSuggestionText(response.data.recommendation);
  
      Alert.alert(
        "Recommandation générée",
        "Aimes-tu cette tenue ?",
        [
          { text: "Non" },
          {
            text: "Oui, enregistrer",
            onPress: async () => {
              try {
                await axios.post("http://localhost:4001/api/outfits", {
                  clothingIds: response.data.selectedItemIds,
                  name: `Tenue ${style} du ${new Date().toLocaleDateString()}`,
                }, {
                  headers: { Authorization: "Bearer " + userToken },
                });
                Alert.alert("Tenue enregistrée !");
              } catch (err) {
                console.error("Erreur enregistrement outfit:", err);
              }
            },
          },
        ]
      );
    } catch (err) {
      console.error('Erreur recommendation:', err.response?.data || err.message);
      Alert.alert("Erreur", `Impossible de générer la recommandation.\n${err.response?.data?.error || err.message}`);
    } finally {
      setRecommending(false);
    }
  };
  

  const renderSuggestion = () => {
    const filtered = clothingItems.filter((item) => suggestedIds.includes(item.id));
    return (
      <View style={tw`mb-4`}>
         <TouchableOpacity onPress={() => {
          setSuggestedIds([]);
          setSuggestionText("");
        }}>
          <Ionicons name="close" size={26} color="black" />
        </TouchableOpacity>
        <Text style={tw`text-lg font-semibold mb-2`}>✨ Tenue suggérée :</Text>
        <Text style={tw`italic text-base mb-2`}>{suggestionText}</Text>
        <FlatList
          horizontal
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={tw`mr-3 items-center`}>
              <Image source={{ uri: item.imageUrl }} style={tw`w-32 h-32 rounded-lg`} resizeMode="cover" />
              <Text style={tw`text-sm mt-1`}>{item.type} - {item.brand}</Text>
            </View>
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    );
  };

  const uniqueValues = (key) => {
    const values = clothingItems.map((item) => item[key]).filter(Boolean);
    return [...new Set(values)];
  };
  
  const types = uniqueValues("type");
  const colors = uniqueValues("color");
  const seasons = uniqueValues("season");
  const styles = uniqueValues("style");
  

  const FilterButton = ({ label, value, selected, onPress }) => (
    <TouchableOpacity
      onPress={() => onPress(selected ? "" : value)}
      style={tw`px-4 py-2 rounded-full mr-2 mb-2 ${selected ? "bg-blue-500" : "bg-gray-200"}`}
    >
      <Text style={tw`${selected ? "text-white" : "text-gray-800"} text-sm`}>{label}</Text>
    </TouchableOpacity>
  );

  const filteredClothingItems = clothingItems.filter((item) => {
    const { type, color, season, style } = filters;
    return (
      (type === "" || item.type === type) &&
      (color === "" || item.color === color) &&
      (season === "" || item.season === season) &&
      (style === "" || item.style === style)
    );
  });
  
  

  return (
    <View style={tw`flex-1 bg-white p-5 pt-15`}>
      <Text style={tw`text-2xl font-bold mb-4`}>Mon Dressing</Text>
      {suggestedIds.length > 0 && renderSuggestion()}
      <TouchableOpacity
        onPress={toggleFilters}
        style={tw`mb-3 bg-gray-100 w-45 px-4 py-2 rounded-full flex-row items-center gap-2`}
      >
        <Text style={tw`text-sm text-black`}>
          {showFilters ? "Masquer les filtres" : "Afficher les filtres"}
        </Text>
        <Animated.View style={rotateStyle}>
          <Ionicons name="chevron-down" size={16} color="black" />
        </Animated.View>
      </TouchableOpacity>



      {showFilters && (
        <ScrollView style={tw`p-4 mb-6 h-50 bg-gray-100 rounded-lg`}>
          <Text style={tw`text-sm font-semibold mb-1`}>Type :</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`mb-1`}>
            {types.map((t) => (
              <FilterButton
                key={t}
                label={t}
                value={t}
                selected={filters.type === t}
                onPress={(val) => setFilters({ ...filters, type: val })}
              />
            ))}
          </ScrollView>

          <Text style={tw`text-sm font-semibold mb-1`}>Couleur :</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`mb-1`}>
            {colors.map((c) => (
              <FilterButton
                key={c}
                label={c}
                value={c}
                selected={filters.color === c}
                onPress={(val) => setFilters({ ...filters, color: val })}
              />
            ))}
          </ScrollView>

          <Text style={tw`text-sm font-semibold mt-3 mb-1`}>Saison :</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`mb-1`}>
          {seasons.map((s) => (
            <FilterButton
              key={s}
              label={s}
              value={s}
              selected={filters.season === s}
              onPress={(val) => setFilters({ ...filters, season: val })}
            />
          ))}
          </ScrollView>

          <Text style={tw`text-sm font-semibold mt-3 mb-1`}>Style :</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`mb-1`}>
          {styles.map((s) => (
            <FilterButton
              key={s}
              label={s}
              value={s}
              selected={filters.style === s}
              onPress={(val) => setFilters({ ...filters, style: val })}
            />
          ))}
          </ScrollView>

          <TouchableOpacity
            onPress={() => setFilters({ type: "", color: "", season: "", style: "" })}
            style={tw`bg-red-500 mt-3 mb-5 py-2 px-4 rounded-full self-start`}
          >
            <Text style={tw`text-white text-sm`}>Réinitialiser les filtres</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

<FlatList
  data={filteredClothingItems}
  keyExtractor={(item) => item.id}
  numColumns={2}
  renderItem={({ item }) => {
    const isSuggested = suggestedIds.includes(item.id);
    return (
      <View style={tw`flex-1 justify-center items-center mb-4`}>
        <TouchableOpacity
          style={tw`h-50 w-40 items-center mb-4 p-2 border rounded-lg ${isSuggested ? "border-green-500 border-2" : ""}`}
          onPress={() => openModal(item)}
        >
          <Image source={{ uri: item.imageUrl }} style={tw`w-30 h-30 mb-2 rounded`} resizeMode="cover" />
          <Text style={tw`font-bold text-lg text-center`}>
            {item.type.toUpperCase()} - {item.brand.toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }}
/>


      <Modal visible={styleModalVisible} transparent animationType="slide">
        <View style={tw`flex-1 justify-end bg-black bg-opacity-50`}>
          <View style={tw`bg-white p-5 rounded-t-xl`}>
            <Text style={tw`text-lg font-bold mb-4`}>Choisis ton style</Text>
            {['Décontracté', 'Chic', 'Sport', 'Streetwear', 'Classique'].map((style) => (
              <TouchableOpacity
                key={style}
                style={tw`mb-3 bg-gray-200 p-3 rounded`}
                onPress={() => launchRecommendation(style)}
              >
                <Text style={tw`text-center`}>{style}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setStyleModalVisible(false)}>
              <Text style={tw`text-center text-red-500 mt-2`}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={tw`absolute bottom-8 right-8 flex-row gap-4`}>
        <TouchableOpacity style={tw`bg-black w-14 h-14 rounded-full justify-center items-center shadow-lg`} onPress={pickAndSendImage}>
          <Ionicons name="add" size={26} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={tw`bg-blue-600 w-14 h-14 rounded-full justify-center items-center shadow-lg`} onPress={() => setStyleModalVisible(true)}>
          <Ionicons name="sparkles-outline" size={26} color="white" />
        </TouchableOpacity>
      </View>
      <Modal visible={modalVisible} transparent animationType="slide">
  <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-60`}>
    <View style={tw`bg-white w-11/12 p-5 rounded-xl`}>
      {selectedItem && !isEditing && (
        <>
          <Image
            source={{ uri: selectedItem.imageUrl }}
            style={tw`w-full h-100 rounded mb-4 border border-black`}
          />
          <Text style={tw`text-xl font-bold`}>{selectedItem.type}</Text>
          <Text style={tw`text-base text-gray-600`}>{selectedItem.brand}</Text>
          <Text style={tw`text-sm text-gray-500 mt-2`}>Couleur : {selectedItem.color}</Text>
          <Text style={tw`text-sm text-gray-500`}>Style : {selectedItem.style || "N/A"}</Text>
          <Text style={tw`text-sm text-gray-500`}>Saison : {selectedItem.season || "N/A"}</Text>
          <Text style={tw`text-sm text-gray-500`}>Ajouté le : {new Date(selectedItem.createdAt).toLocaleDateString()}</Text>

          <View style={tw`mt-4`}>
            <TouchableOpacity style={tw`bg-blue-500 p-3 rounded mb-2`} onPress={() => setIsEditing(true)}>
              <Text style={tw`text-center text-white`}>Modifier</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={tw`bg-red-500 p-3 rounded`}
              onPress={async () => {
                Alert.alert("Confirmation", "Supprimer ce vêtement ?", [
                  { text: "Annuler" },
                  {
                    text: "Supprimer",
                    onPress: async () => {
                      try {
                        await axios.delete(`http://localhost:4001/api/clothing/${selectedItem.id}`, {
                          headers: { Authorization: "Bearer " + userToken },
                        });
                        fetchClothingItems();
                        closeModal();
                      } catch (err) {
                        Alert.alert("Erreur", "Échec de la suppression.");
                      }
                    },
                    style: "destructive",
                  },
                ]);
              }}
            >
              <Text style={tw`text-center text-white`}>Supprimer</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={closeModal} style={tw`mt-4`}>
              <Text style={tw`text-center text-gray-500`}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {selectedItem && isEditing && (
        <>
          <Text style={tw`text-xl font-bold mb-4`}>Modifier Vêtement</Text>

          <Text style={tw`text-sm text-gray-500 mb-2`}>Marque :</Text>
          <TextInput
            value={selectedItem.brand}
            onChangeText={(text) => setSelectedItem({ ...selectedItem, brand: text })}
            style={tw`border border-gray-300 p-2 rounded mb-3`}
            placeholder="Marque"
          />

          <Text style={tw`text-sm text-gray-500 mb-2`}>Type de vêtement :</Text>
          <TextInput
            value={selectedItem.type}
            onChangeText={(text) => setSelectedItem({ ...selectedItem, type: text })}
            style={tw`border border-gray-300 p-2 rounded mb-3`}
            placeholder="Type de vêtement"
          />

          <Text style={tw`text-sm text-gray-500 mb-2`}>Couleur :</Text>
          <TextInput
            value={selectedItem.color}
            onChangeText={(text) => setSelectedItem({ ...selectedItem, color: text })}
            style={tw`border border-gray-300 p-2 rounded mb-3`}
            placeholder="Couleur"
          />

          <Text style={tw`text-sm text-gray-500 mb-2`}>Style (optionnel) :</Text>
          <TextInput
            value={selectedItem.style || ""}
            onChangeText={(text) => setSelectedItem({ ...selectedItem, style: text })}
            placeholder="Style (optionnel)"
            style={tw`border border-gray-300 p-2 rounded mb-3`}
          />

          <Text style={tw`text-sm text-gray-500 mb-2`}>Saison (optionnel) :</Text>
          <TextInput
            value={selectedItem.season || ""}
            onChangeText={(text) => setSelectedItem({ ...selectedItem, season: text })}
            placeholder="Saison (optionnel)"
            style={tw`border border-gray-300 p-2 rounded mb-3`}
          />
          
          <TouchableOpacity
            style={tw`bg-green-500 p-3 rounded`}
            onPress={async () => {
              try {
                await axios.put(`http://localhost:4001/api/clothing/${selectedItem.id}`, selectedItem, {
                  headers: { Authorization: "Bearer " + userToken },
                });
                fetchClothingItems();
                closeModal();
              } catch (err) {
                Alert.alert("Erreur", "Échec de la modification.");
              }
            }}
          >
            <Text style={tw`text-center text-white`}>Enregistrer</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsEditing(false)} style={tw`mt-4`}>
            <Text style={tw`text-center text-gray-500`}>Annuler</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  </View>
</Modal>
<Modal visible={uploading || recommending} transparent animationType="fade">
  <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
    <ActivityIndicator size="large" color="#ffffff" />
    <Text style={tw`text-white mt-4`}>
      {uploading ? "Ajout du vêtement en cours..." : "Génération de la recommandation..."}
    </Text>
  </View>
</Modal>

    </View>
  );
}
import React, { useState, useContext, useEffect } from "react";
import {
  View, Text, TouchableOpacity, Alert, Image, FlatList, Modal,
  ScrollView, TextInput, ActivityIndicator, LayoutAnimation, Platform, UIManager, Animated, Easing
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import tw from "twrnc";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';

export default function DressingScreen() {
  const [clothingItems, setClothingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userTokens, setUserTokens] = useState(0);
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
    fetchUserTokens();

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

  // Rafraîchir les données à chaque fois qu'on revient sur l'écran
  useFocusEffect(
    React.useCallback(() => {
      fetchClothingItems();
      fetchUserTokens();
    }, [userId, userToken])
  );

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
      const response = await axios.get('http://localhost:8081/bdd/api/clothing', {
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

  const fetchUserTokens = async () => {
    try {
      const response = await axios.get(`http://localhost:8081/bdd/api/users/${userId}`, {
        headers: { Authorization: "Bearer " + userToken },
      });
      setUserTokens(response.data.aiTokens || 0);
    } catch (error) {
      console.log("Erreur récupération tokens:", error);
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
        await axios.post("http://localhost:8081/ia/analyze", formData, {
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
      const response = await axios.post(
        "http://localhost:8081/ia/recommendation",
        {
          userId,
          style,
          weather,
        },
        {
          headers: {
            Authorization: "Bearer " + userToken,
          },
        }
      );
  
      // Gère les cas "erreur métier" (plus de tokens, pas de vêtements, etc.)
      if (response.data.error || response.data.success === false) {
        console.log("⚠️ Erreur recommandation:", response.data.error);
        setSuggestedIds([]);
        setSuggestionText(null);
        return; // Pas de message, pas de blocage
      }
  
      // Cas normal : on a une recommandation !
      console.log("🎯 Recommandation reçue:", response.data);
      console.log("🎯 IDs sélectionnés:", response.data.selectedItemIds);
      console.log("🎯 Nombre d'IDs:", response.data.selectedItemIds?.length || 0);
      setSuggestedIds(response.data.selectedItemIds);
      setSuggestionText(response.data.recommendation);
      
      // Pas d'alerte automatique, l'utilisateur utilise le bouton "Valider"
    } catch (err) {
      // Ici, c'est vraiment une erreur technique (réseau, crash serveur, etc.)
      console.error("Erreur recommendation:", err.response?.data || err.message);
      setSuggestedIds([]);
      setSuggestionText(null);
    } finally {
      setRecommending(false);
    }
  };

  // Fonction pour valider et créer l'outfit
  const handleValidateOutfit = async () => {
    if (suggestedIds.length === 0) {
      Alert.alert("Erreur", "Aucune tenue suggérée à valider.");
      return;
    }

    try {
      console.log("🔄 Création de l'outfit...");
      console.log("📋 IDs des vêtements:", suggestedIds);
      console.log("📋 Nombre d'IDs:", suggestedIds.length);
      console.log("🔑 Token:", userToken ? "Présent" : "Absent");
      
      // Vérifier que les IDs existent dans la base
      const filtered = clothingItems.filter((item) => suggestedIds.includes(item.id));
      console.log("✅ Vêtements trouvés dans la base:", filtered.length);
      console.log("✅ Vêtements:", filtered.map(item => ({ id: item.id, type: item.type, brand: item.brand })));
      
      const outfitData = {
        clothingIds: suggestedIds,
        name: `Tenue ${selectedStyle} du ${new Date().toLocaleDateString()}`,
      };
      console.log("📦 Données à envoyer:", outfitData);
      
      const result = await axios.post(
        "http://localhost:8081/bdd/api/outfits",
        outfitData,
        {
          headers: { Authorization: "Bearer " + userToken },
        }
      );
      console.log("✅ Outfit créé avec succès:", result.data);
      
      // Réinitialiser la suggestion
      setSuggestedIds([]);
      setSuggestionText("");
      
      // Rafraîchir les tokens après création d'outfit
      fetchUserTokens();
      
      Alert.alert("Succès", `Tenue enregistrée avec succès ! (${suggestedIds.length} vêtements)`);
    } catch (err) {
      console.error("❌ Erreur enregistrement outfit:", err);
      console.error("❌ Status:", err.response?.status);
      console.error("❌ Data:", err.response?.data);
      console.error("❌ Message:", err.message);
      Alert.alert("Erreur", `Impossible d'enregistrer la tenue.\n${err.response?.data?.error || err.message}`);
    }
  };

  const uniqueValues = (key) => {
    const values = clothingItems.map((item) => item[key]).filter(Boolean);
    return [...new Set(values)];
  };
  
  const types = uniqueValues("type");
  const colors = uniqueValues("color");
  const seasons = uniqueValues("season");
  const styles = uniqueValues("style");
  

  const filteredClothingItems = clothingItems.filter((item) => {
    const { type, color, season, style } = filters;
    return (
      (type === "" || item.type === type) &&
      (color === "" || item.color === color) &&
      (season === "" || item.season === season) &&
      (style === "" || item.style === style)
    );
  });
  
  

  // HEADER HERO
  const renderHeader = () => (
    <LinearGradient
      colors={["#f3e7e9", "#a7bfff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={tw`rounded-b-3xl pb-6 px-4 pt-2 mb-2`}
    >
      <View style={tw`flex-row items-center justify-between mt-2`}>
        <View style={tw`flex-row items-center`}>
          <Ionicons name="ios-archive" size={36} color="#6366F1" style={tw`mr-2`} />
          <Text style={tw`text-3xl font-extrabold text-gray-900`}>Mon Dressing</Text>
        </View>
        <View style={tw`ml-2 bg-white rounded-full p-2 shadow-sm`}>
          <Ionicons name="person" size={26} color="#6366F1" />
        </View>
      </View>
      <Text style={tw`text-base text-gray-500 mt-4 ml-1`}>Ta garde-robe virtuelle, stylée et intelligente 👗✨</Text>
    </LinearGradient>
  );

  // CARTE SUGGESTION IA
  const renderSuggestion = () => {
    const filtered = clothingItems.filter((item) => suggestedIds.includes(item.id));
    console.log("🎨 Rendu suggestion - IDs demandés:", suggestedIds);
    console.log("🎨 Rendu suggestion - Vêtements trouvés:", filtered.length);
    console.log("🎨 Rendu suggestion - Vêtements:", filtered.map(item => ({ id: item.id, type: item.type })));
    return (
      <LinearGradient
        colors={["#a7bfff", "#f3e7e9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={tw`rounded-2xl p-5 mb-4 shadow-lg`}
      >
        <TouchableOpacity onPress={() => { setSuggestedIds([]); setSuggestionText(""); }} style={tw`absolute right-3 top-3 z-10`}>
          <Ionicons name="close" size={26} color="#6366F1" />
        </TouchableOpacity>
        <View style={tw`flex-row items-center mb-2`}>
          <Text style={tw`text-2xl mr-2`}>🪄</Text>
          <Text style={tw`text-lg font-bold text-blue-900`}>Tenue suggérée</Text>
        </View>
        <Text style={tw`italic text-base mb-2 text-gray-700`}>{suggestionText}</Text>
        <FlatList
          horizontal
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={tw`mr-3 items-center`}>
              <Image source={{ uri: item.imageUrl }} style={tw`w-28 h-28 rounded-2xl border-2 border-blue-200`} resizeMode="cover" />
              <Text style={tw`text-sm mt-1 font-semibold text-blue-900`}>
                {item.type}{item.brand ? ` - ${item.brand}` : ''}
              </Text>
            </View>
          )}
          showsHorizontalScrollIndicator={false}
        />
        <TouchableOpacity 
          style={tw`mt-4 bg-green-500 py-2 px-6 rounded-full self-center shadow`}
          onPress={handleValidateOutfit}
        >
          <Text style={tw`text-white font-bold text-base`}>Valider la tenue</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  };

  // CHIPS FILTRES COLORÉES
  const FilterButton = ({ label, value, selected, onPress }) => (
    <TouchableOpacity
      onPress={() => onPress(selected ? "" : value)}
      style={tw`px-4 py-2 rounded-full mr-2 mb-2 ${selected ? "bg-blue-500" : "bg-blue-100"}`}
    >
      <Text style={tw`${selected ? "text-white" : "text-blue-800"} text-sm font-semibold`}>{label}</Text>
    </TouchableOpacity>
  );

  // CARTE VÊTEMENT
  const renderClothingCard = ({ item }) => {
    const isSuggested = suggestedIds.includes(item.id);
    return (
      <View style={tw`flex-1 justify-center items-center mb-4`}>
        <TouchableOpacity
          style={tw`h-52 w-45 items-center mb-4 p-2 rounded-2xl bg-white shadow-lg ${isSuggested ? "border-2 border-green-400" : "border border-gray-200"}`}
          onPress={() => openModal(item)}
          activeOpacity={0.85}
        >
          <Image source={{ uri: item.imageUrl }} style={tw`w-28 h-28 mb-2 rounded-xl`} resizeMode="cover" />
          <Text style={tw`font-bold text-base text-center text-blue-900`}>{item.type.toUpperCase()}</Text>
          {item.brand && <Text style={tw`text-xs text-gray-500`}>{item.brand}</Text>}
          <View style={tw`flex-row flex-wrap flex-row justify-center items-center mt-1 w-full`}>
            {item.style && <Tag label={item.style} color="#fce7f3" textColor="#db2777" />}
            {item.season && <Tag label={item.season} color="#d1fae5" textColor="#059669" />}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // BOUTONS FLOTTANTS
  const renderFloatingButtons = () => (
    <View style={tw`absolute bottom-2 right-6 flex-row gap-3 z-50`}>
      <TouchableOpacity 
        style={tw`bg-black w-16 h-16 rounded-full justify-center items-center shadow-xl border-2 border-white`} 
        onPress={pickAndSendImage}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
      <TouchableOpacity 
        style={tw`${userTokens > 0 ? 'bg-blue-600' : 'bg-gray-400'} w-16 h-16 rounded-full justify-center items-center shadow-xl border-2 border-white relative`} 
        onPress={() => {
          if (userTokens > 0) {
            setStyleModalVisible(true);
          } else {
            // Indicateur visuel simple
            console.log("Plus de tokens disponibles");
          }
        }}
      >
        <Ionicons name="sparkles-outline" size={28} color="white" />
        <View style={tw`absolute -top-1 -right-1 ${userTokens > 0 ? 'bg-green-500' : 'bg-red-500'} w-6 h-6 rounded-full justify-center items-center`}>
          <Text style={tw`text-white text-xs font-bold`}>{userTokens}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  // Ajout du composant Tag réutilisable
  const Tag = ({ label, color, textColor }) => (
    <View style={[
      tw`px-2 py-0.5 rounded-full mr-1 mb-1`,
      { backgroundColor: color || "#e0e7ff" }
    ]}>
      <Text style={[
        tw`text-xs font-semibold`,
        { color: textColor || "#3730a3" }
      ]}>{label}</Text>
    </View>
  );

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <View style={tw`pt-12 pb-2 items-center bg-gray-50`}>
        <Text style={tw`text-2xl font-bold text-gray-900 mb-2`}>Mon Dressing</Text>
      </View>
      <FlatList
        data={filteredClothingItems}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={renderClothingCard}
        refreshing={loading}
        onRefresh={() => {
          fetchClothingItems();
          fetchUserTokens();
        }}
        ListHeaderComponent={
          <>
            {suggestedIds.length > 0 && renderSuggestion()}
            <TouchableOpacity
              onPress={toggleFilters}
              style={tw`mb-3 bg-blue-50 w-45 px-4 py-2 rounded-full flex-row items-center gap-2 self-start`}
            >
              <Text style={tw`text-sm text-blue-900 font-semibold`}>
                {showFilters ? "Masquer les filtres" : "Afficher les filtres"}
              </Text>
              <Animated.View style={rotateStyle}>
                <Ionicons name="chevron-down" size={16} color="#6366F1" />
              </Animated.View>
            </TouchableOpacity>
            {showFilters && (
              <View style={tw`p-4 mb-6 bg-blue-50 rounded-lg`}>
                <Text style={tw`text-sm font-semibold mb-1 text-blue-900`}>Type :</Text>
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
                <Text style={tw`text-sm font-semibold mb-1 text-blue-900`}>Couleur :</Text>
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
                <Text style={tw`text-sm font-semibold mt-3 mb-1 text-blue-900`}>Saison :</Text>
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
                <Text style={tw`text-sm font-semibold mt-3 mb-1 text-blue-900`}>Style :</Text>
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
              </View>
            )}
          </>
        }
        contentContainerStyle={tw`pb-48 px-2`}
      />
      {renderFloatingButtons()}
      <Modal visible={modalVisible} transparent animationType="slide">
          <View style={tw`flex-1 justify-center items-center bg-black/60`}>
    <View style={tw`bg-white w-11/12 p-5 rounded-xl`}>
      {selectedItem && !isEditing && (
        <>
          <Image
            source={{ uri: selectedItem.imageUrl }}
            style={tw`w-full h-100 rounded mb-4 border border-black`}
          />
          <Text style={tw`text-xl font-bold`}>{selectedItem.type}</Text>
          <Text style={tw`text-base text-gray-600`}>{selectedItem.brand}</Text>
          {/* Tags harmonisés */}
          <View style={tw`flex-row flex-wrap mt-3 mb-2`}>
            {selectedItem.color && <Tag label={selectedItem.color} color="#dbeafe" textColor="#2563eb" />}
            {selectedItem.style && <Tag label={selectedItem.style} color="#fce7f3" textColor="#db2777" />}
            {selectedItem.season && <Tag label={selectedItem.season} color="#d1fae5" textColor="#059669" />}
          </View>
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
                        await axios.delete(`http://localhost:8081/bdd/api/clothing/${selectedItem.id}`, {
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
                await axios.put(`http://localhost:8081/bdd/api/clothing/${selectedItem.id}`, selectedItem, {
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
  <View style={tw`flex-1 justify-center items-center bg-black/50`}>
    <ActivityIndicator size="large" color="#ffffff" />
    <Text style={tw`text-white mt-4`}>
      {uploading ? "Ajout du vêtement en cours..." : "Génération de la recommandation..."}
    </Text>
  </View>
</Modal>

{/* Modal de sélection de style */}
<Modal visible={styleModalVisible} transparent animationType="slide">
  <View style={tw`flex-1 justify-center items-center bg-black/50`}>
    <View style={tw`bg-white p-6 rounded-lg w-80 max-h-96`}>
      <Text style={tw`text-xl font-bold mb-4 text-center`}>Choisis ton style</Text>
      
      <ScrollView style={tw`max-h-64`}>
        {["casual", "sport", "elegant", "business", "streetwear", "vintage", "minimaliste", "coloré"].map((style) => (
          <TouchableOpacity
            key={style}
            style={tw`p-3 mb-2 rounded-lg border ${
              selectedStyle === style ? "bg-blue-500 border-blue-500" : "bg-gray-50 border-gray-200"
            }`}
            onPress={() => {
              setSelectedStyle(style);
              launchRecommendation(style);
            }}
          >
            <Text style={tw`text-center font-semibold ${
              selectedStyle === style ? "text-white" : "text-gray-700"
            }`}>
              {style.charAt(0).toUpperCase() + style.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <TouchableOpacity
        style={tw`mt-4 p-3 bg-gray-300 rounded-lg`}
        onPress={() => setStyleModalVisible(false)}
      >
        <Text style={tw`text-center font-semibold text-gray-700`}>Annuler</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

    </View>
  );
}
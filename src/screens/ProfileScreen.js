import { View, Text, Image, TouchableOpacity, ScrollView, Alert, TextInput, SafeAreaView, Modal, Linking } from "react-native";
import { Picker } from "@react-native-picker/picker";
import tw from "twrnc";
import { AuthContext } from "../context/AuthContext";
import React, { useEffect, useState, useContext } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";

const ProfileScreen = () => {
    const { logout, userId, userToken } = useContext(AuthContext);
    const [userData, setUserData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState({});
    const [showMore, setShowMore] = useState(false);
    const [tokenModalVisible, setTokenModalVisible] = useState(false);
    const [selectedTokenPack, setSelectedTokenPack] = useState(null);
    const [paymentLoading, setPaymentLoading] = useState(false);

    // Options pour les sélecteurs
    const genres = ["Homme", "Femme", "Autre"];
    const morphologies = ["A", "V", "H", "O", "X"];
    
    // Packs de tokens disponibles
    const tokenPacks = [
      { id: "pack_5", tokens: 5, price: 4.99, priceId: "price_1Rhx9yBBKItnJKUIM5zOBJnJ", popular: false },
      { id: "pack_10", tokens: 10, price: 8.99, priceId: "price_1RhxHLBBKItnJKUIJvaGnwex", popular: true },
      { id: "pack_25", tokens: 25, price: 19.99, priceId: "price_1RhxHrBBKItnJKUIq21KbunH", popular: false },
    ];

    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:8081/bdd/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });
        setUserData(response.data);
        setEditedData(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur :", error);
      }
    };

    useEffect(() => {
      if (userId && userToken) {
        fetchUser();
      }
    }, [userId, userToken]);

    // Rafraîchir les données à chaque fois qu'on revient sur l'écran
    useFocusEffect(
      React.useCallback(() => {
        if (userId && userToken) {
          fetchUser();
        }
      }, [userId, userToken])
    );
    
    const handleLogout = async () => {
        await logout();
        console.log("Déconnexion réussie !");
    };

    const handleSaveProfile = async () => {
      try {
        const response = await axios.put(`http://localhost:8081/bdd/api/users/${userId}`, editedData, {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });
        setUserData(response.data);
        setEditedData(response.data);
        setIsEditing(false);
        Alert.alert("Succès", "Profil mis à jour avec succès !");
      } catch (error) {
        console.error("Erreur mise à jour profil:", error);
        Alert.alert("Erreur", "Impossible de mettre à jour le profil.");
      }
    };

    const handleTokenPurchase = async (pack) => {
      setPaymentLoading(true);
      try {
        console.log("🔄 Début de l'achat de tokens...", pack);
        
        // Créer une session de paiement Stripe
        const response = await axios.post(
          "http://localhost:8081/payment/api/payment/checkout",
          {
            userId: userId,
            priceId: pack.priceId,
            tokenAmount: pack.tokens
          },
          {
            headers: { Authorization: "Bearer " + userToken }
          }
        );
        
        console.log("✅ Session de paiement créée:", response.data);
        
        if (response.data.url) {
          // Ouvrir l'URL de paiement Stripe
          try {
            await Linking.openURL(response.data.url);
            
            // En développement, ajouter les tokens manuellement après 10 secondes
            setTimeout(async () => {
              try {
                console.log("🔄 Simulation webhook - ajout des tokens...");
                const updateResponse = await axios.put(
                  `http://localhost:8081/bdd/api/users/${userId}/reset-tokens`,
                  {
                    aiTokens: pack.tokens,
                    lastTokenReset: new Date()
                  },
                  {
                    headers: { Authorization: "Bearer " + userToken }
                  }
                );
                console.log("✅ Tokens ajoutés:", updateResponse.data);
                fetchUser(); // Recharger les données
                Alert.alert("Succès", `${pack.tokens} tokens ajoutés à votre compte !`);
              } catch (error) {
                console.error("❌ Erreur simulation webhook:", error);
                Alert.alert("Info", "Vérifiez votre profil pour voir si les tokens ont été ajoutés.");
              }
            }, 10000);
            
          } catch (error) {
            console.error("❌ Erreur ouverture URL Stripe:", error);
            Alert.alert("Erreur", "Impossible d'ouvrir la page de paiement.");
          }
        }
      } catch (error) {
        console.error("❌ Erreur achat tokens:", error);
        Alert.alert(
          "Erreur", 
          "Impossible de procéder au paiement.\n" + (error.response?.data?.error || error.message)
        );
      } finally {
        setPaymentLoading(false);
      }
    };

    const handleDeleteAccount = async () => {
        try {
          Alert.alert(
            "Confirmation",
            "Êtes-vous sûr de vouloir supprimer votre compte ?",
            [
              {
                text: "Annuler",
                style: "cancel",
              },
              {
                text: "Supprimer",
                onPress: async () => {
                  try {
                    const response = await axios.delete(`http://localhost:8081/bdd/api/users/${userId}`,
                      {
                        headers: {
                          Authorization: `Bearer ${userToken}`,
                        },
                      }
                    );
                    console.log("Réponse de l'API :", response.data);
                    Alert.alert("Succès", "Compte supprimé avec succès !");
                    await logout();
                  } catch (error) {
                    console.error(error);
                    Alert.alert("Erreur", "Problème de connexion au serveur.");
                  }
                },
              },
            ]
          );
        } catch (error) {
          console.error(error);
          Alert.alert("Erreur", "Problème de connexion au serveur.");
        }
      };

    const renderField = (label, value, key, type = "text", options = null) => {
      if (isEditing) {
        if (type === "picker" && options) {
                  return (
          <View style={tw`mb-4`}>
            <Text style={tw`text-sm font-semibold text-gray-800 mb-2`}>{label}</Text>
            <View style={tw`bg-white border border-gray-300 rounded-2xl overflow-hidden shadow-sm`}>
              <Picker
                selectedValue={editedData[key] || ""}
                onValueChange={(value) => setEditedData({...editedData, [key]: value})}
                style={tw`h-14 text-gray-900`}
              >
                <Picker.Item label={`Sélectionner ${label}`} value="" color="#6b7280" />
                {options.map(option => (
                  <Picker.Item key={option} label={option} value={option} color="#1f2937" />
                ))}
              </Picker>
            </View>
          </View>
        );
        }
        
        return (
          <View style={tw`mb-4`}>
            <Text style={tw`text-sm font-semibold text-gray-800 mb-2`}>{label}</Text>
            <TextInput
              value={editedData[key]?.toString() || ""}
              onChangeText={(text) => setEditedData({...editedData, [key]: text})}
              style={tw`bg-white border border-gray-300 rounded-2xl p-4 text-base text-gray-900`}
              keyboardType={type === "numeric" ? "numeric" : "default"}
              placeholder={`Entrez ${label.toLowerCase()}`}
              placeholderTextColor="#6b7280"
            />
          </View>
        );
      }
      
      return (
        <View style={tw`mb-4`}>
          <Text style={tw`text-sm font-semibold text-gray-800 mb-2`}>{label}</Text>
          <View style={tw`bg-white rounded-2xl p-4 border border-gray-200 shadow-sm`}>
            <Text style={tw`text-base text-gray-900`}>
              {value || "Non renseigné"}
            </Text>
          </View>
        </View>
      );
    };

    const renderArrayField = (label, array, key) => {
      if (isEditing) {
        return (
          <View style={tw`mb-4`}>
            <Text style={tw`text-sm font-semibold text-gray-800 mb-2`}>{label}</Text>
            <TextInput
              value={editedData[key]?.join(", ") || ""}
              onChangeText={(text) => setEditedData({...editedData, [key]: text.split(", ").filter(item => item.trim())})}
              style={tw`bg-white border border-gray-300 rounded-2xl p-4 text-base text-gray-900`}
              placeholder={`Entrez ${label.toLowerCase()} séparés par des virgules`}
              placeholderTextColor="#6b7280"
            />
          </View>
        );
      }
      
      return (
        <View style={tw`mb-4`}>
          <Text style={tw`text-sm font-semibold text-gray-800 mb-2`}>{label}</Text>
          <View style={tw`bg-white rounded-2xl p-4 border border-gray-200 shadow-sm`}>
            <Text style={tw`text-base text-gray-900`}>
              {array && array.length > 0 ? array.join(", ") : "Aucun"}
            </Text>
          </View>
        </View>
      );
    };

  return (
            <View style={tw`flex-1 bg-blue-50`}>
      <ScrollView style={tw`flex-1`} contentContainerStyle={tw`pb-8`} showsVerticalScrollIndicator={false}>
        {/* Header moderne avec gradient */}
        <SafeAreaView edges={["top"]} style={tw`bg-transparent`}>
          <View style={tw`pt-12 pb-6 items-center`}>
            <Text style={tw`text-3xl font-bold text-gray-900 mb-1`}>Mon Profil</Text>
            <Text style={tw`text-gray-600`}>{userData?.email}</Text>
          </View>
        </SafeAreaView>

        {/* Section Tokens IA - Design moderne */}
        <View style={tw`mx-4 mb-6`}>
          <View style={tw`bg-blue-200 rounded-3xl p-6 shadow-xl`}>
            <View style={tw`flex-row items-center justify-between mb-4`}>
              <View style={tw`flex-row items-center`}>
                <View style={tw`w-12 h-12 bg-blue-300 rounded-full items-center justify-center mr-3`}>
                  <Ionicons name="sparkles" size={24} color="#2563eb" />
                </View>
                <View>
                  <Text style={tw`text-lg font-semibold `}>Tokens IA</Text>
                  <Text style={tw`text-blue-500 text-sm`}>Recommandations disponibles</Text>
                </View>
              </View>
                              <View style={tw`bg-blue-300 rounded-full px-4 py-2`}>
                <Text style={tw`text-lg font-bold text-blue-700`}>{userData?.aiTokens ?? "0"}</Text>
              </View>
            </View>
            <TouchableOpacity
                              style={tw`bg-blue-300 rounded-xl py-3 items-center border border-white/30`}
              onPress={() => setTokenModalVisible(true)}
            >
              <Text style={tw`text-blue-700 font-semibold text-lg`}>Acheter des tokens</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section Informations - Design moderne */}
        <View style={tw`mx-4 mb-6`}>
          <View style={tw`bg-white rounded-3xl shadow-lg overflow-hidden`}>
            <View style={tw`bg-gray-100 px-6 py-4 border-b border-gray-200`}>
              <View style={tw`flex-row items-center justify-between`}>
                <Text style={tw`text-xl font-bold text-gray-900`}>Informations</Text>
                <TouchableOpacity
                  style={tw`bg-blue-600 px-3 py-2 rounded-full shadow-sm`}
                  onPress={isEditing ? handleSaveProfile : () => setIsEditing(true)}
                >
                  <Text style={tw`text-white font-semibold text-sm`}>
                    {isEditing ? "💾 Sauvegarder" : "✏️ Modifier"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={tw`p-6`}>
              {/* Informations principales */}
              <View style={tw`mb-6`}>
                <Text style={tw`text-lg font-semibold text-gray-800 mb-4`}>Informations principales</Text>
                <View style={tw`gap-4`}>
                  {renderField("Email", userData?.email, "email")}
                  {renderField("Genre", userData?.genre, "genre", "picker", genres)}
                  {renderField("Âge", userData?.age, "age", "numeric")}
                  {renderField("Ville", userData?.ville, "ville")}
                </View>
              </View>

              {/* Bouton voir plus */}
              <TouchableOpacity 
                onPress={() => setShowMore(!showMore)} 
                style={tw`bg-blue-50 rounded-xl p-3 items-center border border-blue-200`}
              >
                <View style={tw`flex-row items-center`}>
                  <Ionicons name={showMore ? "chevron-up" : "chevron-down"} size={18} color="#2563eb" />
                  <Text style={tw`text-blue-700 font-semibold ml-2 text-sm`}>
                    {showMore ? "Masquer les détails" : "Voir plus de détails"}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Informations détaillées */}
              {showMore && (
                <View style={tw`mt-6 gap-4`}> 
                  <Text style={tw`text-lg font-semibold text-gray-800 mb-4`}>Détails personnels</Text>
                  {renderField("Taille (cm)", userData?.taille, "taille", "numeric")}
                  {renderField("Poids (kg)", userData?.poids, "poids", "numeric")}
                  {renderField("Morphologie", userData?.morphologie, "morphologie", "picker", morphologies)}
                  {renderArrayField("Styles préférés", userData?.stylesPreferes, "stylesPreferes")}
                  {renderArrayField("Couleurs et motifs favoris", userData?.couleursMotifs, "couleursMotifs")}
                  {renderField("Restrictions", userData?.restrictions, "restrictions")}
                </View>
              )}

              {/* Bouton annuler si en mode édition */}
              {isEditing && (
                <TouchableOpacity
                  style={tw`bg-gray-100 rounded-xl py-2 items-center mt-4 border border-gray-300`}
                  onPress={() => { setIsEditing(false); setEditedData(userData); }}
                >
                  <Text style={tw`text-gray-800 font-semibold text-sm`}>Annuler les modifications</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Section Actions - Design moderne */}
        <View style={tw`mx-4 mb-6`}>
          <View style={tw`bg-white rounded-3xl shadow-lg overflow-hidden`}>
                        <View style={tw`bg-gray-100 px-6 py-4 border-b border-gray-200`}>
              <Text style={tw`text-xl font-bold text-gray-900`}>Actions</Text>
            </View>
            
            <View style={tw`p-6`}>
              <TouchableOpacity
                style={tw`rounded-xl py-3 items-center shadow-lg bg-blue-500/20 border border-blue-500 mb-4`}
                onPress={handleLogout}
              >
                <View style={tw`flex-row items-center`}>
                  <Ionicons name="log-out-outline" size={18} style={tw`mr-2`} color="#2563eb" />
                  <Text style={tw`text-blue-500 font-semibold text-base`}>Se déconnecter</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={tw`bg-red-50 rounded-xl py-3 items-center border border-red-300`} 
                onPress={handleDeleteAccount}
              >
                <View style={tw`flex-row items-center`}>
                  <Ionicons name="trash-outline" size={18} color="#dc2626" style={tw`mr-2`} />
                  <Text style={tw`text-red-700 font-semibold text-base`}>Supprimer le compte</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal de sélection des tokens - Design moderne */}
              <Modal visible={tokenModalVisible} transparent animationType="slide">
          <View style={tw`flex-1 justify-center items-center bg-black/60 px-4`}>
            <View style={tw`bg-white rounded-3xl w-full max-w-sm shadow-2xl`}>
              {/* Header du modal */}
              <View style={tw`bg-blue-500 rounded-t-3xl px-4 py-3`}>
                <View style={tw`flex-row items-center justify-between`}>
                  <View>
                    <Text style={tw`text-lg font-bold text-white`}>Pack de Tokens</Text>
                    <Text style={tw`text-blue-100 text-xs`}>Choisissez votre pack</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setTokenModalVisible(false)}
                    style={tw`w-6 h-6 bg-white/20 rounded-full items-center justify-center`}
                  >
                    <Ionicons name="close" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Contenu du modal */}
              <View style={tw`p-4`}>
                <View style={tw`gap-3`}>
                  {tokenPacks.map((pack) => (
                    <TouchableOpacity
                      key={pack.id}
                      style={tw`my-1 rounded-lg border-2 overflow-hidden shadow-sm ${
                        selectedTokenPack?.id === pack.id 
                          ? "border-blue-500 bg-blue-50" 
                          : "border-gray-200 bg-white"
                      } ${pack.popular ? "border-yellow-400 bg-yellow-50" : ""}`}
                      onPress={() => setSelectedTokenPack(pack)}
                      disabled={paymentLoading}
                    >
                      <View style={tw`p-3`}>
                        <View style={tw`flex-row justify-between items-center`}>
                          <View style={tw`flex-1`}>
                            <View style={tw`flex-row items-center mb-1`}>
                              <Text style={tw`text-base font-bold text-gray-900`}>
                                {pack.tokens} tokens
                              </Text>
                              {pack.popular && (
                                <View style={tw`bg-yellow-400 px-2 py-1 rounded-full ml-2`}>
                                  <Text style={tw`text-xs font-bold text-white`}>⭐ POPULAIRE</Text>
                                </View>
                              )}
                            </View>
                            <Text style={tw`text-lg font-bold text-blue-600`}>
                              {pack.price}€
                            </Text>
                            <Text style={tw`text-xs text-gray-600`}>
                              {(pack.price / pack.tokens).toFixed(2)}€ par token
                            </Text>
                          </View>
                          <View style={tw`items-end justify-center`}>
                            <View style={tw`w-5 h-5 rounded-full border-2 items-center justify-center ${
                              selectedTokenPack?.id === pack.id 
                                ? "border-blue-500 bg-blue-500" 
                                : "border-gray-300"
                            }`}>
                              {selectedTokenPack?.id === pack.id && (
                                <Ionicons name="checkmark" size={12} color="white" />
                              )}
                            </View>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
                
                {/* Boutons d'action */}
                <View style={tw`flex-row gap-3 mt-4`}>
                <TouchableOpacity
                  style={tw`flex-1 bg-gray-100 rounded-xl py-3 border border-gray-300 justify-center items-center`}
                  onPress={() => setTokenModalVisible(false)}
                  disabled={paymentLoading}
                >
                  <Text style={tw`text-center font-semibold text-gray-800 text-base`}>Annuler</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={tw`flex-1 bg-blue-500 rounded-xl py-3 shadow-lg justify-center items-center`}
                  onPress={() => selectedTokenPack && handleTokenPurchase(selectedTokenPack)}
                  disabled={!selectedTokenPack || paymentLoading}
                >
                  <Text style={tw`text-center font-semibold text-white text-base`}>
                    {paymentLoading ? "⏳ Chargement..." : `💳 Acheter (${selectedTokenPack?.price || 0}€)`}
                  </Text>
                </TouchableOpacity>
              </View>
              
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProfileScreen;

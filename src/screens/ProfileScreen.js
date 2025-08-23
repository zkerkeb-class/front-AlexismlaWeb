import { View, Text, Image, TouchableOpacity, ScrollView, Alert, TextInput, SafeAreaView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import tw from "twrnc";
import { AuthContext } from "../context/AuthContext";
import React, { useEffect, useState, useContext } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import axios from "axios";

const ProfileScreen = () => {
    const { logout, userId, userToken } = useContext(AuthContext);
    const [userData, setUserData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState({});
    const [showMore, setShowMore] = useState(false);

    // Options pour les sélecteurs
    const genres = ["Homme", "Femme", "Autre"];
    const morphologies = ["A", "V", "H", "O", "X"];

    useEffect(() => {
      const fetchUser = async () => {
        try {
          const response = await axios.get(`http://localhost:4001/api/users/${userId}`, {
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
    
      if (userId && userToken) {
        fetchUser();
      }
    }, [userId, userToken]);
    
    const handleLogout = async () => {
        await logout();
        console.log("Déconnexion réussie !");
    };

    const handleSaveProfile = async () => {
      try {
        const response = await axios.put(`http://localhost:4001/api/users/${userId}`, editedData, {
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
                    const response = await axios.delete(`http://localhost:4001/api/users/${userId}`,
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
              <Text style={tw`text-sm font-medium text-gray-700 mb-1`}>{label}</Text>
              <View style={tw`bg-gray-50 border border-gray-300 rounded-lg`}>
                <Picker
                  selectedValue={editedData[key] || ""}
                  onValueChange={(value) => setEditedData({...editedData, [key]: value})}
                  style={tw`h-12`}
                >
                  <Picker.Item label={`Sélectionner ${label}`} value="" />
                  {options.map(option => (
                    <Picker.Item key={option} label={option} value={option} />
                  ))}
                </Picker>
              </View>
            </View>
          );
        }
        
        return (
          <View style={tw`mb-4`}>
            <Text style={tw`text-sm font-medium text-gray-700 mb-1`}>{label}</Text>
            <TextInput
              value={editedData[key]?.toString() || ""}
              onChangeText={(text) => setEditedData({...editedData, [key]: text})}
              style={tw`bg-gray-50 border border-gray-300 rounded-lg p-3`}
              keyboardType={type === "numeric" ? "numeric" : "default"}
              placeholder={`Entrez ${label.toLowerCase()}`}
            />
          </View>
        );
      }
      
      return (
        <View style={tw`mb-4`}>
          <Text style={tw`text-sm font-medium text-gray-700 mb-1`}>{label}</Text>
          <Text style={tw`text-base text-gray-900`}>
            {value || "Non renseigné"}
          </Text>
        </View>
      );
    };

    const renderArrayField = (label, array, key) => {
      if (isEditing) {
        return (
          <View style={tw`mb-4`}>
            <Text style={tw`text-sm font-medium text-gray-700 mb-1`}>{label}</Text>
            <TextInput
              value={editedData[key]?.join(", ") || ""}
              onChangeText={(text) => setEditedData({...editedData, [key]: text.split(", ").filter(item => item.trim())})}
              style={tw`bg-gray-50 border border-gray-300 rounded-lg p-3`}
              placeholder={`Entrez ${label.toLowerCase()} séparés par des virgules`}
            />
          </View>
        );
      }
      
      return (
        <View style={tw`mb-4`}>
          <Text style={tw`text-sm font-medium text-gray-700 mb-1`}>{label}</Text>
          <Text style={tw`text-base text-gray-900`}>
            {array && array.length > 0 ? array.join(", ") : "Aucun"}
          </Text>
        </View>
      );
    };

  return (
    <ScrollView style={tw`flex-1 bg-gray-50`} contentContainerStyle={tw`pb-8`}>
      {/* Header avec SafeAreaView pour le titre */}
      <SafeAreaView edges={["top"]} style={tw`bg-gray-50`}>
        <View style={tw`pt-8 pb-3 items-center bg-gray-50`}>
          <Text style={tw`text-2xl font-bold text-gray-900 mb-2`}>Mon Profil</Text>
        </View>
      </SafeAreaView>

      {/* Compteur de tokens IA bien visible */}
      <View style={tw`mx-4 mb-4 flex-row items-center justify-center`}>
        <View style={tw`bg-blue-100 px-6 py-3 rounded-2xl shadow flex-row items-center`}>
          <Ionicons name="sparkles-outline" size={22} color="#2563eb" style={tw`mr-2`} />
          <Text style={tw`text-lg font-bold text-blue-700`}>Tokens IA : </Text>
          <Text style={tw`text-lg font-bold text-blue-900`}>{userData?.aiTokens ?? "..."}</Text>
        </View>
      </View>
      {/* Bouton acheter des tokens */}
      <View style={tw`mx-4 mb-2 flex-row items-center justify-center`}>
        <TouchableOpacity
          style={tw`bg-green-500 px-6 py-2 rounded-full shadow`}
          onPress={() => Alert.alert('Achat de tokens', 'Fonctionnalité à venir !')}
        >
          <Text style={tw`text-white font-semibold`}>Acheter des tokens</Text>
        </TouchableOpacity>
      </View>

      {/* Infos principales */}
      <View style={tw`bg-white mx-4 mb-4 rounded-2xl shadow p-5`}> 
        <Text style={tw`text-lg font-bold mb-4 text-gray-900`}>Informations principales</Text>
        {renderField("Email", userData?.email, "email")}
        {renderField("Genre", userData?.genre, "genre", "picker", genres)}
        {renderField("Âge", userData?.age, "age", "numeric")}
        {renderField("Ville", userData?.ville, "ville")}
        {/* Bouton voir plus */}
        <TouchableOpacity onPress={() => setShowMore(!showMore)} style={tw`mt-2 self-end`}>
          <Text style={tw`text-blue-600 font-semibold`}>{showMore ? "Voir moins" : "Voir plus"}</Text>
        </TouchableOpacity>
        {showMore && (
          <View style={tw`mt-4`}> 
            {renderField("Taille (cm)", userData?.taille, "taille", "numeric")}
            {renderField("Poids (kg)", userData?.poids, "poids", "numeric")}
            {renderField("Morphologie", userData?.morphologie, "morphologie", "picker", morphologies)}
            {renderArrayField("Styles préférés", userData?.stylesPreferes, "stylesPreferes")}
            {renderArrayField("Couleurs et motifs favoris", userData?.couleursMotifs, "couleursMotifs")}
            {renderField("Restrictions", userData?.restrictions, "restrictions")}
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={tw`bg-white mx-4 mb-4 rounded-2xl shadow p-5`}>
        <View style={tw`flex-row justify-between mb-2`}>
          <TouchableOpacity
            style={tw`px-5 py-2 rounded-full ${isEditing ? 'bg-green-500' : 'bg-blue-500'}`}
            onPress={isEditing ? handleSaveProfile : () => setIsEditing(true)}
          >
            <Text style={tw`text-white font-semibold`}>{isEditing ? "Enregistrer" : "Éditer le profil"}</Text>
          </TouchableOpacity>
          {isEditing && (
            <TouchableOpacity
              style={tw`px-5 py-2 rounded-full bg-gray-400 ml-2`}
              onPress={() => { setIsEditing(false); setEditedData(userData); }}
            >
              <Text style={tw`text-white font-semibold`}>Annuler</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={tw`bg-red-600 p-3 rounded-full w-full items-center mt-2`}
          onPress={handleLogout}
        >
          <Text style={tw`text-white font-semibold`}>Déconnexion</Text>
        </TouchableOpacity>
        <TouchableOpacity style={tw`flex-row items-center p-3 bg-red-50 rounded-lg mt-3 justify-center`} onPress={ handleDeleteAccount }>
          <Ionicons name="trash-outline" size={22} color="#ef4444" style={tw`mr-2`} />
          <Text style={tw`text-base text-red-600`}>Supprimer le compte</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;

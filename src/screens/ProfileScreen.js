import { View, Text, Image, TouchableOpacity, ScrollView, Alert } from "react-native";
import tw from "twrnc";
import { AuthContext } from "../context/AuthContext";
import React, { useEffect, useState, useContext } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import axios from "axios";


const ProfileScreen = () => {
    const { logout, userId, userToken } = useContext(AuthContext);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
      const fetchUser = async () => {
        try {
          const response = await axios.get("http://localhost:4000/api/auth/me", {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          });
          setUserData(response.data.user);
        } catch (error) {
          console.error("Erreur lors de la récupération de l'utilisateur :", error);
        }
      };
    
      fetchUser();
    }, []);
    
    const handleLogout = async () => {
        await logout();
        console.log("Déconnexion réussie !");
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
                    const response = await axios.delete(`http://localhost:4000/api/auth/delete/${userId}`,
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
      

  return (
    <ScrollView style={tw`flex-1 bg-white`}>
      {/* Header */}
      <View style={tw`bg-gray-100 p-6 items-center`}>
        <Image
          source={{ uri: "https://via.placeholder.com/100" }}
          style={tw`w-24 h-24 rounded-full mb-3`}
        />
        <Text style={tw`text-xl font-bold mb-1`}>
          {userData?.email || "Chargement..."}
        </Text>
        <Text style={tw`text-gray-500`}>
          {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : ""}
        </Text>
      </View>

      {/* Section Informations personnelles */}
      {/* <View style={tw`p-4`}>
        <Text style={tw`text-lg font-semibold mb-2`}>Informations personnelles</Text>
        <TouchableOpacity style={tw`flex-row items-center p-3 bg-gray-50 rounded-lg mb-2`}>
          <Ionicons name="person-outline" size={24} color="#333" style={tw`mr-2`} />
          <Text style={tw`text-base`}>Modifier le profil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={tw`flex-row items-center p-3 bg-gray-50 rounded-lg`}>
          <Ionicons name="lock-closed-outline" size={24} color="#333" style={tw`mr-2`} />
          <Text style={tw`text-base`}>Changer le mot de passe</Text>
        </TouchableOpacity>
      </View> */}

      {/* Section Paramètres */}
      {/* <View style={tw`p-4`}>
        <Text style={tw`text-lg font-semibold mb-2`}>Paramètres</Text>
        <TouchableOpacity style={tw`flex-row items-center p-3 bg-gray-50 rounded-lg mb-2`}>
          <Ionicons name="notifications-outline" size={24} color="#333" style={tw`mr-2`} />
          <Text style={tw`text-base`}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={tw`flex-row items-center p-3 bg-gray-50 rounded-lg`}>
          <Ionicons name="moon-outline" size={24} color="#333" style={tw`mr-2`} />
          <Text style={tw`text-base`}>Mode sombre</Text>
        </TouchableOpacity>
      </View> */}

      <View style={tw`p-4`}>
        <Text style={tw`text-lg font-semibold mb-2`}>Token : {userData?.aiTokens || "Chargement..."}</Text>
      </View>

      {/* Gestion du compte */}
      <View style={tw`p-4`}>
        <Text style={tw`text-lg font-semibold mb-2`}>Compte</Text>
        <TouchableOpacity style={tw`flex-row items-center p-3 bg-gray-50 rounded-lg`} onPress={ handleDeleteAccount }>
          <Ionicons name="trash-outline" size={24} color="#ff0000" style={tw`mr-2`} />
          <Text style={tw`text-base text-red-600`}>Supprimer le compte</Text>
        </TouchableOpacity>
      </View>

      {/* Bouton de déconnexion */}
      <View style={tw`p-4 items-center`}>
        <TouchableOpacity
          style={tw`bg-red-600 p-3 rounded-lg w-full items-center`}
          onPress={handleLogout}
        >
          <Text style={tw`text-white font-semibold`}>Déconnexion</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;

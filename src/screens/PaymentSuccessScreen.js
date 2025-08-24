import React, { useEffect, useContext } from "react";
import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import tw from "twrnc";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

export default function PaymentSuccessScreen() {
  const navigation = useNavigation();
  const { userId, userToken } = useContext(AuthContext);

  useEffect(() => {
    // Recharger les données utilisateur après le paiement
    const reloadUserData = async () => {
      try {
        // Ici on pourrait recharger les données utilisateur
        console.log("🔄 Rechargement des données utilisateur après paiement");
      } catch (error) {
        console.error("Erreur rechargement données:", error);
      }
    };

    reloadUserData();
  }, []);

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <View style={tw`flex-1 justify-center items-center px-6`}>
        <View style={tw`items-center mb-8`}>
          <View style={tw`w-20 h-20 bg-green-100 rounded-full justify-center items-center mb-4`}>
            <Ionicons name="checkmark" size={40} color="#10b981" />
          </View>
          <Text style={tw`text-3xl font-bold mb-2 text-green-600`}>Paiement réussi !</Text>
          <Text style={tw`text-lg text-gray-600 text-center`}>
            Merci pour ton achat ! Tes tokens ont été ajoutés à ton compte.
          </Text>
        </View>
        
        <TouchableOpacity
          style={tw`bg-blue-600 px-8 py-4 rounded-xl shadow-lg`}
          onPress={() => navigation.navigate("Main")}
        >
          <Text style={tw`text-white font-semibold text-lg`}>Retour à l'accueil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import tw from "twrnc";
import { useNavigation } from "@react-navigation/native";

export default function PaymentCancelScreen() {
  const navigation = useNavigation();

  return (
    <View style={tw`flex-1 justify-center items-center bg-white`}>
      <Text style={tw`text-2xl font-bold mb-4 text-red-500`}>❌ Paiement annulé</Text>
      <Text style={tw`mb-8 text-gray-700 text-center`}>
        La transaction n’a pas été finalisée.<br />Aucun montant ne sera prélevé.
      </Text>
      <TouchableOpacity
        style={tw`bg-gray-300 px-6 py-3 rounded-lg`}
        onPress={() => navigation.navigate("Home")} // change "Home" si besoin !
      >
        <Text style={tw`text-gray-700 font-semibold`}>Retour à l’accueil</Text>
      </TouchableOpacity>
    </View>
  );
}

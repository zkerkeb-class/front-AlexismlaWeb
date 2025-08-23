import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import tw from "twrnc";
import { useNavigation } from "@react-navigation/native";

export default function PaymentSuccessScreen() {
  const navigation = useNavigation();

  return (
    <View style={tw`flex-1 justify-center items-center bg-white`}>
      <Text style={tw`text-2xl font-bold mb-4 text-green-600`}>✅ Paiement réussi !</Text>
      <Text style={tw`mb-8`}>Merci pour ton achat !</Text>
      <TouchableOpacity
        style={tw`bg-blue-600 px-6 py-3 rounded-lg`}
        onPress={() => navigation.navigate("Home")} // ou un autre screen principal
      >
        <Text style={tw`text-white font-semibold`}>Retour à l'accueil</Text>
      </TouchableOpacity>
    </View>
  );
}

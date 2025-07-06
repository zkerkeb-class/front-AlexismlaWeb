import React, { useState, useContext, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, Alert, Linking } from "react-native";
import tw from "twrnc";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import Ionicons from "react-native-vector-icons/Ionicons";

const tokenPacks = [
  { label: "💎 5 Tokens", tokenAmount: 5, priceId: "price_1Rhx9yBBKItnJKUIM5zOBJnJ" },
  { label: "🔥 10 Tokens", tokenAmount: 10, priceId: "price_1RhxHLBBKItnJKUIJvaGnwex" },
  { label: "🚀 20 Tokens", tokenAmount: 20, priceId: "price_1RhxHrBBKItnJKUIq21KbunH" },
];

const TokenDialog = () => {
  const { userId, userToken } = useContext(AuthContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [aiTokens, setAiTokens] = useState(null);

  const fetchUserTokens = async () => {
    try {
      const response = await axios.get(`http://192.168.1.42:4001/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      setAiTokens(response.data.aiTokens);
    } catch (err) {
      console.error("Erreur chargement tokens:", err);
      Alert.alert("Erreur", "Impossible de récupérer les tokens");
    }
  };

  const handleBuy = async (priceId, tokenAmount) => {
    try {
      const response = await axios.post(
        "http://192.168.1.42:4003/api/payment/checkout",
        { userId, priceId, tokenAmount },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      const { url } = response.data;
      if (url) {
        setModalVisible(false);
        Linking.openURL(url);
      } else {
        Alert.alert("Erreur", "URL de paiement non disponible.");
      }
    } catch (error) {
      console.error("Erreur paiement:", error);
      Alert.alert("Erreur", "Impossible de créer la session de paiement.");
    }
  };

  const openModal = async () => {
    await fetchUserTokens();
    setModalVisible(true);
  };

  return (
    <>
      <TouchableOpacity
        onPress={openModal}
        style={tw`flex-row items-center bg-blue-600 px-4 py-2 rounded-full self-end mr-2`}
      >
        <Ionicons name="sparkles-outline" size={20} color="white" />
        <Text style={tw`text-white ml-2 font-semibold`}>Acheter Tokens</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={tw`flex-1 bg-black bg-opacity-40 justify-center items-center`}>
          <View style={tw`bg-white w-11/12 p-6 rounded-lg`}>
            <Text style={tw`text-lg font-bold mb-4 text-center`}>Mes Tokens IA</Text>
            <Text style={tw`text-center text-gray-700 mb-4`}>
              {aiTokens === null ? "Chargement..." : `Tu as ${aiTokens} tokens disponibles`}
            </Text>

            {tokenPacks.map((pack, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => handleBuy(pack.priceId, pack.tokenAmount)}
                style={tw`bg-blue-600 py-3 px-4 rounded-lg mb-3`}
              >
                <Text style={tw`text-white text-center`}>{pack.label}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity onPress={() => setModalVisible(false)} style={tw`mt-2`}>
              <Text style={tw`text-center text-gray-500`}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default TokenDialog;

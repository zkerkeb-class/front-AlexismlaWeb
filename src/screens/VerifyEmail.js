import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import axios from "axios";

export default function VerifyEmailScreen({ navigation, route }) {
  const [token, setToken] = useState("");
  // On récupère l'email passé depuis Register (pratique pour pré-remplir)
  const [email, setEmail] = useState(route.params?.email || "");

  const handleVerify = async () => {
    if (!email || !token) {
      return Alert.alert("Erreur", "Renseigne ton email et le code reçu par mail !");
    }
    try {
      await axios.post("http://localhost:4000/api/auth/verify-email", { email, code: token });
      Alert.alert("Succès", "Ton compte est confirmé !");
      navigation.replace("Login");
    } catch (err) {
      Alert.alert("Erreur", err.response?.data?.error || "Code invalide ou expiré.");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
      <Text style={{ fontWeight: "bold", fontSize: 20, marginBottom: 12 }}>
        Confirme ton adresse email
      </Text>
      <TextInput
        placeholder="Ton email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 10 }}
      />
      <TextInput
        placeholder="Code reçu par email"
        value={token}
        onChangeText={setToken}
        style={{ borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 16 }}
        autoCapitalize="none"
      />
      <TouchableOpacity
        style={{ backgroundColor: "#2563eb", padding: 14, borderRadius: 8 }}
        onPress={handleVerify}
      >
        <Text style={{ color: "white", fontWeight: "bold", textAlign: "center" }}>Vérifier</Text>
      </TouchableOpacity>
    </View>
  );
}

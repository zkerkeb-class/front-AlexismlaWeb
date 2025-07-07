import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import axios from "axios";

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");

  const handleForgot = async () => {
    if (!email) return Alert.alert("Erreur", "Merci de renseigner ton email.");
    try {
      await axios.post("http://localhost:4000/api/auth/forgot-password", { email });
      navigation.navigate("ResetPassword");
    } catch (err) {
      Alert.alert("Erreur", "Impossible d’envoyer le mail.");
    }
  };

  return (
    <View style={{flex: 1, justifyContent: "center", padding: 24}}>
      <Text style={{fontSize: 24, fontWeight: "bold", marginBottom: 24}}>Réinitialisation du mot de passe</Text>
      <TextInput
        placeholder="Ton email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={{borderWidth: 1, borderRadius: 8, padding: 16, marginBottom: 16}}
      />
      <TouchableOpacity
        style={{backgroundColor: "#2563eb", padding: 16, borderRadius: 8}}
        onPress={handleForgot}
      >
        <Text style={{color: "white", textAlign: "center", fontWeight: "bold"}}>
          Recevoir le mail de réinitialisation
        </Text>
      </TouchableOpacity>
    </View>
  );
}

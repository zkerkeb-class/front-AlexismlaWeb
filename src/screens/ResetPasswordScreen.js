import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import axios from "axios";

export default function ResetPasswordScreen({ navigation }) {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleReset = async () => {
    if (!token || !password || !confirm)
      return Alert.alert("Erreur", "Tous les champs sont obligatoires.");
    if (password !== confirm)
      return Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
    try {
      await axios.post("http://localhost:4000/api/auth/reset-password", {
        token,
        newPassword: password,
      });
      Alert.alert("Succès", "Ton mot de passe a été modifié !");
      navigation.navigate("Login");
    } catch (err) {
      Alert.alert("Erreur", "Token invalide ou expiré.");
    }
  };

  return (
    <View style={{flex: 1, justifyContent: "center", padding: 24}}>
      <Text style={{fontSize: 24, fontWeight: "bold", marginBottom: 24}}>Nouveau mot de passe</Text>
      <TextInput
        placeholder="Code reçu par mail"
        value={token}
        onChangeText={setToken}
        autoCapitalize="none"
        style={{borderWidth: 1, borderRadius: 8, padding: 16, marginBottom: 16}}
      />
      <TextInput
        placeholder="Nouveau mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{borderWidth: 1, borderRadius: 8, padding: 16, marginBottom: 16}}
      />
      <TextInput
        placeholder="Confirme le mot de passe"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        style={{borderWidth: 1, borderRadius: 8, padding: 16, marginBottom: 16}}
      />
      <TouchableOpacity
        style={{backgroundColor: "#2563eb", padding: 16, borderRadius: 8}}
        onPress={handleReset}
      >
        <Text style={{color: "white", textAlign: "center", fontWeight: "bold"}}>
          Réinitialiser le mot de passe
        </Text>
      </TouchableOpacity>
    </View>
  );
}

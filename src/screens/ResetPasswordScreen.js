import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StatusBar } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import tw from "twrnc";
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

export default function ResetPasswordScreen() {
  const navigation = useNavigation();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  
  // État pour le Toast
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    Toast.show({
      type,
      text1: message,
      position: 'top',
      visibilityTime: 2500,
      autoHide: true,
      topOffset: 60,
    });
  };

  const hideToast = () => {
    Toast.hide();
  };

  const handleReset = async () => {
    if (!token || !password || !confirm) {
      showToast("Tous les champs sont obligatoires.", "error");
      return;
    }
    if (password !== confirm) {
      showToast("Les mots de passe ne correspondent pas.", "error");
      return;
    }
    try {
      await axios.post("http://localhost:8081/auth/api/auth/reset-password", {
        token,
        newPassword: password,
      });
      showToast("Ton mot de passe a été modifié !", "success");
      navigation.navigate("Login");
    } catch (err) {
      showToast("Token invalide ou expiré.", "error");
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50`}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
      {/* Toast Notification */}
      
      {/* Header */}
      <View style={tw`bg-white border-b border-gray-200 px-4 py-3`}>
        <View style={tw`flex-row items-center justify-between`}>
          <TouchableOpacity 
            style={tw`p-2 -ml-2`}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          
          <View style={tw`flex-1 items-center`}>
            <Text style={tw`text-lg font-semibold text-gray-900`}>Nouveau mot de passe</Text>
          </View>
          
          <View style={tw`w-10`} />
        </View>
      </View>

      {/* Contenu principal */}
      <View style={tw`flex-1 justify-center px-4`}>
        
        {/* Icône et titre */}
        <View style={tw`items-center mb-8`}>
          <View style={tw`w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4`}>
            <Ionicons name="lock-open" size={32} color="#10B981" />
          </View>
          <Text style={tw`text-2xl font-bold text-gray-900 mb-2 text-center`}>
            Nouveau mot de passe
          </Text>
          <Text style={tw`text-gray-600 text-center px-4`}>
            Entre le code reçu par email et choisis ton nouveau mot de passe.
          </Text>
        </View>

        {/* Formulaire */}
        <View style={tw`bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6`}>
          <View style={tw`gap-4`}>
            <View>
              <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>Code de réinitialisation</Text>
              <TextInput
                style={tw`bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900`}
                placeholder="Code reçu par email"
                placeholderTextColor="#9CA3AF"
                value={token}
                onChangeText={setToken}
                autoCapitalize="none"
              />
            </View>
            
            <View>
              <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>Nouveau mot de passe</Text>
              <TextInput
                style={tw`bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900`}
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
            
            <View>
              <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>Confirmer le mot de passe</Text>
              <TextInput
                style={tw`bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900`}
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry
              />
            </View>
          </View>
        </View>

        {/* Bouton de réinitialisation */}
        <TouchableOpacity 
          style={tw`bg-green-500 rounded-xl py-4 px-6 shadow-lg mb-6`}
          onPress={handleReset}
          activeOpacity={0.8}
        >
          <View style={tw`flex-row items-center justify-center`}>
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <Text style={tw`text-white font-semibold text-lg ml-2`}>
              Réinitialiser le mot de passe
            </Text>
          </View>
        </TouchableOpacity>

        {/* Lien retour */}
        <TouchableOpacity 
          style={tw`items-center`}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.7}
        >
          <Text style={tw`text-gray-600 text-base`}>
            <Text style={tw`text-blue-500 font-semibold`}>
              ← Retour à la connexion
            </Text>
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}
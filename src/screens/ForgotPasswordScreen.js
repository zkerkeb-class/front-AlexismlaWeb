import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StatusBar } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import tw from "twrnc";
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  
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

  const handleForgot = async () => {
    if (!email) {
      showToast("Merci de renseigner ton email.", "error");
      return;
    }
    try {
      await axios.post("http://localhost:8081/auth/api/auth/forgot-password", { email });
      showToast("Email de réinitialisation envoyé !", "success");
      navigation.navigate("ResetPassword");
    } catch (err) {
      showToast("Impossible d'envoyer le mail.", "error");
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
            <Text style={tw`text-lg font-semibold text-gray-900`}>Mot de passe oublié</Text>
          </View>
          
          <View style={tw`w-10`} />
        </View>
      </View>

      {/* Contenu principal */}
      <View style={tw`flex-1 justify-center px-4`}>
        
        {/* Icône et titre */}
        <View style={tw`items-center mb-8`}>
          <View style={tw`w-20 h-20 bg-orange-100 rounded-full items-center justify-center mb-4`}>
            <Ionicons name="key" size={32} color="#F97316" />
          </View>
          <Text style={tw`text-2xl font-bold text-gray-900 mb-2 text-center`}>
            Mot de passe oublié ?
          </Text>
          <Text style={tw`text-gray-600 text-center px-4`}>
            Pas de panique ! Entre ton email et nous t'enverrons un lien pour réinitialiser ton mot de passe.
          </Text>
        </View>

        {/* Formulaire */}
        <View style={tw`bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6`}>
          <View>
            <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>Email</Text>
            <TextInput
              style={tw`bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900`}
              placeholder="ton@email.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Bouton d'envoi */}
        <TouchableOpacity 
          style={tw`bg-orange-500 rounded-xl py-4 px-6 shadow-lg mb-6`}
          onPress={handleForgot}
          activeOpacity={0.8}
        >
          <View style={tw`flex-row items-center justify-center`}>
            <Ionicons name="mail" size={20} color="#FFFFFF" />
            <Text style={tw`text-white font-semibold text-lg ml-2`}>
              Envoyer le lien de réinitialisation
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
            <Text style={tw`text-blue-500 font-semibold`}>← Retour à la connexion</Text>
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

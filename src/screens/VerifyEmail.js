import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StatusBar } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import tw from "twrnc";
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

export default function VerifyEmailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [token, setToken] = useState("");
  const [email, setEmail] = useState(route.params?.email || "");
  
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

  const handleVerify = async () => {
    if (!email || !token) {
      showToast("Renseigne ton email et le code reçu par mail !", "error");
      return;
    }
    try {
      await axios.post("http://localhost:4000/api/auth/verify-email", { email, code: token });
      showToast("Ton compte est confirmé !", "success");
      navigation.replace("Login");
    } catch (err) {
      showToast(err.response?.data?.error || "Code invalide ou expiré.", "error");
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
            <Text style={tw`text-lg font-semibold text-gray-900`}>Vérification email</Text>
          </View>
          <View style={tw`w-10`} />
        </View>
      </View>

      {/* Contenu principal */}
      <View style={tw`flex-1 justify-center px-4`}>
        {/* Icône et titre */}
        <View style={tw`items-center mb-8`}>
          <View style={tw`w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-4`}>
            <Ionicons name="mail-open" size={32} color="#3B82F6" />
          </View>
          <Text style={tw`text-2xl font-bold text-gray-900 mb-2 text-center`}>
            Confirme ton adresse email
          </Text>
          <Text style={tw`text-gray-600 text-center px-4`}>
            Un code de confirmation a été envoyé à ton adresse email. Renseigne-le ci-dessous pour activer ton compte.
          </Text>
        </View>

        {/* Formulaire */}
        <View style={tw`bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6`}>
          <View style={tw`space-y-4`}>
            <View>
              <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>Email</Text>
              <TextInput
                placeholder="Ton email"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                style={tw`bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900`}
              />
            </View>
            <View>
              <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>Code reçu par email</Text>
              <TextInput
                placeholder="Code reçu par email"
                value={token}
                onChangeText={setToken}
                style={tw`bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900`}
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>

        {/* Bouton de vérification */}
        <TouchableOpacity
          style={tw`bg-blue-500 rounded-xl py-4 px-6 shadow-lg mb-6`}
          onPress={handleVerify}
          activeOpacity={0.8}
        >
          <View style={tw`flex-row items-center justify-center`}>
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <Text style={tw`text-white font-semibold text-lg ml-2`}>Vérifier</Text>
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

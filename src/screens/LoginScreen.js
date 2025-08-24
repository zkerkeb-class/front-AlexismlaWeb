import { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import tw from "twrnc";
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

export default function Login() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  
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

  const handleLogin = async () => {
    if (!email || !password) {
      showToast("Merci de remplir tous les champs.", "error");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8081/auth/api/auth/login", { email, password });
      console.log("Réponse de l'API :", response.data);
      showToast("Connexion réussie !", "success");
      console.log("Token de connexion :", response.data.token);
      await login(response.data.token, response.data.user.id);
      
      // La redirection se fait automatiquement via le contexte d'authentification
      // Pas besoin de redirection manuelle
    } catch (error) {
      console.error(error);
      showToast("Email ou mot de passe incorrect.", "error");
      console.error("Erreur de connexion :", error.response?.data || error.message);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50`}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
      {/* Toast Notification */}
      {/* Supprime le composant Toast custom du JSX */}
      
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
            <Text style={tw`text-lg font-semibold text-gray-900`}>Connexion</Text>
          </View>
          
          <View style={tw`w-10`} />
        </View>
      </View>

      {/* Contenu principal */}
      <View style={tw`flex-1 justify-center px-4`}>
        
        {/* Logo et titre */}
        <View style={tw`items-center mb-8`}>
          <View style={tw`w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-4`}>
            <Ionicons name="shirt" size={32} color="#3B82F6" />
          </View>
          <Text style={tw`text-2xl font-bold text-gray-900 mb-2`}>Bienvenue !</Text>
          <Text style={tw`text-gray-600 text-center`}>Connecte-toi à ton compte</Text>
        </View>

        {/* Formulaire */}
        <View style={tw`bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6`}>
          <View style={tw`gap-4`}>
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
            
            <View>
              <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>Mot de passe</Text>
              <TextInput
                style={tw`bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900`}
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>
        </View>

        {/* Bouton de connexion */}
        <TouchableOpacity 
          style={tw`bg-blue-500 rounded-xl py-4 px-6 shadow-lg mb-6`}
          onPress={handleLogin}
          activeOpacity={0.8}
        >
          <View style={tw`flex-row items-center justify-center`}>
            <Ionicons name="log-in" size={20} color="#FFFFFF" />
            <Text style={tw`text-white font-semibold text-lg ml-2`}>Se connecter</Text>
          </View>
        </TouchableOpacity>

        {/* Liens */}
        <View style={tw`gap-4`}>
          <TouchableOpacity 
            style={tw`items-center`}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.7}
          >
            <Text style={tw`text-gray-600 text-base`}>
              Pas encore de compte ? <Text style={tw`text-blue-500 font-semibold`}>Créer un compte</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={tw`items-center`}
            onPress={() => navigation.navigate('ForgotPassword')}
            activeOpacity={0.7}
          >
            <Text style={tw`text-gray-600 text-base`}>
              <Text style={tw`text-blue-500 font-semibold`}>Mot de passe oublié ?</Text>
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

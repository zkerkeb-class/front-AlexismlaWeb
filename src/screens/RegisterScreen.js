import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
import axios from "axios";
import tw from "twrnc";
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import React from 'react';
export const toastConfig = {
  success: ({ text1 }) => (
    <View style={{
      backgroundColor: '#e6f9f0',
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      marginHorizontal: 24,
      marginTop: 10,
      minHeight: 56,
    }}>
      <Ionicons name="checkmark-circle" size={24} color="#10B981" style={{ marginRight: 12 }} />
      <Text style={{
        color: '#1B4332',
        fontWeight: '600',
        fontSize: 16,
        flex: 1,
        textAlign: 'center'
      }}>{text1}</Text>
    </View>
  ),
  error: ({ text1 }) => (
    <View style={{
      backgroundColor: '#fff0f0',
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      marginHorizontal: 24,
      marginTop: 10,
      minHeight: 56,
    }}>
      <Ionicons name="close-circle" size={24} color="#EF4444" style={{ marginRight: 12 }} />
      <Text style={{
        color: '#7F1D1D',
        fontWeight: '600',
        fontSize: 16,
        flex: 1,
        textAlign: 'center'
      }}>{text1}</Text>
    </View>
  ),
  info: ({ text1 }) => (
    <View style={{
      backgroundColor: '#e7f0fa',
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      marginHorizontal: 24,
      marginTop: 10,
      minHeight: 56,
    }}>
      <Ionicons name="information-circle" size={24} color="#3B82F6" style={{ marginRight: 12 }} />
      <Text style={{
        color: '#1E3A8A',
        fontWeight: '600',
        fontSize: 16,
        flex: 1,
        textAlign: 'center'
      }}>{text1}</Text>
    </View>
  ),
};

export default function Register() {
  const navigation = useNavigation();
  const { login } = useContext(AuthContext);
  
  // Champs de base
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Nouveaux champs enrichis
  const [genre, setGenre] = useState("");
  const [age, setAge] = useState("");
  const [taille, setTaille] = useState("");
  const [poids, setPoids] = useState("");
  const [morphologie, setMorphologie] = useState("");
  const [stylesPreferes, setStylesPreferes] = useState([]);
  const [couleursMotifs, setCouleursMotifs] = useState([]);
  const [restrictions, setRestrictions] = useState("");
  const [ville, setVille] = useState("");
  
  // États pour les sélections multiples
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [selectedCouleurs, setSelectedCouleurs] = useState([]);
  
  // État pour le Toast
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  
  // Options pour les sélecteurs
  const genres = ["Homme", "Femme", "Autre"];
  const morphologies = ["A", "V", "H", "O", "X"];
  const styles = ["Casual", "Chic", "Sport", "Street", "Classique", "Élégant", "Décontracté"];
  const couleurs = ["Rouge", "Bleu", "Noir", "Blanc", "Vert", "Jaune", "Rose", "Violet", "Orange", "Gris", "Motif fleuri", "Rayures", "Carreaux", "Uni"];

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

  const handleStyleToggle = (style) => {
    if (selectedStyles.includes(style)) {
      setSelectedStyles(selectedStyles.filter(s => s !== style));
    } else {
      setSelectedStyles([...selectedStyles, style]);
    }
  };

  const handleCouleurToggle = (couleur) => {
    if (selectedCouleurs.includes(couleur)) {
      setSelectedCouleurs(selectedCouleurs.filter(c => c !== couleur));
    } else {
      setSelectedCouleurs([...selectedCouleurs, couleur]);
    }
  };

  const validateForm = () => {
    if (!email || !password || !confirmPassword) {
      showToast("Merci de remplir tous les champs obligatoires.", "error");
      return false;
    }
    if (password !== confirmPassword) {
      showToast("Les mots de passe ne correspondent pas.", "error");
      return false;
    }
    if (!email.match(/^[^@]+@[^@]+\.[^@]+$/)) {
      showToast("Format d'email invalide.", "error");
      return false;
    }
    if (age && (parseInt(age) < 10 || parseInt(age) > 100)) {
      showToast("Âge invalide (entre 10 et 100 ans).", "error");
      return false;
    }
    if (taille && (parseFloat(taille) < 100 || parseFloat(taille) > 250)) {
      showToast("Taille invalide (entre 100 et 250 cm).", "error");
      return false;
    }
    if (poids && (parseFloat(poids) < 30 || parseFloat(poids) > 250)) {
      showToast("Poids invalide (entre 30 et 250 kg).", "error");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      console.log("Tentative d'inscription avec tous les champs enrichis");
      
      // Préparation des données utilisateur
      const userData = {
        email,
        password,
        genre: genre || null,
        age: age ? parseInt(age) : null,
        taille: taille ? parseFloat(taille) : null,
        poids: poids ? parseFloat(poids) : null,
        morphologie: morphologie || null,
        stylesPreferes: selectedStyles,
        couleursMotifs: selectedCouleurs,
        restrictions: restrictions || null,
        ville: ville || null
      };

      // Appel au service d'authentification pour créer l'utilisateur ET envoyer l'email
      const response = await axios.post("http://localhost:8081/auth/api/auth/register", userData);
      
      showToast("Inscription réussie ! Vérifie tes mails.", "success");
      navigation.replace("VerifyEmail", { email });
    } catch (error) {
      console.error("Erreur inscription:", error.response?.data || error);
      showToast(error.response?.data?.error || "Problème de connexion au serveur.", "error");
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
            <Text style={tw`text-lg font-semibold text-gray-900`}>Créer un compte</Text>
          </View>
          
          <View style={tw`w-10`} />
        </View>
      </View>

      {/* Contenu principal */}
      <ScrollView 
        style={tw`flex-1`} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`pb-8`}
      >
        <View style={tw`px-4 pt-6`}>
          
          {/* Informations de base */}
          <View style={tw`bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4`}>
            <View style={tw`flex-row items-center mb-4`}>
              <View style={tw`w-8 h-8 bg-blue-100 rounded-lg items-center justify-center mr-3`}>
                <Ionicons name="person" size={16} color="#3B82F6" />
              </View>
              <Text style={tw`text-lg font-semibold text-gray-900`}>Informations de base</Text>
            </View>
            
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
              
              <View>
                <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>Confirmer le mot de passe</Text>
                <TextInput
                  style={tw`bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900`}
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>
            </View>
          </View>

          {/* Informations personnelles */}
          <View style={tw`bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4`}>
            <View style={tw`flex-row items-center mb-4`}>
              <View style={tw`w-8 h-8 bg-green-100 rounded-lg items-center justify-center mr-3`}>
                <Ionicons name="body" size={16} color="#10B981" />
              </View>
              <Text style={tw`text-lg font-semibold text-gray-900`}>Informations personnelles</Text>
            </View>
            
            <View style={tw`gap-4`}>
              <View>
                <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>Genre</Text>
                <View style={tw`flex-row gap-2`}>
                  {genres.map(g => (
                    <TouchableOpacity
                      key={g}
                      style={tw`flex-1 py-3 px-4 rounded-lg border ${
                        genre === g 
                          ? 'bg-blue-500 border-blue-500' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                      onPress={() => setGenre(g)}
                      activeOpacity={0.7}
                    >
                      <Text style={tw`text-center font-medium ${
                        genre === g ? 'text-white' : 'text-gray-700'
                      }`}>
                        {g}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={tw`flex-row gap-3`}>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>Âge</Text>
                  <TextInput
                    style={tw`bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900`}
                    placeholder="25"
                    placeholderTextColor="#9CA3AF"
                    value={age}
                    onChangeText={setAge}
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={tw`flex-1`}>
                  <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>Taille (cm)</Text>
                  <TextInput
                    style={tw`bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900`}
                    placeholder="170"
                    placeholderTextColor="#9CA3AF"
                    value={taille}
                    onChangeText={setTaille}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              
              <View>
                <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>Poids (kg)</Text>
                <TextInput
                  style={tw`bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900`}
                  placeholder="65"
                  placeholderTextColor="#9CA3AF"
                  value={poids}
                  onChangeText={setPoids}
                  keyboardType="numeric"
                />
              </View>
              
              <View>
                <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>Morphologie</Text>
                <View style={tw`flex-row flex-wrap`}>
                  {morphologies.map(m => (
                    <TouchableOpacity
                      key={m}
                      style={tw`mr-2 mb-2 px-4 py-2 rounded-lg border ${
                        morphologie === m 
                          ? 'bg-green-500 border-green-500' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                      onPress={() => setMorphologie(m)}
                      activeOpacity={0.7}
                    >
                      <Text style={tw`text-sm font-medium ${
                        morphologie === m ? 'text-white' : 'text-gray-700'
                      }`}>
                        {m}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View>
                <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>Ville</Text>
                <TextInput
                  style={tw`bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900`}
                  placeholder="Paris"
                  placeholderTextColor="#9CA3AF"
                  value={ville}
                  onChangeText={setVille}
                />
              </View>
            </View>
          </View>

          {/* Styles préférés */}
          <View style={tw`bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4`}>
            <View style={tw`flex-row items-center mb-4`}>
              <View style={tw`w-8 h-8 bg-purple-100 rounded-lg items-center justify-center mr-3`}>
                <Ionicons name="shirt" size={16} color="#8B5CF6" />
              </View>
              <Text style={tw`text-lg font-semibold text-gray-900`}>Styles préférés</Text>
            </View>
            
            <View style={tw`flex-row flex-wrap`}>
              {styles.map(style => (
                <TouchableOpacity
                  key={style}
                  style={tw`mr-2 mb-2 px-4 py-2 rounded-full border ${
                    selectedStyles.includes(style) 
                      ? 'bg-purple-500 border-purple-500' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                  onPress={() => handleStyleToggle(style)}
                  activeOpacity={0.7}
                >
                  <Text style={tw`text-sm font-medium ${
                    selectedStyles.includes(style) ? 'text-white' : 'text-gray-700'
                  }`}>
                    {style}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Couleurs et motifs favoris */}
          <View style={tw`bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4`}>
            <View style={tw`flex-row items-center mb-4`}>
              <View style={tw`w-8 h-8 bg-pink-100 rounded-lg items-center justify-center mr-3`}>
                <Ionicons name="color-palette" size={16} color="#EC4899" />
              </View>
              <Text style={tw`text-lg font-semibold text-gray-900`}>Couleurs et motifs favoris</Text>
            </View>
            
            <View style={tw`flex-row flex-wrap`}>
              {couleurs.map(couleur => (
                <TouchableOpacity
                  key={couleur}
                  style={tw`mr-2 mb-2 px-4 py-2 rounded-full border ${
                    selectedCouleurs.includes(couleur) 
                      ? 'bg-pink-500 border-pink-500' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                  onPress={() => handleCouleurToggle(couleur)}
                  activeOpacity={0.7}
                >
                  <Text style={tw`text-sm font-medium ${
                    selectedCouleurs.includes(couleur) ? 'text-white' : 'text-gray-700'
                  }`}>
                    {couleur}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Restrictions */}
          <View style={tw`bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6`}>
            <View style={tw`flex-row items-center mb-4`}>
              <View style={tw`w-8 h-8 bg-red-100 rounded-lg items-center justify-center mr-3`}>
                <Ionicons name="warning" size={16} color="#EF4444" />
              </View>
              <Text style={tw`text-lg font-semibold text-gray-900`}>Restrictions</Text>
            </View>
            
            <View>
              <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>Matières ou vêtements à éviter</Text>
              <TextInput
                style={tw`bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 min-h-[80px]`}
                placeholder="Ex: laine, cuir, matières synthétiques..."
                placeholderTextColor="#9CA3AF"
                value={restrictions}
                onChangeText={setRestrictions}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Bouton d'inscription */}
          <TouchableOpacity 
            style={tw`bg-blue-500 rounded-xl py-4 px-6 shadow-lg`}
            onPress={handleRegister}
            activeOpacity={0.8}
          >
            <View style={tw`flex-row items-center justify-center`}>
              <Ionicons name="person-add" size={20} color="#FFFFFF" />
              <Text style={tw`text-white font-semibold text-lg ml-2`}>Créer mon compte</Text>
            </View>
          </TouchableOpacity>

          {/* Lien vers connexion */}
          <TouchableOpacity 
            style={tw`mt-6 items-center`}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.7}
          >
            <Text style={tw`text-gray-600 text-base`}>
              Déjà un compte ? <Text style={tw`text-blue-500 font-semibold`}>Se connecter</Text>
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
      <Toast config={toastConfig} />
    </SafeAreaView>
  );
}


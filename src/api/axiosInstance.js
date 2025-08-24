import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Configuration pour différents environnements
const getBaseURL = () => {
  // Pour le développement sur émulateur
  if (__DEV__) {
    return "http://localhost:8081";
  }
  // Pour les tests sur appareil physique, utilise ton IP réseau
  // Remplace par ton IP réseau si nécessaire
  return "http://192.168.1.XXX:8081"; // À adapter selon ton réseau
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000, // Timeout de 10 secondes
});

// Intercepteur pour ajouter automatiquement le token
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération du token:", error);
  }
  return config;
});

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Erreur API:", error.response?.data || error.message);
    
    // Gestion spécifique des erreurs d'authentification
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      console.log("Token expiré, redirection vers login");
      // Tu peux ajouter ici une logique pour rediriger vers le login
    }
    
    return Promise.reject(error);
  }
);

export default api;

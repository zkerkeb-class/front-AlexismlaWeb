// AuthContext.js
import { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les tokens au démarrage de l'app
  useEffect(() => {
    const loadStoredTokens = async () => {
      try {
        const [storedToken, storedUserId] = await Promise.all([
          AsyncStorage.getItem("userToken"),
          AsyncStorage.getItem("userId")
        ]);
        
        if (storedToken && storedUserId) {
          setUserToken(storedToken);
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des tokens:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredTokens();
  }, []);

  const login = async (token, id) => {
    try {
      console.log("🔐 Login - Token reçu:", token);
      console.log("🔐 Login - ID reçu:", id);
      
      setUserToken(token);
      setUserId(id);
      await AsyncStorage.setItem("userToken", token);
      await AsyncStorage.setItem("userId", id);
      
      console.log("✅ Connexion réussie - Token sauvegardé");
      console.log("✅ Connexion réussie - ID sauvegardé:", id);
    } catch (error) {
      console.error("❌ Erreur lors de la sauvegarde des tokens:", error);
    }
  };

  const logout = async () => {
    try {
      setUserToken(null);
      setUserId(null);
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userId");
      console.log("Déconnexion réussie");
    } catch (error) {
      console.error("Erreur lors de la suppression des tokens:", error);
    }
  };

  const isAuthenticated = () => {
    return userToken !== null && userId !== null;
  };

  return (
    <AuthContext.Provider value={{ 
      userToken, 
      userId, 
      isLoading,
      login, 
      logout,
      isAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

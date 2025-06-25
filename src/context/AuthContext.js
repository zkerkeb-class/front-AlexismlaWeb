// AuthContext.js
import { createContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [userId, setUserId] = useState(null);

  const login = async (token, id) => {
    setUserToken(token);
    setUserId(id);
    await AsyncStorage.setItem("userToken", token);
    await AsyncStorage.setItem("userId", id);
    console.log("id", id);
  };

  const logout = async () => {
    setUserToken(null);
    setUserId(null);
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("userId");
  };

  return (
    <AuthContext.Provider value={{ userToken, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

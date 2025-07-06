import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
  baseURL: "http://localhost:4000", // ⚠️ à changer si tu es sur un téléphone physique
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("userToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

import React, { useEffect } from "react";
import * as Linking from "expo-linking";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { navigationRef } from "./src/navigation/navigationRef";
import Toast from 'react-native-toast-message';

export default function App() {
  useEffect(() => {
    const subscription = Linking.addEventListener("url", (event) => {
      if (event.url.includes("payment-success")) {
        navigationRef.current?.navigate("PaymentSuccess");
      }
      if (event.url.includes("payment-cancel")) {
        navigationRef.current?.navigate("PaymentCancel");
      }
      if (url.includes("reset-password")) {
        const token = url.split("token=")[1];
        if (token) {
          navigationRef.current?.navigate("ResetPassword", { token });
        }
      }
    });
    return () => subscription.remove();
  }, []);

  return (
    <AuthProvider>
      <NavigationContainer ref={navigationRef}>
        <AppNavigator />
        <Toast />
      </NavigationContainer>
    </AuthProvider>
  );
}

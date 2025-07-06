import React, { useContext } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthContext } from "../context/AuthContext";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import UploadScreen from "../screens/UploadScreen";
import OutfitsScreen from "../screens/OutfitsScreen";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import PaymentSuccessScreen from "../screens/PaymentSuccessScreen";
import PaymentCancelScreen from "../screens/PaymentCancelScreen";
import BottomTabNavigator from "./BottomTabNavigator"; // ✅ Import du menu du bas

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { userToken } = useContext(AuthContext);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {userToken ? (
        <>
          <Stack.Screen name="Main" component={BottomTabNavigator} />
          <Stack.Screen name="Upload" component={UploadScreen} />
          <Stack.Screen name="Outfits" component={OutfitsScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
          <Stack.Screen name="PaymentCancel" component={PaymentCancelScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;

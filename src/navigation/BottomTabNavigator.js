import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../screens/HomeScreen.js";
import DressingScreen from "../screens/DressingScreen.js";
import ProfileScreen from "../screens/ProfileScreen.js";

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#000",
        tabBarInactiveTintColor: "#888",
        tabBarStyle: { backgroundColor: "#f8f8f8", height: 80 },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Accueil") iconName = "home-outline";
          else if (route.name === "Dressing") iconName = "shirt-outline";
          else if (route.name === "Profil") iconName = "person-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} />
      <Tab.Screen name="Dressing" component={DressingScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;

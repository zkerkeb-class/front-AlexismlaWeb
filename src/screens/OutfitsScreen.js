import { View, Text, TouchableOpacity } from "react-native";

export default function OutfitsScreen() {
  return (
    <View className="flex-1 bg-white justify-center items-center">
      <Text className="text-3xl font-bold mb-4">Bienvenue dans tes Tenues 👗👖</Text>
      <Text className="text-gray-600 text-center px-6">
        Ici tu pourras consulter et gérer toutes tes tenues.
      </Text>

      <TouchableOpacity
        className="bg-black px-6 py-3 rounded-lg mt-10"
        onPress={() => {
          // plus tard ajouter bouton pour ajouter une tenue
        }}
      >
        <Text className="text-white font-semibold text-lg">
          Ajouter une tenue
        </Text>
      </TouchableOpacity>
    </View>
  );
}

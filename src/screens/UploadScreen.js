import { View, Text, TouchableOpacity } from "react-native";

export default function UploadScreen() {
  return (
    <View className="flex-1 bg-white justify-center items-center">
      <Text className="text-3xl font-bold mb-4">Bienvenue dans Upload 👕</Text>
      <Text className="text-gray-600 text-center px-6">
        Ici tu pourras uploader tes vêtements.
      </Text>
      <TouchableOpacity
        className="bg-black px-6 py-3 rounded-lg mt-10"
        onPress={() => {
          // plus tard ajouter bouton pour uploader un vêtement
        }}
      >
        <Text className="text-white font-semibold text-lg">
          Uploader un vêtement
        </Text>
      </TouchableOpacity>
    
    </View> 
  );
}

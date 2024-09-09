import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

const QuizListItem = ({
  title,
  imageUrl,
  onPress,
}: {
  title: string;
  imageUrl: string;
  onPress: () => void;
}) => {
  return (
    <View className="my-2 flex-row items-center rounded-lg bg-white p-3 shadow-md">
      <Image source={{ uri: imageUrl }} className="h-12 w-12 rounded-lg" />
      <Text className="ml-3 flex-1 text-lg font-bold text-gray-800">
        {title}
      </Text>
      <TouchableOpacity
        onPress={onPress}
        className="rounded-full bg-blue-500 p-2"
      >
        <FontAwesome name="play" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default QuizListItem;

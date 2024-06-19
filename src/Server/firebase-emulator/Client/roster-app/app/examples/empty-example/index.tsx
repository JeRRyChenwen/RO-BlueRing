import { View } from "react-native";
import { Text, Button } from "@ui-kitten/components";
import React from "react";
import { Stack } from "expo-router";

const EmptyExamplePage = () => {
  return (
    <View>
      <Stack.Screen
        options={{
          title: "Example Page",
        }}
      />
      <Text>This is an example page.</Text>
    </View>
  );
};

export default EmptyExamplePage;

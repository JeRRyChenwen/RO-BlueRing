import { View, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { Text } from "@ui-kitten/components";

type Props = {
  title: string;
};

const SettingsEditableItem = (props: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>{props.title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  titleText: {
    fontSize: 16,
  },
});

export default SettingsEditableItem;

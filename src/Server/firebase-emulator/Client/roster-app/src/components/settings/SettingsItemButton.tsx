import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "@ui-kitten/components";
import { GestureResponderEvent } from "react-native/Libraries/Types/CoreEventTypes";
import { MaterialIcons } from "@expo/vector-icons";

type Props = {
  title: string;
  showArrow?: boolean;
  onPressOut?: (event: GestureResponderEvent) => void;
};

const SettingsItemButton = ({
  title = "Title",
  showArrow = false,
  onPressOut = undefined,
}: Props) => {
  return (
    <TouchableOpacity style={styles.container} onPressOut={onPressOut}>
      <Text style={styles.titleText}>{title}</Text>
      {showArrow && (
        <MaterialIcons name="chevron-right" size={24} color="black" />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
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

export default SettingsItemButton;

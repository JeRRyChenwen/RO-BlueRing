import { View, StyleSheet, Pressable } from "react-native";
import React from "react";
import { Text } from "@ui-kitten/components";
import { GestureResponderEvent } from "react-native/Libraries/Types/CoreEventTypes";
import { TouchableOpacity } from "react-native-gesture-handler";

type Props = {
  title?: string;
  color?: string;
  icon?: React.ReactNode;
  onPress?: (((event: GestureResponderEvent) => void) & (() => void)) | undefined;
};

const PressableTile = ({
  title = "",
  icon = undefined,
  color = "#3C91C0",
  onPress: HandlePress = undefined,
}: Props) => {
  return (
    <View style={styles.tile}>
      <TouchableOpacity style={styles.pressable} onPress={HandlePress}>
        <View style={{ ...styles.tileContent, backgroundColor: color }}>
          <Text style={{ ...styles.tileText, color: "white" }}>{title}</Text>
          <View style={styles.tileIconContainer}>{icon ? icon : null}</View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    width: "auto",
    margin: 7,
    borderRadius: 12,
    overflow: "hidden",
  },
  pressable: {
    width: "100%",
    height: "100%",
  },
  tileContent: {
    flex: 1,
    padding: 15,
  },
  tileText: {
    fontSize: 18,
    fontWeight: "bold",
    alignSelf: "flex-start",
  },
  tileIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    marginBottom: 3,
    marginRight: 3,
  },
});

export default PressableTile;

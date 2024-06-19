import {
    View,
    StyleSheet,
    Pressable,
    GestureResponderEvent,
  } from "react-native";
  import { Text } from "@ui-kitten/components";
  import React from "react";
  
  type Props = {
    title?: string;
    icon?: React.ReactNode;
    onPressOut?: (event: GestureResponderEvent) => void;
  };
  
  export const DrawerNavButton = ({
    title = "Link",
    icon,
    onPressOut,
  }: Props) => {
    return (
      <Pressable onPressOut={onPressOut} style={styles.pressable}>
        <View>{icon ?? null}</View>
        <Text style={styles.title}>{title}</Text>
      </Pressable>
    );
  };
  
  const styles = StyleSheet.create({
    pressable: {
      paddingLeft: 35,
      paddingTop: 15,
      paddingBottom: 15,
      flexDirection: "row",
      justifyContent: "flex-start",
    },
    title: {
      marginLeft: 10,
      fontSize: 16,
    },
  });
  
  export default DrawerNavButton;
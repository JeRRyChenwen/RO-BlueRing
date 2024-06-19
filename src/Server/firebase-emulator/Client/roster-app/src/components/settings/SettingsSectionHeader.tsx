import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@ui-kitten/components";

type Props = {
  title?: string;
};

const SettingsSectionHeader = ({ title = "" }: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 70,
    paddingLeft: 20,
    paddingTop: 30,
    paddingBottom: 15,
  },
  titleText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default SettingsSectionHeader;

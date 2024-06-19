import { View, StyleSheet } from "react-native";
import { Text } from "@ui-kitten/components";
import React from "react";

type Props = {
  workplaceName?: string;
  color?: string;
  headingType?: string;
};

const WorkplaceNameHeader = ({
  workplaceName = "(Unknown)",
  color = "grey",
  headingType = "h5",
}: Props) => {
  return (
    <View style={styles.header}>
      <View style={{ ...styles.colorBar, backgroundColor: color }}></View>
      <Text style={styles.titleText} category={headingType} numberOfLines={1}>
        {workplaceName ? workplaceName : "No Workplace"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
  },
  colorBar: {
    width: 8,
    height: 30,
    marginRight: 8,
    alignSelf: "center",
  },
  titleText: {
    flex: 1,
    textAlign: "left",
    marginRight: 15,
  },
});

export default WorkplaceNameHeader;

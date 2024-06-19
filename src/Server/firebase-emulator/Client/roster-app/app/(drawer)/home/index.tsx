import { View, StyleSheet } from "react-native";
import React from "react";
import { router } from "expo-router";
import PressableTile from "@components/PressableTile";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { Button } from "@ui-kitten/components";

const HomePage = () => {
  const goToPage = (path: string) => {
    router.push(path);
  };

  /* #region Icons */
  const workplacesIcon = (
    <MaterialIcons
      name="place"
      size={100}
      color="white"
      style={styles.tileIcon}
    />
  );

  const calendarIcon = (
    <Ionicons
      name="calendar-sharp"
      size={128}
      color="white"
      style={styles.tileIcon}
    />
  );

  const documentsIcon = (
    <Ionicons
      name="document-text"
      size={75}
      color="white"
      style={styles.tileIcon}
    />
  );

  const availabilitiesIcon = (
    <MaterialIcons
      name="schedule"
      size={100}
      color="white"
      style={styles.tileIcon}
    />
  );

  const profileIcon = (
    <Ionicons name="person" size={75} color="white" style={styles.tileIcon} />
  );
  /* #endregion */

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}></View>
      <View style={styles.featureSection}>
        <View style={{ ...styles.tileRow, flex: 0.8 }}>
          <PressableTile
            title={"Workplaces"}
            icon={workplacesIcon}
            onPress={() => goToPage("/workplaces")}
          />
        </View>
        <View style={{ ...styles.tileRow, flex: 1.2 }}>
          <PressableTile
            title={"My Calendar"}
            icon={calendarIcon}
            onPress={() => goToPage("/work-shifts")}
          />
        </View>
        <View style={styles.tileRow}>
          <PressableTile
            title={"Profile"}
            icon={profileIcon}
            onPress={() => goToPage("/profile")}
          />
          <PressableTile
            title={"Documents"}
            icon={documentsIcon}
            onPress={() => goToPage("/examples/empty-example")}
          />
        </View>
        <View style={styles.tileRow}>
          <PressableTile
            title={"Availability"}
            icon={availabilitiesIcon}
            onPress={() => goToPage("/availability/standard")}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 25,
  },
  headerSection: {
    width: "100%",
    flexBasis: "10%",
  },
  featureSection: {
    width: "100%",
    flexBasis: "75%",
  },
  tileRow: {
    flex: 1,
    flexDirection: "row",
  },
  tileIcon: {
    opacity: 0.35,
  },
});

export default HomePage;

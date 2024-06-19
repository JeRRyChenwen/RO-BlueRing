import { View, StyleSheet, ScrollView } from "react-native";
import React from "react";
import { router } from "expo-router";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { Text } from "@ui-kitten/components";
import { Ionicons } from "@expo/vector-icons";
import DrawerNavButton from "@components/drawer/DrawerNavButton";
import { auth } from "@services/firebaseConfig";

let uid: string = "0";
let username: string | null = null;
// Set up an observer to listen for changes in the user's sign-in state
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("User is signed in with UID: " + user.uid);
    uid = user.uid;
    username = user.displayName;
  } else {
    console.log("User is signed out");
    uid = "0";
    username = null;
  }
});

const HomeDrawerContent = (props: DrawerContentComponentProps) => {

  return (
    <ScrollView style={styles.container}>
      <View style={styles.accountContainer}>
        <View style={styles.avatarContainer}></View>
        <View style={styles.accountInfoContainer}>
          <Text style={styles.usernameText}>{username ? username : "Guest"}</Text>
        </View>
      </View>
      <View style={styles.navLinksContainer}>
        <DrawerNavButton
          title={"Settings"}
          icon={<Ionicons name="settings-outline" size={24} color="black" />}
          onPressOut={() => {
            router.push("/settings");
          }}
        />
        <DrawerNavButton
          title={"Help"}
          icon={<Ionicons name="help-circle-outline" size={24} color="black" />}
          onPressOut={() => {
            router.push("/examples/empty-example");
          }}
        />
        <DrawerNavButton
          title={"About"}
          icon={<Ionicons name="md-information-circle-outline" size={24} color="black" />}
          onPressOut={() => {
            router.push("/examples/empty-example");
          }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  accountContainer: {
    height: 125,
    width: "100%",
    marginTop: 50,
    padding: 15,
    justifyContent: "flex-start",
    flexDirection: "row",
  },
  navLinksContainer: {
    width: "100%",
    marginTop: 5,
    justifyContent: "flex-start",
    flexDirection: "column",
  },
  accountInfoContainer: {
    marginLeft: 25,
    paddingTop: 15,
  },
  avatarContainer: {
    height: 80,
    width: 80,
    borderRadius: 40,
    marginLeft: 10,
    backgroundColor: "lightgrey",
  },
  usernameText: { fontSize: 16 },
});

export default HomeDrawerContent;

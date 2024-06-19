import React from "react";
import {Alert} from "react-native"
import { ScrollView } from "react-native-gesture-handler";
import SettingsEditableItem from "@components/settings/SettingsEditableItem";
import SettingsItemButton from "@components/settings/SettingsItemButton";
import { Stack, router } from "expo-router";
import { getAuth } from "firebase/auth";

const auth = getAuth();
let uid = "annonymous";
// Set up an observer to listen for changes in the user's sign-in state
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("Current user's UID: " + user.uid);
    uid = user.uid;
  } else {
    console.log("User is signed out");
    uid = "annonymous";
  }
});

const signOut = () => {
  if (uid !== "annonymous") {
    Alert.alert(
      '',
      'Are you sure you want to sign out current account?',
      [
        {
          text: 'Yes',
          onPress: () => {
            auth.signOut().then(() => {
              // Sign-out successful.
              console.log("In account settings, user signed out successfully");
              Alert.alert(
                "",
                "You have successfully logged out"
              );
            }).catch((error) => {
              // An error happened.
              console.error("Error signing out: " + error.message);
            });
          },
        },
        {text: 'No'},
      ],
      { cancelable: false }
    );
  } else {
    Alert.alert(
      "No Account",
      "You haven't logged in."
    );
  }
};

const deleteAccount = () => {
  if (auth.currentUser) router.push("/account/delete-account");
  else Alert.alert(
    "No Account",
    "You haven't logged in."
  );
};

const AccountSettingsPage = () => {

  return (
    <ScrollView>
      <Stack.Screen
        options={{
          title: "Account Settings",
        }}
      />
      <SettingsEditableItem title="Login Email" />
      <SettingsItemButton
        title="Change Password"
        showArrow={true}
        onPressOut={() => router.push("/account/password-change")}
      />
      <SettingsItemButton
        title="Delete Account"
        showArrow={true}
        onPressOut={deleteAccount}
      />
      <SettingsItemButton title="Sign Out" showArrow={false} onPressOut={signOut}/>
    </ScrollView>
  );
};

export default AccountSettingsPage;

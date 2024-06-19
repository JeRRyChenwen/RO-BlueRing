import { ScrollView } from "react-native";
import React from "react";
import SettingsItemButton from "@components/settings/SettingsItemButton";
import SettingsSectionHeader from "@components/settings/SettingsSectionHeader";
import { Stack, router } from "expo-router";

const SettingsPage = () => {
  return (
    <ScrollView>
      <Stack.Screen
        options={{
          title: "Settings",
        }}
      />
      <SettingsSectionHeader title="App" />
      <SettingsItemButton title="Notifications" showArrow={true} />
      <SettingsItemButton title="Privacy" showArrow={true} />

      <SettingsSectionHeader title="Account" />
      <SettingsItemButton
        title="My Account"
        showArrow={true}
        onPressOut={() => router.push("settings/account")}
      />
    </ScrollView>
  );
};

export default SettingsPage;

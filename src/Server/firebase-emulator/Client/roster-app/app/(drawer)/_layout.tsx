import React from "react";
import { Drawer } from "expo-router/drawer";
import { useRootNavigation } from "expo-router/src/hooks";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import HomeDrawerContent from "@components/drawer/HomeDrawerContent";

const HomeLayout = () => {
  const rootNavigation = useRootNavigation();
  console.log(rootNavigation?.getRootState().routeNames);
  return (
    <Drawer
      drawerContent={(props: DrawerContentComponentProps) => {
        return <HomeDrawerContent {...props} />;
      }}
    >
      <Drawer.Screen name="home/index" options={{ title: "Home" }} />
    </Drawer>
  );
};

export default HomeLayout;

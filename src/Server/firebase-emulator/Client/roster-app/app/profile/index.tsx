import React, { useState, useEffect, useMemo } from "react";
import { View, StyleSheet, Image, Alert } from "react-native";
import { Layout, Text, Button, Card } from "@ui-kitten/components";
import { Stack, useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import { Profile } from "@api/types/Profile";
import { getProfile } from "@api/db/profileDatabase";
import { useIsFocused } from "@react-navigation/native";
import * as FileSystem from 'expo-file-system';

const ProfilePage = () => {
  const router = useRouter();
  const isFocused = useIsFocused();
  const [profile, setProfile] = useState<Profile>({
    userId: "",
    firstName: "",
    lastName: "",
    gender: "Prefer not to say",
    birthday: new Date(),
    contactPhone: "",
    contactEmail: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postcode: "",
  });
  const [image, setImage] = useState<string | null>(null);
  const [imageVersion, setImageVersion] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const auth = getAuth();
  const [uid, setUid] = useState("annonymous");
  const PROFILE_IMAGE_PATH = useMemo(() => {
    return FileSystem.documentDirectory + uid + '_profileImage.png';
  }, [uid]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && user.uid !== uid) {
        console.log("User is signed in with UID: " + user.uid);
        setUid(user.uid);
        setIsLoading(false);
      } else if (!user && uid !== "annonymous") {
        console.log("User is signed out");
        setUid("annonymous");
        setIsLoading(true);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [uid]);

  useEffect(() => {
    if (!isLoading && isFocused) {
      loadData();

      FileSystem.getInfoAsync(PROFILE_IMAGE_PATH)
        .then(({ exists }) => {
          if (exists) {
            setImage(PROFILE_IMAGE_PATH);
          }
        })
        .catch((error) => {
          console.log("Error loading saved profile image:", error);
        });
    }
  }, [isFocused, isLoading, PROFILE_IMAGE_PATH]);

  const loadData = () => {
    getProfile(uid)
      .then((profile) => {
        if (profile != null) setProfile(profile);
      })
      .catch((error) => {
        Alert.alert("Error", error.message);
      });

    console.log("----path:", PROFILE_IMAGE_PATH)
    FileSystem.getInfoAsync(PROFILE_IMAGE_PATH)
      .then(({ exists }) => {
        if (exists) {
          const newTimestamp = new Date().getTime();
          setImage(PROFILE_IMAGE_PATH + '?v=' + newTimestamp);
        }
      })
      .catch((error) => {
        console.log("Error loading saved profile image:", error);
      });
  };


  const goToEditProfilePage = () => {
    router.push({
      pathname: "/profile/edit",
    });
  };

  return (
    <Layout style={styles.container}>
      <Stack.Screen
        options={{
          title: "Profile",
        }}
      />
      {profile && (
        <Card style={styles.cardContainer}>
          <View style={styles.avatarContainer}>
            <Image style={styles.avatar} source={image ? { uri: image + '?v=' + imageVersion } : require("@assets/icons/profile.png")} />
            <Text style={styles.userName}>{profile.firstName}</Text>
          </View>
          <View style={styles.avatarContainer}>
            <Text>Gender</Text>
            <Text style={styles.userName}>{profile.gender}</Text>
          </View>
          <View style={styles.avatarContainer}>
            <Text>Address</Text>
            <Text style={styles.userName}>{profile.addressLine1}</Text>
          </View>
          <View style={styles.avatarContainer}>
            <Text>Birthday</Text>
            <Text style={styles.userName}>
              {profile.birthday ? profile.birthday.toDateString() : ""}
            </Text>
          </View>
          <View style={styles.avatarContainer}>
            <Text>Contact Phone</Text>
            <Text style={styles.userName}>{profile.contactPhone}</Text>
          </View>
          <View style={styles.avatarContainer}>
            <Text>Email</Text>
            <Text style={styles.userName}>{profile.contactEmail}</Text>
          </View>
          <Button style={styles.editButton} onPress={goToEditProfilePage}>
            Edit
          </Button>
        </Card>
      )}
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  cardContainer: {
    padding: 20,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  userName: {
    fontWeight: "bold",
  },
  editButton: {
    marginTop: 20,
  },
});

export default ProfilePage;

import React, { useState, useRef } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Layout, Text, Avatar, Input, Button } from "@ui-kitten/components";
import { Stack, useRouter } from "expo-router";
import * as profileValidator from "@functions/profile/profileValidator";
import { useEffect } from "react";
import { getAuth } from "firebase/auth";
import { Profile } from "@api/types/Profile";
import { getProfile, saveProfile } from "@api/db/profileDatabase";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Select, SelectItem, IndexPath } from "@ui-kitten/components";
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import PhoneInput from 'react-native-phone-input';

const auth = getAuth();
let uid = "annonymous";
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("User is signed in with UID: " + user.uid);
    uid = user.uid;
  } else {
    console.log("User is signed out");
    uid = "annonymous";
  }
});

const getPermissionAsync = async () => {
  if (Constants.platform?.ios) {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, Need the permission of camera.');
    }
  }
};

const PROFILE_IMAGE_PATH = FileSystem.documentDirectory + uid + '_profileImage.png';


const ProfileEditPage = () => {
  const router = useRouter();

  const [name, setName] = useState<string>("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other" | "Prefer not to say">("Prefer not to say");
  const [birthday, setBirthday] = useState<Date>(new Date());
  const [address, setAddress] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [image, setImage] = useState<string | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);


  const [errors, setErrors] = useState({
    name: "",
    gender: "",
    Address: "",
    birthday: "",
    phone: "",
    email: "",
  });

  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const genderOptions: { text: "Male" | "Female" | "Other" | "Prefer not to say" }[] = [
    { text: "Male" },
    { text: "Female" },
    { text: "Other" },
    { text: "Prefer not to say" },
  ];

  const phoneInputRef = useRef<any>(null);
  const handlePhoneChange = () => {
    if (phoneInputRef.current) {
      const phoneNumber = phoneInputRef.current.getValue();
      setPhone(phoneNumber);
    }
  };


  const [profileImagePath, setProfileImagePath] = useState(FileSystem.documentDirectory + uid + '_profileImage.png');

  useEffect(() => {
    setProfileImagePath(FileSystem.documentDirectory + uid + '_profileImage.png');
  }, [uid]);

  useEffect(() => {
    loadData();
    getPermissionAsync();
  }, []);

  const loadData = () => {
    getProfile(uid)
      .then((profile) => {
        if (profile != null) {
          setName(profile.firstName);
          setGender(profile.gender);
          setBirthday(profile.birthday);
          setAddress(profile.addressLine1);
          setPhone(profile.contactPhone);
          setEmail(profile.contactEmail);
          if (phoneInputRef.current) {
            phoneInputRef.current.setValue(profile.contactPhone);
          }
        }
      })
      .catch((error) => {
        Alert.alert("Error", error.message);
      });

    FileSystem.getInfoAsync(profileImagePath)
      .then(({ exists }) => {
        if (exists) {
          setImage(profileImagePath);
        }
      })
      .catch((error) => {
        console.log("Error loading saved profile image:", error);
      });
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    // Check if the result contains the assets array and it's not empty
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri: string = result.assets[0].uri;  // Get the uri of the first asset

      FileSystem.moveAsync({
        from: uri,
        to: profileImagePath,
      })
        .then(() => {
          setImage(profileImagePath + '?' + new Date().getTime());  // Add a unique timestamp
          setForceUpdate(prev => prev + 1); // This will force a re-render
        })
        .catch((error) => {
          console.log("Error saving profile image:", error);
        });

    }


  };


  const onSaveProfile = async () => {
    const nameError = profileValidator.validateName(name);
    const genderError = profileValidator.validateGender(gender);
    const addressError = profileValidator.validateAddress(address);
    const birthdayError = profileValidator.validateBirthday(birthday);
    const phoneError = profileValidator.validatePhone(phone);
    const emailError = profileValidator.validateEmail(email);

    setErrors({
      name: nameError,
      gender: genderError,
      Address: addressError,
      birthday: birthdayError,
      phone: phoneError,
      email: emailError,
    });

    if (nameError || genderError || addressError || birthdayError || phoneError || emailError)
      return;

    try {
      const newProfile: Profile = {
        userId: uid,
        firstName: name,
        lastName: "",
        gender: gender,
        birthday: birthday,
        contactPhone: phone,
        contactEmail: email,
        addressLine1: address,
        addressLine2: "",
        city: "",
        state: "",
        postcode: "",
      };
      await saveProfile(newProfile);
      router.push("/profile");
    } catch (error) { }
  };

  return (
    <Layout style={styles.container}>
      <Stack.Screen
        options={{
          title: "Edit Profile",
        }}
      />
      <ScrollView>
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={pickImage}>
            <Avatar style={styles.avatar} source={image ? { uri: image } : require("@assets/icons/profile.png")} />
          </TouchableOpacity>
        </View>
        <View style={styles.profileContainer}>
          <View style={styles.inputContainer}>
            <Text style={{ color: "red" }}>{errors.name}</Text>
            <Input
              value={name}
              label="Name"
              placeholder="Add a Name"
              onChangeText={(text) => setName(text)}
            />
          </View>
          <View style={styles.inputContainer}>
            <Select
              label="Gender"
              value={gender}
              onSelect={(index) => setGender(genderOptions[(index as IndexPath).row].text)}
              placeholder="Select Gender"
              style={{ width: "100%" }}
            >
              {genderOptions.map((option) => (
                <SelectItem title={option.text} key={option.text} />
              ))}
            </Select>
          </View>
          <View style={styles.inputContainer}>
            <Text style={{ color: "red" }}>{errors.Address}</Text>
            <Input
              value={address}
              label="Address"
              placeholder="Add an Address"
              onChangeText={(text) => setAddress(text)}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={{ color: "red" }}>{errors.birthday}</Text>
            <View style={{ zIndex: 1 }}>
              <Input
                value={birthday.toDateString()}
                label="Birthday"
                editable={false}
                pointerEvents="none"
              />
              <TouchableOpacity
                style={styles.overlayButton}
                onPress={() => setDatePickerVisible(true)}
              />
            </View>
            {isDatePickerVisible && (
              <DateTimePicker
                value={birthday}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setDatePickerVisible(false);
                  if (selectedDate) {
                    setBirthday(selectedDate);
                  }
                }}
              />
            )}
          </View>
          {/* <View style={styles.inputContainer}>
            <Text style={{ color: "red" }}>{errors.phone}</Text>
            <Input value={phone} label="Contact Phone" onChangeText={(text) => setPhone(text)} />
          </View> */}
          <View style={styles.inputContainer}>
            <Text style={{ color: "red" }}>{errors.phone}</Text>
            <PhoneInput
              ref={phoneInputRef}
              initialCountry="au"
              style={{
                borderColor: "gray",
                borderWidth: 1,
                borderRadius: 5,
                height: 40,
                paddingHorizontal: 10,
                justifyContent: "center",
              }}
              onChangePhoneNumber={handlePhoneChange}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={{ color: "red" }}>{errors.email}</Text>
            <Input value={email} label="Email" onChangeText={(text) => setEmail(text)} />
          </View>
          <Button style={styles.saveButton} onPress={() => onSaveProfile()}>
            Save
          </Button>
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    backgroundColor: "#f7f9fc",
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 5,
  },
  avatar: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  profileContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  inputContainer: {
    marginBottom: 16,
    width: "100%",
  },
  saveButton: {
    marginTop: 16,
  },
  overlayButton: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
  },
});

export default ProfileEditPage;

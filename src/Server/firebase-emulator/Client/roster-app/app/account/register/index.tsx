import React, { useState } from "react";
import { Text, View, TextInput, TouchableOpacity, Alert } from "react-native";
import { auth } from "@services/firebaseConfig";
import {
  updateProfile,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { Button, Card, Modal } from "@ui-kitten/components";
import { Stack, useRouter } from "expo-router";
import { styles } from "../login";
import { saveAccount } from "@api/db/accountDatabase";
import { Account } from "@api/types/Account";

const RegisterPage = () => {
  const router = useRouter();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [registerSuccessPopup, setRegisterSuccessPopup] = useState<boolean>(false);

  const register = () => {
    if (!validateInput()) {
      Alert.alert(
        "Invalid Input",
        "Please input a valid email address and the password should be longer than 6."
      );
      return;
    }

    if (auth.currentUser) signOut(auth);

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Registration successful.
        const user = userCredential.user;
        updateProfile(user, { displayName: name });
        sendEmailVerification(user);
        setRegisterSuccessPopup(true);

        // Save user account data to databse.
        const account: Account = {
          userId: user.uid,
          username: name,
          email: user.email,
        };
        saveAccount(account).catch((error) => {
          Alert.alert("Error", error.message);
        });
      })
      .catch((error) => {
        console.error("Error when registering account: ", error);
        if (error.code == "auth/email-already-in-use") {
          Alert.alert("Invalid Email", "The email address is already in use.");
        } else if (error.code == "auth/invalid-email") {
          Alert.alert("Invalid Email", "The email address is not valid.");
        } else if (error.code == "auth/operation-not-allowed") {
          Alert.alert("Error", "Operation not allowed.");
        } else if (error.code == "auth/weak-password") {
          Alert.alert("Invalid Password", "The password is too weak.");
        } else {
          Alert.alert("Error", error.code);
        }
      });
  };

  const validateInput = () => {
    // const regex is for testing email format.
    const regex = /^[a-zA-Z0-9.]+@[a-zA-Z0-9.]+\.[a-zA-Z]{2,}$/;
    return regex.test(email) && password.length >= 6;
  };

  const goToPage = async (path: string) => {
    router.push({
      pathname: path,
    });
  };

  return (
    <View style={styles.container}>
      {/* <Image style={styles.image} 
            source={require("../assets/default-avatar.png")} 
            /> */}
      <Stack.Screen
        options={{
          title: "Register",
        }}
      />
      <View style={styles.inputView}>
        <TextInput
          style={styles.textInput}
          textAlign="center"
          placeholder="Name"
          placeholderTextColor={"#003f5c"}
          onChangeText={(name) => setName(name)}
        />
      </View>
      <View style={styles.inputView}>
        <TextInput
          style={styles.textInput}
          textAlign="center"
          placeholder="Email"
          placeholderTextColor={"#003f5c"}
          onChangeText={(email) => setEmail(email)}
        />
      </View>
      <View style={styles.inputView}>
        <TextInput
          style={styles.textInput}
          textAlign="center"
          placeholder="Password"
          placeholderTextColor={"#003f5c"}
          secureTextEntry={true}
          onChangeText={(password) => setPassword(password)}
        />
      </View>

      <TouchableOpacity style={styles.login} onPress={() => register()}>
        <Text>Start Casual Work Life</Text>
      </TouchableOpacity>

      <Modal visible={registerSuccessPopup}>
        <Card disabled={true}>
          <Text>You're all set! We've sent you an verification email.</Text>
          <Button
            appearance="ghost"
            onPress={() => {
              setRegisterSuccessPopup(false);
              goToPage("/(drawer)/home");
            }}
          >
            OK
          </Button>
        </Card>
      </Modal>
    </View>
  );
};

export default RegisterPage;

import React, { useState } from "react";
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, Alert } from "react-native";
import { auth } from "@services/firebaseConfig";
import { signOut, signInWithEmailAndPassword } from "firebase/auth";
import { Stack, router } from "expo-router";
//import { Button, Card, Modal } from "@ui-kitten/components";

const LoginPage = () => {

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const validateInput = () => {
    // const regex is for testing email format.
    const regex = /^[a-zA-Z0-9.]+@[a-zA-Z0-9.]+\.[a-zA-Z]{2,}$/;
    return regex.test(email) && password.length >= 6;
  };

  const login = () => {
    if (!validateInput()) {
      Alert.alert(
        "Invalid Input",
        "Please input a valid email address and the password should be longer than 6."
      );
      return;
    }

    if (auth.currentUser) signOut(auth);

    signInWithEmailAndPassword(auth, email, password)
      .then((/*userCredential*/) => {
        //const user = userCredential.user;
        Alert.alert(
          "",
          "You're all set!",
          [{
            text: 'OK',
            onPress: () => { goToPage("/(drawer)/home"); },
            },],
          { cancelable: false }
        );
      })
      .catch((error) => {
        console.error("Error when signing in: ", error);
        if (error.code == "auth/invalid-login-credentials") {
          Alert.alert(
            "Invalid Login Credentials",
            "Please check that you have entered the correct email and password."
          );
        } else Alert.alert("Login Error", error.code);
      });
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
          title: "Login",
        }}
      />
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
      <TouchableOpacity
        style={styles.forgotPwBtn}
        onPress={() => goToPage("/account/password-recover")}
      >
        <Text>Forgot Password?</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.login} onPress={login}>
        <Text>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.forgotPwBtn} onPress={() => goToPage("/account/register")}>
        <Text>Register</Text>
      </TouchableOpacity>
    </View>
  );
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    marginBottom: 40,
  },
  inputView: {
    backgroundColor: "#a3e4d7",
    borderRadius: 30,
    width: "70%",
    height: 45,
    marginBottom: 20,
    alignItems: "center",
  },
  textInput: {
    width: "70%",
    height: 45,
    //flex: 1,
    padding: 10,
  },
  forgotPwBtn: {
    height: 45,
    marginBottom: 30,
  },
  login: {
    width: "80%",
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    marginBottom: 20,
    backgroundColor: "#148f77",
  },
  btmPanel: {
    width: "70%",
    height: 45,
    //marginTop:30,
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
});

export default LoginPage;

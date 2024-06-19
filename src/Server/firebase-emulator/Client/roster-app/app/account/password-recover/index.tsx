import React, { useState } from "react";
import { Text, View, TextInput, TouchableOpacity, Alert } from "react-native";
import { auth } from "@services/firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";
import { Button, Card, Modal } from "@ui-kitten/components";
import { styles } from "../login";
import { Stack, useRouter } from "expo-router";

const PasswordRecoverPage = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [sendEmailSuccessful, setSendEmailSuccessful] = useState(false);

  const validateInput = () => {
    // const regex is for testing email format.
    const regex = /^[a-zA-Z0-9.]+@[a-zA-Z0-9.]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const sendEmail = () => {
    if (!validateInput()) {
      Alert.alert("Invalid Email", "Please input a valid email address.");
      return;
    }

    sendPasswordResetEmail(auth, email)
      .then(() => {
        setSendEmailSuccessful(true);
      })
      .catch((error) => {
        console.error("Error sending password reset email: ", error);
        Alert.alert("Error", error.code);
      });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Password Recovery",
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
      <TouchableOpacity style={styles.login} onPress={() => sendEmail()}>
        <Text>Send verification email</Text>
      </TouchableOpacity>

      <Modal visible={sendEmailSuccessful}>
        <Card disabled={true}>
          <Text>We've sent an email to your registered email address to reset your password.</Text>
          <Button appearance="ghost" onPress={router.back}>
            OK
          </Button>
        </Card>
      </Modal>
    </View>
  );
};

export default PasswordRecoverPage;

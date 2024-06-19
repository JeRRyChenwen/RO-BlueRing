import React, { useState } from "react";
import {
  getAuth,
  updatePassword,
  signOut,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from "react-native";
import { Button, Card, Modal } from "@ui-kitten/components";
import { styles } from "../login";
import { Stack, useRouter } from "expo-router";

const ChangePassword = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPw, setNewPw] = useState("");
  const [changeSuccessful, setChangeSuccessful] = useState(false);
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("Error happened.");
  const [inputInvalid, setInputInvalid] = useState(false);

  const validateInput = () => {
    // const regex is for testing email format.
    const regex = /^[a-zA-Z0-9.]+@[a-zA-Z0-9.]+\.[a-zA-Z]{2,}$/;
    return regex.test(email) && password.length >= 6 && newPw.length >= 6;
  };

  const change = () => {
    if (validateInput()) {
      const auth = getAuth();
      fetchSignInMethodsForEmail(auth, email)
        .then((methods) => {
          if (methods.length === 0) {
            setErrorMsg("Your input email does not belong to an existing account");
            setError(true);
          } else {
            if (auth.currentUser) {
              signOut(auth);
            }
            signInWithEmailAndPassword(auth, email, password)
              .then((userCredential) => {
                const user = userCredential.user;
                updatePassword(user, newPw)
                  .then(() => {
                    setChangeSuccessful(true);
                  })
                  .catch((error) => {
                    setErrorMsg("Error updating password.");
                    console.error(errorMsg, error);
                    setError(true);
                  });
              })
              .catch((error) => {
                setErrorMsg(
                  "Error signing in the user, check if the input old password is correct."
                );
                console.error(errorMsg, error);
                setError(true);
              });
          }
        })
        .catch((error) => {
          setErrorMsg("Error fetching account information. ");
          console.error(errorMsg, error);
          setError(true);
        });
    } else {
      setInputInvalid(true);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Change Password",
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
          placeholder="Old password"
          placeholderTextColor={"#003f5c"}
          onChangeText={(password) => setPassword(password)}
        />
      </View>
      <View style={styles.inputView}>
        <TextInput
          style={styles.textInput}
          textAlign="center"
          placeholder="New password"
          placeholderTextColor={"#003f5c"}
          onChangeText={(newPw) => setNewPw(newPw)}
        />
      </View>
      <TouchableOpacity style={styles.login} onPress={change}>
        <Text>Change</Text>
      </TouchableOpacity>

      <Modal visible={changeSuccessful}>
        <Card disabled={true}>
          <Text>You're all set!</Text>
          <Button appearance="ghost" onPress={router.back}>
            OK
          </Button>
        </Card>
      </Modal>
      <Modal visible={inputInvalid}>
        <Card disabled={true}>
          <Text>Please input a valid email address and the password should be longer than 6.</Text>
          <Button appearance="ghost" onPress={() => setInputInvalid(false)}>
            OK
          </Button>
        </Card>
      </Modal>
      <Modal visible={error}>
        <Card disabled={true}>
          <Text>{errorMsg}</Text>
          <Button appearance="ghost" onPress={() => setError(false)}>
            OK
          </Button>
        </Card>
      </Modal>
    </View>
  );
};

export default ChangePassword;

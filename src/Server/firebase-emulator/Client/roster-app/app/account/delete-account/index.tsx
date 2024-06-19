import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Alert
} from "react-native";
import {
    getAuth,
    signOut,
    signInWithEmailAndPassword
} from "firebase/auth";
import { router } from "expo-router";
import { Button, Card, Modal } from "@ui-kitten/components";
import { styles, } from "../login";

const auth = getAuth();
let thisUser = auth.currentUser;
auth.onAuthStateChanged((user) => {
    if (user) {
        thisUser = user;
    }
});

const deleteAccount = () => {
    Alert.alert(
        '',
        'Are you sure you want to delete current account?',
        [
          {
            text: 'Yes',
            onPress: () => {
                thisUser?.delete()
                    .then(() => {
                        console.log("An account was deleted by the owner.");
                        Alert.alert(
                            "",
                            "You have successfully deleted the account, all of your information will be cleared from the service."
                        );
                    })
                    .catch((error) => {
                        console.error("Error deleting account: " + error.message);
                    });
            },
          },
          {text: 'No'},
        ],
        { cancelable: false }
      );
};
  
const DeleteAccountPage = () => {
    
    return (
        <View style={thisStyles.container}>
            <View style={thisStyles.titleBox}>
                <Text style={thisStyles.title}>
                    Delete Account for
                </Text>
                <Text style={thisStyles.emailDisplay}>
                    {thisUser?.email}
                </Text>
            </View>
            <Text style={thisStyles.textDisplay}>
                After deletion of the account,
                all information of this account will be cleared
                and cannot be recovered.
            </Text>
            <TouchableOpacity
                style={thisStyles.redButton}
                onPress={deleteAccount}
            >
                <Text style={{fontWeight: "bold"}}>
                    Delete Account
                </Text>
            </TouchableOpacity>

        </View>
    )
};

const thisStyles = StyleSheet.create({
    redButton: {
        width: "80%",
        height: 50,
        borderRadius: 25,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 40,
        marginBottom: 20,
        backgroundColor: "#A52A2A",
    },
    container: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: 'flex-start', 
        alignItems: 'center',
        paddingTop: 20, 
    },
    titleBox: {
        alignItems: "center",
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        width: "80%",
        fontWeight: "bold",
        textAlign: "center",
    },
    emailDisplay: {
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
    },
    textDisplay: {
        fontSize: 20,
        width: "80%",
        textAlign: "left",

    }
});

export default DeleteAccountPage;

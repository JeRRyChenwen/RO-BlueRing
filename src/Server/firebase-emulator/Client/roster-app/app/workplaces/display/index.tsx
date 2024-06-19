import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Image, Alert, Text, Animated } from "react-native";
import { Layout, Button, Card, ButtonGroup } from "@ui-kitten/components";
import { Stack, useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router/src/hooks";
import { getAuth } from "firebase/auth";
import { Workplace } from "@api/types/Workplace";
import { deleteWorkplace, getWorkplace } from "@api/db/workplaceDatabase";
import { useIsFocused } from "@react-navigation/native";
import { getAUDCurrency } from "@functions/util/currencyUtil";
import ConfirmModal from "@components/common/ConfirmModal";

const auth = getAuth();
let uid = "annonymous";
// Set up an observer to listen for changes in the user's sign-in state
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("User is signed in with UID: " + user.uid);
    uid = user.uid;
  } else {
    console.log("User is signed out");
    uid = "annonymous";
  }
});

const WorkplaceDetailsPage = () => {
  const router = useRouter();
  const isFocused = useIsFocused();
  const { workplaceId } = useLocalSearchParams() as { workplaceId: string };
  const [workplace, setWorkplace] = useState<Workplace>({
    name: "",
    abn: "",
    address: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    frequency: "Hour",
    standardRate: getAUDCurrency(0),
    overtimeRate: getAUDCurrency(0),
  });

  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);

  useEffect(() => {
    if (!isFocused) return;
    // Retrieve latest workplace data.
    try {
      if (workplaceId) {
        getWorkplace(workplaceId, uid).then((workplace) => {
          if (workplace != null) setWorkplace(workplace);
        });
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  }, [isFocused]);

  const handleEditWorkplace = () => {
    router.push({
      pathname: "/workplaces/edit",
      params: { workplaceId: workplaceId },
    });
  };

  // Pressed delete work shift button on a work shift Entry.
  const handlePressedDeleteWorkplace = () => {
    setDeleteModalVisible(true);
  };

  const handleDeleteWorkplace = async () => {
    try {
      await deleteWorkplace(workplaceId, uid);
      console.log("Document successfully deleted!");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
    router.push({
      pathname: "/workplaces",
    });
  };

  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const sliderPosition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(sliderPosition, {
      toValue: selectedIndex,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [selectedIndex]);

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
  };

  return (
    <Layout style={styles.container}>
      <Stack.Screen
        options={{
          title: "Workplace Details",
        }}
      />
      <View style={styles.buttonGroup}>
        <Animated.View
          style={[
            styles.slider,
            {
              transform: [
                {
                  translateX: sliderPosition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 130],
                  }),
                },
              ],
            },
          ]}
        />

        <Text style={styles.optionText} onPress={() => handleSelect(0)}>
          Place Info
        </Text>
        <Text style={styles.optionText} onPress={() => handleSelect(1)}>
          Pay Details
        </Text>
      </View>

      {selectedIndex === 0 && (
        <>
          {workplace && (
            <Card style={styles.cardContainer}>
              <UserInfo label="Employer Name" value={workplace.name} />
              <UserInfo label="Employer ABN" value={workplace.abn} />
              <UserInfo label="Employer Address" value={workplace.address} />
              <UserInfo label="Employer Contact Name" value={workplace.contactName} />
              <UserInfo label="Employer Contact Phone" value={workplace.contactPhone} />
              <UserInfo label="Employer Contact Email" value={workplace.contactEmail} />
            </Card>
          )}
        </>
      )}
      {selectedIndex === 1 && (
        <>
          {workplace && (
            <Card style={styles.payContainer}>
              <UserInfo label="Frequency" value={workplace.frequency} />
              <UserInfo label="Standard Rate" value={workplace.standardRate.format()} />
              <UserInfo label="Overtime Rate" value={workplace.overtimeRate.format()} />
            </Card>
          )}
        </>
      )}
      <Button style={styles.editButton} onPress={handleEditWorkplace} appearance="outline">
        Edit
      </Button>
      <Button
        style={styles.deleteButton}
        onPress={handlePressedDeleteWorkplace}
        appearance="outline"
      >
        Delete
      </Button>

      <ConfirmModal
        isVisible={deleteModalVisible}
        message="Are you sure to delete this workplace?"
        confirmText="Delete"
        onConfirm={() => {
          setDeleteModalVisible(false);
          handleDeleteWorkplace();
        }}
        onCancel={() => setDeleteModalVisible(false)}
      />
    </Layout>
  );
};

const UserInfo = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.avatarContainer}>
    <Text>{label}</Text>
    <Text style={styles.infoTextBold}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  cardContainer: {
    flex: 1,
    marginTop: 20,
    padding: 20,
    borderRadius: 10,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    width: "95%",
  },
  payContainer: {
    flex: 1,
    marginTop: 20,
    padding: 20,
    borderRadius: 10,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    width: "95%",
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
  infoTextBold: {
    fontWeight: "bold",
  },
  editButton: {
    marginTop: 15,
    borderRadius: 10,
    width: 150,
  },
  deleteButton: {
    marginTop: 15,
    borderRadius: 10,
    width: 150,
  },
  buttonGroup: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#96b1ff",
    borderWidth: 1,
    width: 260,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    padding: 8,
  },
  slider: {
    position: "absolute",
    left: 0,
    width: 130,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#96b1ff",
    zIndex: 1,
  },
  optionText: {
    zIndex: 2,
    color: "black",
    flex: 1,
    textAlign: "center",
    fontSize: 14,
  },
  content: {
    fontSize: 18,
    marginTop: 20,
  },
});

export default WorkplaceDetailsPage;

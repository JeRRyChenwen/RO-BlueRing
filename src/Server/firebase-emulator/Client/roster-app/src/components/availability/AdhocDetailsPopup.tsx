import { View, Modal, StyleSheet } from "react-native";
import { Button, Text } from "@ui-kitten/components";
import { getDisplayTime, getTimeDifferenceMinutes } from "@functions/util/timeUtil";
import { ScrollView } from "react-native-gesture-handler";
import { AdhocEntry } from "@functions/availability/adhocAgenda"; // Updated import
import { useEffect, useState } from "react";
import { auth } from "@services/firebaseConfig";
// Update this import to the appropriate component for adhoc entries
import WorkplaceNameHeader from "@components/work-shifts/WorkplaceNameHeader";

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

type Props = {
  entry: AdhocEntry | undefined;
  isVisible: boolean;
  onEdit?: (entryId: string) => any;
  onDelete?: (entryId: string) => any;
  onClose?: () => any;
};

const AdhocDetailsPopup = ({
  entry,
  isVisible = false,
  onEdit = () => {},
  onDelete = () => {},
  onClose = () => {},
}: Props) => {
  if (entry == undefined) return <View />;

  return (
    <Modal visible={isVisible} transparent={true}>
      <View style={styles.window}>
        <View style={styles.container}>
          <View>
            <WorkplaceNameHeader 
              workplaceName={entry.data.isAvailable ? "Available" : "Unavailable"}
              color={entry.data.isAvailable ? "green" : "red"} 
              headingType="h6" 
            />
          </View>
          <Text style={styles.timeEntry}>
            {getDisplayTime(entry.data.startTime, true)} - {getDisplayTime(entry.data.endTime, true)}
          </Text>
          <Text style={styles.dateEntry}>{entry.data.startTime.toDateString()}</Text>
          <ScrollView style={styles.scrollSection}>
            <View style={styles.detailsSection}>
              <Text style={styles.textEntry}>Notes: {entry.data.note}</Text>
            </View>
          </ScrollView>
          <View style={styles.buttonsSection}>
            <Button
              style={styles.button}
              appearance="outline"
              onPress={() => {
                onEdit(entry.id);
                onClose();
              }}
            >
              Edit
            </Button>
            <Button style={styles.button} appearance="outline" onPress={() => onDelete(entry.id)}>
              Delete
            </Button>
            <Button style={styles.button} onPress={onClose}>
              Close
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  window: {
    backgroundColor: "#000000aa",
    flex: 1,
    justifyContent: "center",
  },
  container: {
    backgroundColor: "#ffffff",
    marginHorizontal: 35,
    paddingHorizontal: 35,
    paddingTop: 20,
    paddingBottom: 20,
    borderRadius: 10,
    flexDirection: "column",
  },
  scrollSection: {
    marginTop: 5,
  },
  buttonsSection: {
    marginTop: 5,
  },
  dateEntry: {
    fontSize: 16,
  },
  timeEntry: {
    fontSize: 16,
    fontWeight: "bold",
  },
  detailsSection: {
    marginVertical: 15,
  },
  textEntry: {
    marginVertical: 2,
  },
  button: {
    marginVertical: 5,
    borderRadius: 20,
    height: 50,
  },
});

export default AdhocDetailsPopup;

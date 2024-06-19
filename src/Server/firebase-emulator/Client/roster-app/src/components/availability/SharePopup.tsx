import { View, Modal, StyleSheet, Alert } from "react-native";
import { Text, Button, Input, Select, SelectItem, IndexPath, Toggle } from "@ui-kitten/components";
import { useEffect, useState } from "react";
import { getWorkplace } from "@api/db/workplaceDatabase";
import { Workplace } from "@api/types/Workplace";
import { auth } from "@services/firebaseConfig";
import { Adhoc } from "@api/types/Availability"; 
import { TimeSlot } from "@api/types/Availability"; 
import { getAllWorkplaces } from "@api/db/workplaceDatabase";

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
  timeSlots: Map<string, TimeSlot>;
  adhocs: Map<string, Adhoc>;
  isVisible: boolean;
  onShare?: (workplaceEmail: string) => any;
  onClose?: () => any;
};

const WorkShiftDetailsPopup = ({
  timeSlots,
  adhocs,
  isVisible = false,
  onShare = (workplaceEmail: string) => {},
  onClose = () => {},
}: Props) => {
  if (!timeSlots && !adhocs) {
    alert("No time slots or adhocs to share");
    return <View></View>;
  }

  interface WorkplaceOption {
    id: string;
    name: string;
    email: string;
  }

  const [workplaces, setWorkplaces] = useState<Map<string, Workplace>>(new Map());
  const [workplaceOptions, setWorkplaceOptions] = useState<WorkplaceOption[]>([]);

  const [workplaceId, setWorkplaceId] = useState<string>("");
  const [workplaceName, setWorkplaceName] = useState<string>("");
  const [workplaceEmail, setWorkplaceEmail] = useState<string>("");

  // Load data on start.
  useEffect(() => {
    loadData();
  }, []);

  // Every time workplaces changes, regenerate a list of workplace options.
  // Note: currently, workplaces will only change when loaded on start.
  useEffect(() => {
    const newWorkplaceOptions: WorkplaceOption[] = Array.from(workplaces.entries()).map(
      ([id, data]) => ({
        id: id,
        name: data.name,
        email: data.contactEmail,
      })
    );
    setWorkplaceOptions(newWorkplaceOptions);
  }, [workplaces]);

  // Load required data.
  const loadData = async () => {
    try {
      // Get all workplaces.
      const workplaces = await getAllWorkplaces(uid);
      setWorkplaces(workplaces);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  // Selected a workplace.
  const handleSetWorkplace = (index: IndexPath) => {
    const option: WorkplaceOption = workplaceOptions[index.row];
    setWorkplaceId(option.id);
    setWorkplaceName(option.name);
    setWorkplaceEmail(option.email);
  };

  return (
    <Modal visible={isVisible} transparent={true}>
      <View style={styles.window}>
        <View style={styles.container}>
          {/* Workplace. */}
          <View style={styles.inputEntry}>
            <Select
              label="Workplace"
              value={workplaceName}
              onSelect={(index) => {
                handleSetWorkplace(index as IndexPath);
              }}
              placeholder="Select a workplace..."
              style={{ width: "100%" }}
            >
              {workplaceOptions.map((option) => (
                <SelectItem title={option.name} key={option.id} />
              ))}
            </Select>
          </View>

          <Text style={styles.emailText}>{workplaceEmail}</Text>
          
          <View style={styles.buttonsSection}>
            <Button
              style={styles.button}
              appearance="outline"
              onPress={() => {
                onShare(workplaceEmail);
                onClose();
              }}
            >
              Share
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
    flex: 0.6,
    backgroundColor: "#ffffff",
    marginHorizontal: 35,
    paddingHorizontal: 35,
    paddingTop: 20,
    paddingBottom: 20,
    borderRadius: 10,
    flexDirection: "column",
  },

  emailText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },

  scrollSection: { marginTop: 5 },
  buttonsSection: {
    marginTop: 5,
  },
  header: {
    marginBottom: 3,
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
  inputEntry: {
    marginVertical: 5,
  },
  inputEntryWithBtn: {
    marginVertical: 5,
    flexDirection: "row",
  },
});

export default WorkShiftDetailsPopup;

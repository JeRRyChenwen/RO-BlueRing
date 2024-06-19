import { View, Modal, StyleSheet, Alert } from "react-native";
import { Button, Text } from "@ui-kitten/components";
import { getDisplayTime, getTimeDifferenceMinutes } from "@functions/util/timeUtil";
import WorkplaceNameHeader from "./WorkplaceNameHeader";
import { ScrollView } from "react-native-gesture-handler";
import { WorkShiftEntry } from "@functions/workShift/workShiftAgenda";
import { useEffect, useState } from "react";
import { getWorkplace } from "@api/db/workplaceDatabase";
import { Workplace } from "@api/types/Workplace";
import { auth } from "@services/firebaseConfig";
import { calculateEarning, getAUDCurrency } from "@functions/util/currencyUtil";
import currency from "currency.js";

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
  entry: WorkShiftEntry | undefined;
  isVisible: boolean;
  onEdit?: (entryId: string) => any;
  onDelete?: (entryId: string) => any;
  onClose?: () => any;
};

const WorkShiftDetailsPopup = ({
  entry,
  isVisible = false,
  onEdit = () => {},
  onDelete = () => {},
  onClose = () => {},
}: Props) => {
  if (entry == undefined) return <View></View>;

  const [workplace, setWorkplace] = useState<Workplace>();
  const [earningFrequencyFieldName, setEarningFrequencyFieldName] = useState<string>("");
  const [earningRate, setEarningRate] = useState<string>("");
  const [estimatedEarning, setEstimatedEarning] = useState<string>("");

  useEffect(() => {
    if (isVisible == true) {
      loadWorkplace();
    } else {
      setEarningFrequencyFieldName("");
      setEarningRate("");
      setEstimatedEarning("");
    }
  }, [isVisible]);

  useEffect(() => {
    if (!workplace) return;
    setEarningFrequencyFieldName(getRateFieldName(workplace));
    setEarningRate(workplace.standardRate.format());
    setEstimatedEarning(
      getEstimatedEarning(workplace, entry.data.startTime, entry.data.endTime).format()
    );
  }, [workplace]);

  const loadWorkplace = () => {
    console.log("Get workplace: " + entry.data.workplaceId);
    if (!entry.data.workplaceId) return;
    getWorkplace(entry.data.workplaceId, uid)
      .then((data) => {
        console.log("Set workplace: " + data);
        if (data) setWorkplace(data);
      })
      .catch((error: any) => {
        Alert.alert("Error", error.message);
      });
  };

  /**
   * Returns a field name (e.g. "Daily" or "Hourly") based on the provided workplace's rate frequency.
   * @param workplace
   * @returns
   */
  const getRateFieldName = (workplace: Workplace): string => {
    switch (workplace.frequency) {
      case "Day": {
        return "Daily Rate: ";
      }
      case "Hour": {
        return "Hourly Rate: ";
      }
    }
    return "";
  };

  const getEstimatedEarning = (workplace: Workplace, startTime: Date, endTime: Date): currency => {
    return calculateEarning(workplace.standardRate, startTime, endTime, workplace.frequency, 8);
  };

  return (
    <Modal visible={isVisible} transparent={true}>
      <View style={styles.window}>
        <View style={styles.container}>
          <View style={styles.header}>
            <WorkplaceNameHeader workplaceName={entry.data.name} color="grey" />
          </View>
          <Text style={styles.timeEntry}>
            {getDisplayTime(entry.data.startTime, true)} - {getDisplayTime(entry.data.endTime, true)}
          </Text>
          <Text style={styles.dateEntry}>{entry.data.startTime.toDateString()}</Text>

          <ScrollView style={styles.scrollSection}>
            <View style={styles.detailsSection}>
              <Text style={styles.textEntry}>
                Duration: {getTimeDifferenceMinutes(entry.data.startTime, entry.data.endTime, true)}{" "}
                minutes
              </Text>
              {workplace && (
                <>
                  <Text style={styles.textEntry}>
                    {earningFrequencyFieldName}
                    {earningRate}
                  </Text>
                  <Text style={styles.textEntry}>Estimated Earning: {estimatedEarning}</Text>
                </>
              )}
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
    flex: 0.6,
    backgroundColor: "#ffffff",
    marginHorizontal: 35,
    paddingHorizontal: 35,
    paddingTop: 20,
    paddingBottom: 20,
    borderRadius: 10,
    flexDirection: "column",
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
});

export default WorkShiftDetailsPopup;

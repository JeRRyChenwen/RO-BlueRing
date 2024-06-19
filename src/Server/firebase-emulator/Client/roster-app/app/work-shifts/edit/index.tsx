import React, { useState, useEffect } from "react";
import { View, StyleSheet, Keyboard, Alert } from "react-native";
import { Text, Button, Input, Select, SelectItem, IndexPath, Toggle } from "@ui-kitten/components";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { getAuth } from "firebase/auth";
import { createWorkShift, getWorkShift, updateWorkShift } from "@api/db/workShiftDatabase";
import { getDisplayTime, modifyDateOnly, modifyTimeOnly } from "@functions/util/timeUtil";
import { Workplace } from "@api/types/Workplace";
import { getAllWorkplaces } from "@api/db/workplaceDatabase";
import { ScrollView } from "react-native-gesture-handler";
import { WorkShiftErrors, validateWorkShift } from "@functions/workShift/workShiftValidator";
import WorkplaceNameHeader from "@components/work-shifts/WorkplaceNameHeader";
import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { WorkShift } from "@api/types/WorkShift";

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

interface WorkplaceOption {
  id: string;
  name: string;
}

const WorkShiftEditPage = () => {
  const { workShiftId, initialDate } = useLocalSearchParams<{
    workShiftId: string;
    initialDate?: string;
  }>();
  const [workplaces, setWorkplaces] = useState<Map<string, Workplace>>(new Map());
  const [workplaceOptions, setWorkplaceOptions] = useState<WorkplaceOption[]>([]);
  const [workShift, setWorkShift] = useState<WorkShift | null>(null);

  // Data fields.
  const [workplaceId, setWorkplaceId] = useState<string>("");
  const [workplaceName, setWorkplaceName] = useState<string>("");
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date>(new Date());
  const [note, setNote] = useState<string>("");

  // Options.
  const [syncCalendarEvent, setSyncCalendarEvent] = useState<boolean>(false);

  // Date time picker popups.
  const [isDatePickerVisible, setIsDatePickerVisible] = useState<boolean>(false);
  const [isStartTimePickerVisible, setIsStartTimePickerVisible] = useState<boolean>(false);
  const [isEndTimePickerVisible, setIsEndTimePickerVisible] = useState<boolean>(false);

  const [errorMessages, setErrorMessages] = useState<WorkShiftErrors>(new WorkShiftErrors());

  // Load data on start.
  useEffect(() => {
    loadData();
    console.log("Received initial date: " + initialDate);
    if (initialDate) handleSetDate(new Date(initialDate));
  }, []);

  // Every time workplaces changes, regenerate a list of workplace options.
  // Note: currently, workplaces will only change when loaded on start.
  useEffect(() => {
    const newWorkplaceOptions: WorkplaceOption[] = Array.from(workplaces.entries()).map(
      ([id, data]) => ({
        id: id,
        name: data.name,
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

      // If editing an existing work shift, get its data.
      if (workShiftId) {
        const existingWorkShift = await getWorkShift(workShiftId, uid);
        if (existingWorkShift != null) {
          setWorkShift(existingWorkShift);
          const name: string | undefined = workplaces.get(existingWorkShift.workplaceId)?.name;
          setWorkplaceId(existingWorkShift.workplaceId);
          setWorkplaceName(name ? name : "");
          setStartTime(existingWorkShift.startTime);
          setEndTime(existingWorkShift.endTime);
          setNote(existingWorkShift.note);
          if(existingWorkShift.eventId !== "") setSyncCalendarEvent(true);
        }
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  // Selected a workplace.
  const handleSetWorkplace = (index: IndexPath) => {
    const option: WorkplaceOption = workplaceOptions[index.row];
    setWorkplaceId(option.id);
    setWorkplaceName(option.name);
  };

  // Selected a date.
  const handleSetDate = (day: Date) => {
    // Update start time and end time date.
    setStartTime(modifyDateOnly(startTime, day));
    setEndTime(modifyDateOnly(endTime, day));
    setIsDatePickerVisible(false);
  };

  // Selected a start time.
  const handleSetStartTime = (time: Date) => {
    setStartTime(modifyTimeOnly(startTime, time));
    setIsStartTimePickerVisible(false);
  };

  // Selected an end time.
  const handleSetEndTime = (time: Date) => {
    setEndTime(modifyTimeOnly(endTime, time));
    setIsEndTimePickerVisible(false);
  };

  // Pressed save.
  const handleSave = async () => {
    try {
      const newWorkShift = {
        workplaceId: workplaceId,
        name: workplaceName,
        startTime: startTime,
        endTime: endTime,
        note: note,
        eventId: workShift ? workShift.eventId : ""
      };
      const workShiftErrorMessages = validateWorkShift(newWorkShift);
      setErrorMessages(workShiftErrorMessages);
      if (workShiftErrorMessages.hasErrors())
        throw new Error("There seems to be errors in some of the inputs.");
      if (workShiftId) updateWorkShift(workShiftId, newWorkShift, uid, syncCalendarEvent);
      else createWorkShift(newWorkShift, uid, syncCalendarEvent);
      router.push("/work-shifts");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  // UI.
  return (
    <ScrollView>
      <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Edit Work Shift",
        }}
      />
        <View style={styles.header}>
          <WorkplaceNameHeader workplaceName={workplaceName} color="orange" />
        </View>
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

        {/* Date. */}
        <View style={styles.inputEntryWithBtn}>
          <Input
            style={styles.input}
            value={startTime.toDateString()}
            label="Date"
            editable={false}
            onFocus={() => Keyboard.dismiss()}
            onPressIn={() => setIsDatePickerVisible(true)}
            showSoftInputOnFocus={false}
            pointerEvents="none"
          />
          <Button
            style={styles.inputEntrySideButton}
            appearance="outline"
            status="basic"
            onPress={() => setIsDatePickerVisible(true)}
          >
            <Ionicons name="ios-calendar-sharp" size={24} color="black" />
          </Button>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            date={startTime}
            onConfirm={handleSetDate}
            onCancel={() => setIsDatePickerVisible(false)}
            textColor="#000000"
          />
        </View>

        {/* Start time. */}
        {errorMessages.time && <Text style={{ color: "red" }}>{errorMessages.time}</Text>}
        <View style={styles.inputEntryWithBtn}>
          <Input
            style={styles.input}
            value={getDisplayTime(startTime, true)}
            label="Start Time"
            editable={false}
            onFocus={() => Keyboard.dismiss()}
            onPressIn={() => setIsStartTimePickerVisible(true)}
            showSoftInputOnFocus={false}
            pointerEvents="none"
            status={errorMessages.time ? "danger" : "basic"}
          />
          <Button
            style={styles.inputEntrySideButton}
            appearance="outline"
            status="basic"
            onPress={() => setIsStartTimePickerVisible(true)}
          >
            <Feather name="clock" size={24} color="black" />
          </Button>
          <DateTimePickerModal
            isVisible={isStartTimePickerVisible}
            mode="time"
            date={startTime}
            is24Hour={true}
            display="spinner"
            onConfirm={handleSetStartTime}
            onCancel={() => setIsStartTimePickerVisible(false)}
            textColor="#000000"
          />
        </View>

        {/* End time. */}
        <View style={styles.inputEntryWithBtn}>
          <Input
            style={styles.input}
            value={getDisplayTime(endTime, true)}
            label="End Time"
            editable={false}
            onFocus={() => Keyboard.dismiss()}
            onPressIn={() => setIsEndTimePickerVisible(true)}
            showSoftInputOnFocus={false}
            pointerEvents="none"
            status={errorMessages.time ? "danger" : "basic"}
          />
          <Button
            style={styles.inputEntrySideButton}
            appearance="outline"
            status="basic"
            onPress={() => setIsEndTimePickerVisible(true)}
          >
            <Feather name="clock" size={24} color="black" />
          </Button>
          <DateTimePickerModal
            isVisible={isEndTimePickerVisible}
            mode="time"
            date={endTime}
            is24Hour={true}
            display="spinner"
            onConfirm={handleSetEndTime}
            onCancel={() => setIsEndTimePickerVisible(false)}
            textColor="#000000"
          />
        </View>

        {/* Notes. */}
        {errorMessages.note && <Text style={{ color: "red" }}>{errorMessages.note}</Text>}
        <View style={styles.inputEntry}>
          <Input
            label={"Notes"}
            value={note}
            placeholder="Write some notes here..."
            onChangeText={(val) => setNote(val)}
            multiline={true}
            numberOfLines={3}
            status={errorMessages.note ? "danger" : "basic"}
          />
        </View>

        {/* Sync calendar event. */}
        <View style={styles.toggleField}>
            <Text>Save Calendar Event</Text>
            <Toggle checked={syncCalendarEvent} onChange={(value) => setSyncCalendarEvent(value)} />
        </View>

        <View style={{ margin: 15 }}>
          <Button onPress={handleSave} style={styles.button}>
            Save
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
    paddingVertical: 25,
  },
  header: {
    marginBottom: 15,
  },
  inputEntry: {
    marginVertical: 5,
  },
  inputEntryWithBtn: {
    marginVertical: 5,
    flexDirection: "row",
  },
  toggleField: {
    marginVertical: 5,
    flexDirection: "row",
    justifyContent: "space-evenly"
  },
  input: {
    flex: 1,
  },
  inputEntrySideButton: {
    height: 10,
    flex: 0.1,
    alignSelf: "flex-end",
  },
  button: {
    borderRadius: 20,
    borderWidth: 0.5,
    alignSelf: "center",
    justifyContent: "center",
    width: "35%",
    height: 50,
    alignItems: "center",
  },
});

export default WorkShiftEditPage;

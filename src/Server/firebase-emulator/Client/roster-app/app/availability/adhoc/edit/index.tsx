import React, { useState, useEffect } from "react";
import { View, StyleSheet, Keyboard, Alert } from "react-native";
import { Text, Button, Input, Toggle, Select, IndexPath, SelectItem } from "@ui-kitten/components";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { getAuth } from "firebase/auth";
import { createAdhoc, getAdhoc, updateAdhoc } from "@api/db/adhocDatabase";
import { getDisplayTime, modifyDateOnly, modifyTimeOnly } from "@functions/util/timeUtil";
import { ScrollView } from "react-native-gesture-handler";
import { AdhocErrors, validateAdhoc } from "@functions/availability/adhocValidator";
import WorkplaceNameHeader from "@components/work-shifts/WorkplaceNameHeader";
import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from '@react-native-picker/picker';

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

const AdhocEditPage = () => {
  const { adhocId, initialDate } = useLocalSearchParams<{
    adhocId: string;
    initialDate?: string;
  }>();

  // Data fields.
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date>(new Date());
  const [note, setNote] = useState<string>("");
  const [isAvailable, setIsAvailable] = useState<boolean>(true);

  const [selectedNumber, setSelectedNumber] = useState(1);

  // Date time picker popups.
  const [isDatePickerVisible, setIsDatePickerVisible] = useState<boolean>(false);
  const [isStartTimePickerVisible, setIsStartTimePickerVisible] = useState<boolean>(false);
  const [isEndTimePickerVisible, setIsEndTimePickerVisible] = useState<boolean>(false);

  const [errorMessages, setErrorMessages] = useState<AdhocErrors>(new AdhocErrors());

  // Load data on start.
  useEffect(() => {
    loadData();
    console.log("Received initial date: " + initialDate);
    if (initialDate) handleSetDate(new Date(initialDate));
  }, []);

  // Load required data.
  const loadData = async () => {
    try {
      // If editing an existing adhoc, get its data.
      if (adhocId) {
        const existingAdhoc = await getAdhoc(adhocId, uid);
        if (existingAdhoc != null) {
          setIsAvailable(existingAdhoc.isAvailable);
          setStartTime(existingAdhoc.startTime);
          setEndTime(existingAdhoc.endTime);
          setNote(existingAdhoc.note);
        }
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleSetAvailable = () => {
    setIsAvailable(!isAvailable);
  }
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
      // Prepare to create multiple adhoc objects
      let currentDay = new Date(startTime);
      const adhocsToCreate = [];
      const daysToAdd = selectedNumber - 1; // Assuming selectedIndex is an IndexPath and days are zero-indexed
  
      for (let i = 0; i <= daysToAdd; i++) {
        // Create a new adhoc object
        const newAdhoc = {
          startTime: new Date(currentDay),
          endTime: new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate(), endTime.getHours(), endTime.getMinutes()),
          note: note,
          isAvailable: isAvailable
        };
  
        // Validate the adhoc object
        const adhocErrorMessages = validateAdhoc(newAdhoc);
        setErrorMessages(adhocErrorMessages);
        if (adhocErrorMessages.hasErrors()) {
          throw new Error(`There are errors in the input for day ${i + 1}.`);
        }
  
        // Add the new adhoc to the array of adhocs to create
        adhocsToCreate.push(newAdhoc);
  
        // Increment the day
        currentDay.setDate(currentDay.getDate() + 1);
      }
  
      // If there are no errors, create all adhoc objects in batch
      for (const adhoc of adhocsToCreate) {
        // Assume createAdhoc function handles creating a new adhoc without an id
        await createAdhoc(adhoc, uid);
      }
  
      // Navigate back to the adhoc list page
      router.push("/availability/adhoc");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  // UI components and styles are assumed to be the same, just renamed to match 'adhoc'

  return (
    <ScrollView>
      <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Edit Add-hoc Availability",
        }}
      />
        <View style={styles.header}>
          <WorkplaceNameHeader 
              workplaceName={isAvailable ? "Available" : "Unavailable"}
              color={isAvailable ? "green" : "red"} 
              headingType="h3" 
          />
          <Toggle
            checked={isAvailable}
            onChange={handleSetAvailable}
          />
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
        <Text style={styles.label}>Select a Number of Dates:</Text>
        <Picker
          selectedValue={selectedNumber}
          onValueChange={(itemValue, itemIndex) =>
            setSelectedNumber(itemValue)
          }>
          {Array.from({ length: 20 }, (_, i) => i + 1).map((number) => (
            <Picker.Item key={number} label={`${number}`} value={number} />
          ))}
        </Picker>

        
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
  label: {
    fontSize: 15,
    marginVertical: 10,
  },
});

export default AdhocEditPage;

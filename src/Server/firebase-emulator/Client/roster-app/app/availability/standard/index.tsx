import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, Linking} from 'react-native';
import { Card, Text, Button } from '@ui-kitten/components';
import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { getDisplayTime, modifyTimeOnly } from "@functions/util/timeUtil";
import { router, Stack } from "expo-router";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { getAuth} from 'firebase/auth';
import { TimeSlotErrors, validateTimeSlot } from "@functions/availability/timeSlotValidator";

import { TimeSlot} from "@api/types/Availability"; 
import { Adhoc } from "@api/types/Availability"; 
import { createTimeSlot, deleteTimeSlot, onTimeSlotsSnapshot, updateTimeSlot} from "@api/db/timeSlotDatabase"; 
import ConfirmModal from "@components/common/ConfirmModal";
import SharePopup from "@components/availability/SharePopup";
import { getAllAdhocs } from '@api/db/adhocDatabase';
import {getProfile} from '@api/db/profileDatabase';

// Array of weekdays
const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const auth = getAuth();
let uid = "annonymous";
// Set up an observer to listen for changes in the user's sign-in state
auth.onAuthStateChanged(user => {
  if (user) {
    console.log("User is signed in with UID: " + user.uid);
    uid = user.uid;
  } else {
    console.log("User is signed out");
    uid = "annonymous";
  }
});

type TimeSlotWithId = {
  id: string;
  startTime: Date;
  endTime: Date;
}

// Function to convert and categorize
const convertAndCategorizeByDay = (timeSlots: Map<string, TimeSlot>): Record<string, TimeSlotWithId[]> => {
  const categorized: Record<string, TimeSlotWithId[]> = {};

  timeSlots.forEach((value, key) => {
    const timeSlotWithId: TimeSlotWithId = {
      id: key,
      ...value
    };

    if (!categorized[value.day]) {
      categorized[value.day] = [];
    }
    categorized[value.day].push(timeSlotWithId);
  });

  return categorized;
};

// Main page component for showing availability
const AvailablityPage = () => {
  
  const [timeSlots, setTimeSlots] = useState<Map<string, TimeSlot>>(new Map());
  const [timeSlotsByDay, setTimeSlotsByDay] = useState<Record<string, TimeSlotWithId[]>>();
  const [adhocs, setAdhocs] = useState<Map<string, Adhoc>>(new Map());
  const [showShare, setShowShare] = useState<boolean>(false);

  useEffect(() => {
    // Listen to realtime changes in the timeslots database.
    try {
      const unsubscribeAdhocs = onTimeSlotsSnapshot(uid, handleGetTimeSlotsData);
      return () => unsubscribeAdhocs();
    } catch (error: any) {
      alert(error.message);
    }
  }, []);
  
  // Update local states based on adhocs data retrieved from database.
  const handleGetTimeSlotsData = (timeSlots: Map<string, TimeSlot>) => {
    console.log("Retrieved TimeSlots: " + timeSlots.size);
    setTimeSlots(timeSlots);
    setTimeSlotsByDay(convertAndCategorizeByDay(timeSlots));
  };


  // Navigation function
  const goToPage = (path: string) => {
    router.push(path);
  };

  // Handler for the share button
  const pressShare = async () => {
    const adhocs = await getAllAdhocs(uid);
    setAdhocs(adhocs);
    console.log("Retrieved adhocs: " + adhocs.size);
    setShowShare(true);
  }

  function serializeTimeSlot(timeSlot: TimeSlot) {
    return {
      startTime: getDisplayTime(timeSlot.startTime),
      endTime: getDisplayTime(timeSlot.endTime),
      day: timeSlot.day
    };
  }

  const dayToNumber = (day: string): number => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return daysOfWeek.indexOf(day);
  };

  const timeslotsToJson = (timeSlots: Map<string, TimeSlot>) => {
    // Convert the map to an array and sort it by day of the week
    const sortedTimeSlots = Array.from(timeSlots.values()).sort((a, b) => dayToNumber(a.day) - dayToNumber(b.day));

    // Assign numerical IDs and serialize
    const serializedTimeSlots = sortedTimeSlots.map((timeSlot, index) => ({
      id: index, // Assign a numerical ID starting from 0
      ...serializeTimeSlot(timeSlot)
    }));

    const jsonStr = JSON.stringify(serializedTimeSlots);
    return jsonStr;
  };

  const adhocsToJson = (adhocs: Map<string, Adhoc>) => {
    // Convert the map to an array and sort it by start time
    const sortedAdhocs = Array.from(adhocs.values()).sort((a, b) => Date.parse(a.startTime.toString()) - Date.parse(b.endTime.toString()));

    // Assign numerical IDs and serialize
    const serializedAdhocs = sortedAdhocs.map((adhoc, index) => ({
      id: index, // Assign a numerical ID starting from 0
      startTime: adhoc.startTime.toString(),
      endTime: adhoc.endTime.toString(),
      note: adhoc.note
    }));

    const jsonStr = JSON.stringify(serializedAdhocs);
    return jsonStr;
  };
  
  // Function to handle sending email
  const sendMail = async (email: string) => {
    const profile = await getProfile(uid);
    console.log("Retrieved profile: " + profile);
    const subject = encodeURIComponent('Shared Availability from ' + profile?.firstName + ' ' + profile?.lastName);
    const availabilitiesJson = timeslotsToJson(timeSlots);
    const adhocsJson = adhocsToJson(adhocs);
    const body = encodeURIComponent(availabilitiesJson + '\n\n' + adhocsJson); 
    
    if (!email) {
      alert("No email address selected to share to");
      return;
    }
    const url = `mailto:${email}?subject=${subject}&body=${body}`;

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        throw new Error('Not able to send email');
      }
      await Linking.openURL(url);
      console.log('Shared by Email', email);
    } catch (error) {
      console.log('An error occurred', error);
    }
  };

  // Icon for sharing
  const shareIcon = (
    <Entypo name="share" size={20} color="black" />
  );
  
  return (
    <View style={styles.container}>
      {/* Header title */}
      <Stack.Screen
        options={{
          title: "My Availability",
        }}
      />
      {/* List of days with availability details */}
      <FlatList
        data={weekdays}
        renderItem={({ item }) => 
        <ExpandableFolder 
          day={item}
          timeSlots={timeSlots}
          timeSlotsByDay={timeSlotsByDay}
        />}
        keyExtractor={(item) => item}
      />
      {/* Button to add ad-hoc availabilities */}
      <Button
        style={styles.button}
        onPressOut={() => goToPage("/availability/adhoc")}
      >
        Add ad-hoc availabilities
      </Button>
      {/* Button to share availability */}
      <TouchableOpacity
        style={styles.shareButton}
        onPress={() => pressShare()}
      >
        {shareIcon}
      </TouchableOpacity>
      <SharePopup
        timeSlots={timeSlots}
        adhocs={adhocs}
        isVisible={showShare}
        onShare={sendMail}
        onClose={() => setShowShare(false)}
      />
    </View>
  );
};

// Props interface for the ExpandableFolder component
interface ExpandableFolderProps {
  day: string;
  timeSlots: Map<string, TimeSlot>;
  timeSlotsByDay?: Record<string, TimeSlotWithId[]>;
}

// Component for each day's expandable folder of timeslots
const ExpandableFolder: React.FC<ExpandableFolderProps> = ({day, timeSlots, timeSlotsByDay}) => {

  // State for folder open/close toggle
  const [isOpen, setIsOpen] = useState(false);

  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date>(new Date());

  const [createStartTime, setCreateStartTime] = useState<Date>(new Date());


  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<string>("");

  // State to control the visibility of date picker modal
  const [isCreateStartTimePickerVisible, setCreateIsStartTimePickerVisible] = useState<boolean>(false);
  const [isCreateEndTimePickerVisible, setCreateIsEndTimePickerVisible] = useState<boolean>(false);

  const [isStartTimePickerVisible, setIsStartTimePickerVisible] = useState<boolean>(false);
  const [isEndTimePickerVisible, setIsEndTimePickerVisible] = useState<boolean>(false);

  const [errorMessages, setErrorMessages] = useState<TimeSlotErrors>(new TimeSlotErrors());
  const [deleteModalData, setDeleteModalData] = useState<{
    isVisible: boolean;
    timeSlotId: string | undefined;
  }>({ isVisible: false, timeSlotId: undefined });

  const handleUpdateTime = (updatedTimeSlot: TimeSlot) => {
    const timeSlotErrorMessages = validateTimeSlot(updatedTimeSlot);
    setErrorMessages(timeSlotErrorMessages);
    if (timeSlotErrorMessages.hasErrors()) {
      alert(timeSlotErrorMessages.time);
      return;
    }
    if (selectedTimeSlotId) {
      updateTimeSlot(selectedTimeSlotId, updatedTimeSlot, uid);
    }
  }

  const showStartTimePicker = (timeSlotId: string) => {
    setStartTime(timeSlots.get(timeSlotId)?.startTime || new Date());
    setIsStartTimePickerVisible(true);
    setSelectedTimeSlotId(timeSlotId);
  }

  const showEndTimePicker = (timeSlotId: string) => {
    setEndTime(timeSlots.get(timeSlotId)?.endTime || new Date());
    setIsEndTimePickerVisible(true);
    setSelectedTimeSlotId(timeSlotId);
  }

  const handleUpdateStartTime = (time: Date) => {
    const updatedTimeSlot = {
      startTime: time,
      endTime: timeSlots.get(selectedTimeSlotId)?.endTime || new Date(),
      day: day,
    };
    handleUpdateTime(updatedTimeSlot);
    setIsStartTimePickerVisible(false);
  }

  const handleUpdateEndTime = (time: Date) => {
    const updatedTimeSlot = {
      startTime: timeSlots.get(selectedTimeSlotId)?.startTime || new Date(),
      endTime: time,
      day: day,
    };
    handleUpdateTime(updatedTimeSlot);
    setIsEndTimePickerVisible(false);
  }

  // Delete work shift.
  const handleDeleteTimeSlot = (timeSlotId: string | undefined) => {
    console.log("Delete timeSlot id: " + timeSlotId);
    if (!timeSlotId || timeSlotId === "") return;
    deleteTimeSlot(timeSlotId, uid)
      .then(() => {
        console.log("Deleted timeSlot: " + timeSlotId);
      })
      .catch((error: any) => alert(error.message));
  };

  const hideDeleteConfirmModal = () => {
    setDeleteModalData({ ...deleteModalData, isVisible: false });
  };

  // Pressed delete adhoc button on an adhoc Entry.
  const handlePressedDeleteEntry = (timeSlotId: string) => {
    console.log("Delete button pressed: " + timeSlotId);
    setDeleteModalData({ isVisible: true, timeSlotId: timeSlotId});
  };

  const handleAddButton = () => {
    setCreateIsStartTimePickerVisible(true);
  }

  const handleCreateStartTime = async (time: Date) => {
    setCreateStartTime(modifyTimeOnly(createStartTime, time));
    setCreateIsStartTimePickerVisible(false);
    setCreateIsEndTimePickerVisible(true);
  }

  const handleCreateEndTime = (time: Date) => {
    setCreateIsEndTimePickerVisible(false);
    handleAddTimeSlot(time);
  }

  const handleAddTimeSlot = async (time: Date) => {
    const newTimeSlot = {
      startTime: createStartTime,
      endTime: time,
      day: day,
    };

    const timeSlotErrorMessages = validateTimeSlot(newTimeSlot);
    setErrorMessages(timeSlotErrorMessages);
    if (timeSlotErrorMessages.hasErrors()) {
      alert(timeSlotErrorMessages.time);
      return;
    }
    await createTimeSlot(newTimeSlot, uid);
  }
  
  // Icons for add and delete actions
  const addIcon = (
    <Ionicons name="add-circle" size={20} color="black" />
  );

  const delIcon = (
    <MaterialIcons name="delete" size={20} color="black" />
  );

  return (
    <Card style={styles.card}>
      {/* Header for each day's card */}
      <TouchableOpacity onPress={() => setIsOpen(!isOpen)}>
        <View style={styles.cardHeader}>
          <Text category="h6">{day}</Text>
          <Text>{isOpen ? '-' : '+'}</Text>
        </View>
      </TouchableOpacity>
      {/* List of timeslots for the day */}
      {isOpen && (
        <View style={styles.cardContent}>
          <FlatList 
            data={timeSlotsByDay?.[day] || []}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Button onPress={() => showStartTimePicker(item.id)} style={styles.time}>
                  {getDisplayTime(item.startTime)}
                </Button>
                <Text>{' - '}</Text>
                <Button onPress={() => showEndTimePicker(item.id)} style={styles.time}>
                  {getDisplayTime(item.endTime)}
                </Button>
                {/* Delete button for each timeslot */}
                <TouchableOpacity onPress={() => 
                  handlePressedDeleteEntry(item.id)} 
                  style={styles.delButton}
                >
                  {delIcon}
                </TouchableOpacity>
              </View>
            )}
          />
          {/* Date picker modal for time selection */}
          <DateTimePickerModal
            isVisible={isStartTimePickerVisible}
            mode="time"
            date={startTime}
            is24Hour={false}
            display="spinner"
            onConfirm={handleUpdateStartTime}
            onCancel={() => setIsStartTimePickerVisible(false)}
            textColor="#000000"
          />
          <DateTimePickerModal
            isVisible={isEndTimePickerVisible}
            mode="time"
            date={endTime}
            is24Hour={false}
            display="spinner"
            onConfirm={handleUpdateEndTime}
            onCancel={() => setIsEndTimePickerVisible(false)}
            textColor="#000000"
          />
          <DateTimePickerModal
            isVisible={isCreateStartTimePickerVisible}
            mode="time"
            is24Hour={false}
            display="spinner"
            onConfirm={handleCreateStartTime}
            onCancel={() => setCreateIsStartTimePickerVisible(false)}
            textColor="#000000"
          />
          <DateTimePickerModal
            isVisible={isCreateEndTimePickerVisible}
            mode="time"
            date={createStartTime}
            is24Hour={false}
            display="spinner"
            onConfirm={handleCreateEndTime}
            onCancel={() => setCreateIsEndTimePickerVisible(false)}
            textColor="#000000"
          />
          {/* Add button for adding new timeslots */}
          <TouchableOpacity onPress={() => 
            handleAddButton()} 
            style={styles.icon}
          >
            {addIcon}
          </TouchableOpacity>
          <ConfirmModal
            isVisible={deleteModalData.isVisible}
            message="Are you sure to delete this availability?"
            confirmText="Delete"
            payload={deleteModalData.timeSlotId}
            onConfirm={(payload) => {
            hideDeleteConfirmModal();
            handleDeleteTimeSlot(payload);
            }}
            onCancel={hideDeleteConfirmModal}
          />
        </View>
      )}
    </Card>
  );
};

// Styles for the components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  card: {
    marginVertical: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardContent: {
    marginTop: 10,
  },

  button: {
    backgroundColor: 'lightblue', 
    margin: 5,
  },
  shareButton: {
    backgroundColor: 'lightgreen', 
    margin: 5,
  },

  delButton: {
    backgroundColor: 'white', 
    width: 30,  
    height: 30,  
    borderColor: 'black',
  },

  icon: {
    width: 30, 
    height: 30,
    backgroundColor: 'white', 
    borderRadius: 25, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderColor: 'white',
  },

  time: {
    backgroundColor: 'gray',
    borderColor: 'black',
    borderWidth: 1,
    width: 120,  
    height: 30,  
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,  
    paddingTop: 3, 
    paddingBottom: 3, 
  },
});

export default AvailablityPage;
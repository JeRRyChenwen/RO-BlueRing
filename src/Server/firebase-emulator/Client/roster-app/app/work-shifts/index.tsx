import React, { useEffect, useState } from "react";
import { Alert, SafeAreaView, StyleSheet } from "react-native";
import XDate from "xdate";
import { Stack, router } from "expo-router";
import { getAuth } from "firebase/auth";
import { Agenda, AgendaSchedule } from "react-native-calendars";
import { DateData, MarkedDates } from "react-native-calendars/src/types";
import { WorkShift } from "@api/types/WorkShift";
import { deleteWorkShift, onWorkShiftsSnapshot } from "@api/db/workShiftDatabase";
import { WorkShiftEntry, setupAgendaCalendarData } from "@functions/workShift/workShiftAgenda";
import ScreenHeaderBtn from "@components/work-shifts/ScreenHeaderBtn";
import renderWorkShiftEntry from "@functions/workShift/renderWorkShiftAgendaEntry";
import WorkShiftDetailsPopup from "@components/work-shifts/WorkShiftDetailsPopup";
import { useIsFocused } from "@react-navigation/native";
import ConfirmModal from "@components/common/ConfirmModal";
import {
  PermissionResponse,
  requestCalendarPermissionsAsync,
  requestRemindersPermissionsAsync,
} from "expo-calendar";
import { getOrCreateCalendar } from "@api/db/systemCalendarDatabase";

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

const WorkShiftCalendarPage = () => {
  const isFocused = useIsFocused();

  // Data.
  const [workShifts, setWorkShifts] = useState<Map<string, WorkShift>>(new Map());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Agenda calendar display data.
  const [workShiftAgendaSchedule, setWorkShiftAgendaSchedule] = useState<AgendaSchedule>({});
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});

  // Popups.
  const [deleteModalData, setDeleteModalData] = useState<{
    isVisible: boolean;
    workShiftId: string | undefined;
  }>({ isVisible: false, workShiftId: undefined });
  const [showWorkShiftDetails, setShowWorkShiftDetails] = useState<boolean>(false);
  const [workShiftDetailsData, setWorkShiftDetailsData] = useState<WorkShiftEntry>();

  useEffect(() => {
    // Listen to realtime changes in the WorkShifts database.
    try {
      const unsubscribeWorkShifts = onWorkShiftsSnapshot(uid, handleGetWorkShiftsData);
      return () => unsubscribeWorkShifts();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try{
        requestCalendarPermissionsAsync().then(
          (rsp) => {
            if(rsp.status !== "granted") return;
            requestCalendarPermissionsAsync().then((rsp) => {
              if(rsp.status !== "granted") return;
              getOrCreateCalendar(uid);
            });
          }
        );
      } catch(error: any){
        Alert.alert("Encountered error when requesting calendar and reminder permissions.");
      }
    })();
  }, []);

  // Rebuild agenda calendar data when work shifts change.
  useEffect(() => {
    setupAgendaCalendarData(
      workShifts,
      setWorkShiftAgendaSchedule,
      setMarkedDates,
      handlePressedShowEntryDetails,
      handlePressedDeleteEntry
    );
  }, [workShifts]);

  // Update local states based on work shifts data retrieved from database.
  const handleGetWorkShiftsData = (workShifts: Map<string, WorkShift>) => {
    console.log("Retrieved work shifts: " + workShifts.size);
    setWorkShifts(workShifts);
  };

  // Pressed create work shift button.
  const handleCreateWorkShift = () => {
    const date = selectedDate.toDateString();
    console.log("Selected date: " + date);
    router.push({
      pathname: "/work-shifts/edit",
      params: { initialDate: selectedDate.toDateString() },
    });
  };

  // Show work shift details on press.
  const handlePressedShowEntryDetails = (entry: WorkShiftEntry) => {
    setWorkShiftDetailsData(entry);
    setShowWorkShiftDetails(true);
  };

  // Pressed edit work shift button on a work shift entry.
  const handleEditWorkShift = (workShiftId: string) => {
    router.push({
      pathname: "/work-shifts/edit",
      params: { workShiftId: workShiftId },
    });
  };

  // Pressed delete work shift button on a work shift Entry.
  const handlePressedDeleteEntry = (workShiftId: string) => {
    console.log("Delete button pressed: " + workShiftId);
    if (showWorkShiftDetails) setShowWorkShiftDetails(false);
    setDeleteModalData({ isVisible: true, workShiftId: workShiftId });
  };

  // Delete work shift.
  const handleDeleteWorkShift = (workShiftId: string | undefined) => {
    console.log("Delete work shift id: " + workShiftId);
    if (!workShiftId || workShiftId === "") return;
    deleteWorkShift(workShiftId, uid)
      .then(() => {
        console.log("Deleted work shift: " + workShiftId);
      })
      .catch((error: any) => Alert.alert("Error", error.message));
  };

  const hideDeleteConfirmModal = () => {
    setDeleteModalData({ ...deleteModalData, isVisible: false });
  };

  /**
   * When the selected date has changed by pressing on the calendar
   * or by scrolling to a day on the agenda view.
   * @param day
   */
  const handleAgendaDayChanged = (day: DateData) => {
    setSelectedDate(new Date(day.dateString));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "My Calendar",
          headerRight: () => (
            <>
              <ScreenHeaderBtn onPress={handleCreateWorkShift} />
            </>
          ),
        }}
      />
      <Agenda
        selectedDay={new XDate()}
        items={workShiftAgendaSchedule}
        renderItem={(entry, isFirst) => renderWorkShiftEntry(entry as WorkShiftEntry, isFirst)}
        hideExtraDays={true}
        markedDates={markedDates}
        markingType="multi-dot"
        onDayChange={(day) => handleAgendaDayChanged(day as DateData)}
        onDayPress={handleAgendaDayChanged}
      />
      <WorkShiftDetailsPopup
        entry={workShiftDetailsData}
        isVisible={showWorkShiftDetails}
        onEdit={(workShiftId) => handleEditWorkShift(workShiftId)}
        onDelete={(workShiftId) => handlePressedDeleteEntry(workShiftId)}
        onClose={() => setShowWorkShiftDetails(false)}
      />
      <ConfirmModal
        isVisible={deleteModalData.isVisible}
        message="Are you sure to delete this work shift?"
        confirmText="Delete"
        payload={deleteModalData.workShiftId}
        onConfirm={(payload) => {
          hideDeleteConfirmModal();
          handleDeleteWorkShift(payload);
        }}
        onCancel={hideDeleteConfirmModal}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default WorkShiftCalendarPage;

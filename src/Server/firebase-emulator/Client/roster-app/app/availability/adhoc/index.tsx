import React, { useEffect, useState } from "react";
import { Alert, SafeAreaView, StyleSheet } from "react-native";
import XDate from "xdate";
import { Stack, router } from "expo-router";
import { getAuth } from "firebase/auth";
import { Agenda, AgendaSchedule } from "react-native-calendars";
import { DateData, MarkedDates } from "react-native-calendars/src/types";
import { Adhoc } from "@api/types/Availability"; 
import { deleteAdhoc, onAdhocsSnapshot } from "@api/db/adhocDatabase"; 
import { AdhocEntry, setupAgendaCalendarData } from "@functions/availability/adhocAgenda"; 
import ScreenHeaderBtn from "@components/work-shifts/ScreenHeaderBtn";
import renderAdhocEntry from "@functions/availability/renderAdhocAgendaEntry"; 
import AdhocDetailsPopup from "@components/availability/AdhocDetailsPopup"; 
import { useIsFocused } from "@react-navigation/native";
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

const AdhocPage = () => {
  const isFocused = useIsFocused();

  // Data.
  const [adhocs, setAdhocs] = useState<Map<string, Adhoc>>(new Map());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Agenda calendar display data.
  const [adhocAgendaSchedule, setAdhocAgendaSchedule] = useState<AgendaSchedule>({});
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});

  // Popups.
  const [deleteModalData, setDeleteModalData] = useState<{
    isVisible: boolean;
    adhocId: string | undefined;
  }>({ isVisible: false, adhocId: undefined });
  const [showAdhocDetails, setShowAdhocDetails] = useState<boolean>(false);
  const [adhocDetailsData, setAdhocDetailsData] = useState<AdhocEntry>();

  useEffect(() => {
    // Listen to realtime changes in the Adhocs database.
    try {
      const unsubscribeAdhocs = onAdhocsSnapshot(uid, handleGetAdhocsData);
      return () => unsubscribeAdhocs();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  }, []);

  // Rebuild agenda calendar data when adhocs change.
  useEffect(() => {
    setupAgendaCalendarData(
      adhocs,
      setAdhocAgendaSchedule,
      setMarkedDates,
      handlePressedShowEntryDetails,
      handlePressedDeleteEntry
    );
  }, [adhocs]);

  // Update local states based on adhocs data retrieved from database.
  const handleGetAdhocsData = (adhocs: Map<string, Adhoc>) => {
    console.log("Retrieved adhocs: " + adhocs.size);
    setAdhocs(adhocs);
  };

  // Pressed create adhoc button.
  const handleCreateAdhoc = () => {
    const date = selectedDate.toDateString();
    console.log("Selected date: " + date);
    router.push({
      pathname: "/availability/adhoc/edit",
      params: { initialDate: selectedDate.toDateString() },
    });
  };

  // Show adhoc details on press.
  const handlePressedShowEntryDetails = (entry: AdhocEntry) => {
    setAdhocDetailsData(entry);
    setShowAdhocDetails(true);
  };

  // Pressed edit adhoc button on an adhoc entry.
  const handleEditAdhoc = (adhocId: string) => {
    router.push({
      pathname: "/availability/adhoc/edit",
      params: { adhocId: adhocId },
    });
  };

  // Pressed delete adhoc button on an adhoc Entry.
  const handlePressedDeleteEntry = (adhocId: string) => {
    console.log("Delete button pressed: " + adhocId);
    if (showAdhocDetails) setShowAdhocDetails(false);
    setDeleteModalData({ isVisible: true, adhocId: adhocId });
  };

  // Delete adhoc.
  const handleDeleteAdhoc = (adhocId: string | undefined) => {
    console.log("Delete adhoc id: " + adhocId);
    if (!adhocId || adhocId === "") return;
    deleteAdhoc(adhocId, uid)
      .then(() => {
        console.log("Deleted adhoc: " + adhocId);
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
          title: "Ad-hoc Availability",
          headerRight: () => (
            <>
              <ScreenHeaderBtn onPress={handleCreateAdhoc} />
            </>
          ),
        }}
      />
      <Agenda
        selectedDay={new XDate()}
        items={adhocAgendaSchedule}
        renderItem={(entry, isFirst) => renderAdhocEntry(entry as AdhocEntry, isFirst)}
        hideExtraDays={true}
        markedDates={markedDates}
        markingType="multi-dot"
        onDayChange={(day) => handleAgendaDayChanged(day as DateData)}
        onDayPress={handleAgendaDayChanged}
      />
      <AdhocDetailsPopup
        entry={adhocDetailsData}
        isVisible={showAdhocDetails}
        onEdit={(adhocId: string) => handleEditAdhoc(adhocId)}
        onDelete={(adhocId: string) => handlePressedDeleteEntry(adhocId)}
        onClose={() => setShowAdhocDetails(false)}
      />
      <ConfirmModal
        isVisible={deleteModalData.isVisible}
        message="Are you sure to delete this adhoc availability?"
        confirmText="Delete"
        payload={deleteModalData.adhocId}
        onConfirm={(payload) => {
          hideDeleteConfirmModal();
          handleDeleteAdhoc(payload);
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

export default AdhocPage;

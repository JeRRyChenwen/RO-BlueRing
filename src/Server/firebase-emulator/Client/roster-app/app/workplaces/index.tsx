import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, FlatList, Alert, Animated } from "react-native";
import { Text, Layout } from "@ui-kitten/components";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import { onWorkplacesSnapshot } from "@api/db/workplaceDatabase";
import { Workplace } from "@api/types/Workplace";
import { Swipeable } from "react-native-gesture-handler";
import { deleteWorkplace } from "@api/db/workplaceDatabase";
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

/**
 * Internal data structure used for displaying workplace information in a list view.
 */
interface WorkplaceEntry {
  id: string;
  data: Workplace;
}

const WorkplacesPage = () => {
  const isFocused = useIsFocused();
  const [workplaces, setWorkplaces] = useState<Map<string, Workplace>>(new Map());
  const [workplaceEntries, setWorkplaceEntries] = useState<Array<WorkplaceEntry>>([]);
  const [isSwipeableOpen, setIsSwipeableOpen] = useState(false);
  const [openWorkplaceId, setOpenWorkplaceId] = useState<string | null>(null);
  let swipeableRowRefs = new Map();

  const [deleteModalData, setDeleteModalData] = useState<{
    isVisible: boolean;
    workplaceId: string | undefined;
  }>({ isVisible: false, workplaceId: undefined });

  useEffect(() => {
    // Listen to realtime changes in the Workplaces database.
    try {
      const unsubscribe = onWorkplacesSnapshot(uid, handleGetWorkplacesData);
      return () => unsubscribe();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      closeAllSwipeables();
    }
  }, [isFocused]);

  /**
   * Updates local states based on Workplaces data retrieved from database.
   * @param workplaces A Map of Workplace database document ID and corresponding Workplace data.
   */
  const handleGetWorkplacesData = (workplaces: Map<string, Workplace>) => {
    setWorkplaces(workplaces);
    // Convert workplaces map to an array that supports list view.
    setWorkplaceEntries(
      Array.from(workplaces.entries()).map(([key, value]) => ({ id: key, data: value }))
    );
  };

  const closeAllSwipeables = () => {
    [...swipeableRowRefs.entries()].forEach(([key, ref]) => {
      ref.close();
    });
  };

  const handleSwipeableOpen = (entryId: string) => {
    setOpenWorkplaceId(entryId);
    setIsSwipeableOpen(true);
  };

  const handleSwipeableClose = () => {
    setOpenWorkplaceId(null);
    setIsSwipeableOpen(false);
  };

  const handleAddWorkplace = () => {
    router.push({
      pathname: "/workplaces/edit",
    });
  };

  const handleDisplayWorkplace = (workplaceId: string) => {
    if (openWorkplaceId !== workplaceId) {
      handleSwipeableClose();
    }
    router.push({
      pathname: "/workplaces/display",
      params: { workplaceId: workplaceId },
    });
  };

  const handleEditWorkplace = (workplaceId: string) => {
    router.push({
      pathname: "/workplaces/edit",
      params: { workplaceId: workplaceId },
    });
  };

  // Pressed delete work shift button on a work shift Entry.
  const handlePressedDeleteWorkplace = (workShiftId: string) => {
    setDeleteModalData({ isVisible: true, workplaceId: workShiftId });
  };

  const handleDeleteWorkplace = (workplaceId: string | undefined) => {
    if (!workplaceId) return;
    deleteWorkplace(workplaceId, uid)
      .then(() => {
        console.log("Document successfully deleted!");
      })
      .catch((error: any) => {
        Alert.alert("Error", error.message);
      });
  };

  const hideDeleteConfirmModal = () => {
    setDeleteModalData({ ...deleteModalData, isVisible: false });
  };

  const addIcon = <Ionicons name="add-circle" size={40} color="black" />;

  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
    entryId: string
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });

    return (
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity onPress={() => handleEditWorkplace(entryId)}>
          <Animated.View style={{ transform: [{ scale: scale }] }}>
            <Text style={styles.editText}>Edit</Text>
          </Animated.View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handlePressedDeleteWorkplace(entryId)}>
          <Animated.View style={{ transform: [{ scale: scale }] }}>
            <Text style={styles.deleteText}>Delete</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Layout style={styles.container}>
      <Stack.Screen
        options={{
          title: "My Workplaces",
        }}
      />
      <FlatList
        data={workplaceEntries}
        keyExtractor={(entry) => entry.id}
        renderItem={({ item: entry }) => (
          <Swipeable
            key={entry.id}
            ref={(ref) => {
              if (ref && !swipeableRowRefs.get(entry.id)) swipeableRowRefs.set(entry.id, ref);
            }}
            onSwipeableWillOpen={() => {
              // Close other swipeables.
              [...swipeableRowRefs.entries()].forEach(([key, ref]) => {
                if (key !== entry.id && ref) ref.close();
              });
            }}
            onSwipeableOpen={() => handleSwipeableOpen(entry.id)}
            onSwipeableClose={handleSwipeableClose}
            renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, entry.id)}
          >
            <TouchableOpacity
              onPress={() => {
                if (!isSwipeableOpen) handleDisplayWorkplace(entry.id);
              }}
            >
              <View style={styles.workplaceContainer}>
                <Text style={styles.workplaceText}>{entry.data.name}</Text>
              </View>
            </TouchableOpacity>
          </Swipeable>
        )}
      />

      <TouchableOpacity onPress={handleAddWorkplace} style={styles.addButton}>
        {addIcon}
      </TouchableOpacity>

      <ConfirmModal
        isVisible={deleteModalData.isVisible}
        message="Are you sure to delete this workplace?"
        confirmText="Delete"
        payload={deleteModalData.workplaceId}
        onConfirm={(payload) => {
          hideDeleteConfirmModal();
          handleDeleteWorkplace(payload);
        }}
        onCancel={hideDeleteConfirmModal}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  workplaceContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
    padding: 30,
    backgroundColor: "white",
    borderRadius: 5,
    marginVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  workplaceText: {
    fontSize: 20, // increase font size
    color: "#555", // make it a bit darker
    fontWeight: "500",
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    padding: 10,
    backgroundColor: "#2196f3",
    borderRadius: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  rightActionContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "#ff5252",
    borderRadius: 5,
    marginVertical: 4,
    paddingHorizontal: 10,
  },
  deleteText: {
    padding: 30,
    color: "white",
    fontSize: 16,
    backgroundColor: "red",
  },
  editText: {
    padding: 30,
    color: "white",
    fontSize: 16,
    backgroundColor: "#2196f3",
  },
});

export default WorkplacesPage;

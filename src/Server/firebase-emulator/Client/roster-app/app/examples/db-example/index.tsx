import { useState } from "react";
import { db } from "@services/firebaseConfig";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { StyleSheet, View } from "react-native";
import { Button, ButtonGroup, Text } from "@ui-kitten/components";
import { Stack } from "expo-router";

const DbExamplePage = () => {
  const collectionId: string = "db-tests";
  const docId: string = "count-example";
  const debugDocPath: string = [collectionId, docId].join("/");
  const [count, setCount] = useState<number>(0);

  const incrementCount = (value: number) => {
    setCount(count + value);
  };

  const loadCount = async () => {
    const docRef = doc(db, collectionId, docId);
    try {
      const document = await getDoc(docRef);
      // Load from existing document.
      if (document.exists()) {
        setCount(document.data().count);
        console.log("Loaded count from " + debugDocPath + ": " + count);
      }
      // Document not found.
      else {
        console.log("Document " + debugDocPath + " not found!");
      }
    } catch (e) {
      console.log("Cannot access database.");
    }
  };

  const saveCount = async () => {
    const docRef = doc(db, collectionId, docId);
    try {
      // Update document field.
      const document = await getDoc(docRef);
      if (document.exists() && document.data().count) {
        await updateDoc(docRef, {
          count: count,
        }).catch(() => {
          console.log("Error when updating document " + debugDocPath);
        });
      }
      // If document or field doesn't exist, create it.
      else {
        await setDoc(docRef, {
          count: count,
        }).catch(() => {
          console.log("Error when overwriting document " + debugDocPath);
        });
      }
    } catch (e) {
      console.log("Cannot access database.");
    }
  };

  return (
    <View style={styles.verticalSection}>
      <Stack.Screen
        options={{
          title: "Database Test",
        }}
      />
      <View style={styles.verticalSection}>
        <View style={styles.verticalSection}>
          <Text style={styles.countText}>{count}</Text>
          <ButtonGroup>
            <Button onPress={() => incrementCount(1)}>+</Button>
            <Button onPress={() => incrementCount(-1)}>-</Button>
          </ButtonGroup>
          <Button
            style={styles.btn}
            appearance="ghost"
            onPress={() => setCount(0)}
          >
            Set to Zero
          </Button>
        </View>
        <View style={styles.dbControls}>
          <Button style={styles.btn} onPress={() => loadCount()}>
            Load from Database
          </Button>
          <Button style={styles.btn} onPress={() => saveCount()}>
            Save to Database
          </Button>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  verticalSection: {
    flexDirection: "column",
    alignItems: "center",
    margin: 10,
  },
  dbControls: {
    marginTop: 10,
  },
  btn: {
    margin: 3,
  },
  countText: {
    fontSize: 20,
    marginHorizontal: 8,
    marginVertical: 10,
  },
});

export default DbExamplePage;

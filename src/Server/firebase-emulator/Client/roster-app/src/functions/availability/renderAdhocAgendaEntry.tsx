import { View, StyleSheet } from "react-native";
import { AdhocEntry } from "@functions/availability/adhocAgenda";
import { Card } from "react-native-paper";
import { Text, Button } from "@ui-kitten/components";
import { getDisplayTime } from "@functions/util/timeUtil";
import WorkplaceNameHeader from "@components/work-shifts/WorkplaceNameHeader";

const renderAdhocEntry = (entry: AdhocEntry, isFirst: boolean) => {
  if (entry.data == null) return <View />;

  return (
    <Card style={styles.container} onPress={() => entry.onTrigger?.(entry)}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.leftSection}>
          <View>
              <WorkplaceNameHeader 
                workplaceName={entry.data.isAvailable? "Available": "Unavailable"}
                color={entry.data.isAvailable? "green": "red"} 
                headingType="h6" 
              />
          </View>
          <View style={styles.textContent}>
            <Text style={styles.timeText}>
              {getDisplayTime(entry.data.startTime, true)} - {getDisplayTime(entry.data.endTime, true)}
            </Text>
          </View>
        </View>
        <View style={styles.rightSection}>
          <Button
            style={styles.deleteButton}
            appearance="ghost"
            status="basic"
            size="small"
            onPress={() => entry.onDelete?.(entry.id)}
          >
            Delete
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 8, marginHorizontal: 15 },
  timeText: {
    fontSize: 16,
  },
  cardContent: {
    flexDirection: "row",
  },
  textContent: {
    marginTop: 8,
    marginBottom: 5,
  },
  leftSection: {
    flex: 2.5,
  },
  rightSection: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  deleteButton: {
    width: 90,
    height: 50,
    alignSelf: "center",
    padding: 0,
  },
});

export default renderAdhocEntry;

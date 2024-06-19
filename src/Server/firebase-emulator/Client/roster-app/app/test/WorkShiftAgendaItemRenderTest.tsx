import { View } from "react-native";
import React, { useState } from "react";
import renderWorkShiftEntry from "@functions/workShift/renderWorkShiftAgendaEntry";
import { WorkShiftEntry } from "@functions/workShift/workShiftAgenda";
import { WorkShift } from "@api/types/WorkShift";
import WorkShiftDetailsPopup from "@components/work-shifts/WorkShiftDetailsPopup";

const WorkShiftAgendaItemRenderTest = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const workShift: WorkShift = {
    workplaceId: "1",
    name: "Workplace name",
    startTime: new Date(),
    endTime: new Date(),
    note: "Some notes",
  };

  const entry: WorkShiftEntry = {
    id: "1",
    name: "1",
    data: workShift,
    height: 0,
    day: workShift.startTime.toISOString().split("T")[0], // Extracts YYYY-MM-DD from the startTime date.
    onTrigger(arg) {
      setIsVisible(true);
    },
  };

  return (
    <View>
      {renderWorkShiftEntry(entry, false)}
      <WorkShiftDetailsPopup
        isVisible={isVisible}
        entry={entry}
        onClose={() => setIsVisible(false)}
      />
    </View>
  );
};

export default WorkShiftAgendaItemRenderTest;

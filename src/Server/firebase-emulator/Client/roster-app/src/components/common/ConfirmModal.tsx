import { Modal, View, StyleSheet } from "react-native";
import { Button, Text } from "@ui-kitten/components";

type Props = {
  isVisible: boolean;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  payload?: string | undefined;
  onConfirm?: (payload: string | undefined) => void;
  onCancel?: (payload: string | undefined) => void;
};

const ConfirmModal = ({
  isVisible = false,
  message = "Confirm?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  payload = undefined,
  onConfirm = (payload: string | undefined) => {},
  onCancel = (payload: string | undefined) => {},
}: Props) => {
  return (
    <Modal visible={isVisible} transparent={true}>
      <View style={styles.window}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <View style={{ width: 300, padding: 20, backgroundColor: "white", borderRadius: 10 }}>
            <Text style={{ marginTop: 10 }}>{message}</Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 20 }}>
              <Button onPress={() => onConfirm(payload)}>{confirmText}</Button>
              <Button onPress={() => onCancel(payload)}>{cancelText}</Button>
            </View>
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
});

export default ConfirmModal;

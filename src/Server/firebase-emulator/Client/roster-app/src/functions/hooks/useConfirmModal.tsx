import { useRef, useState } from "react";
import { Modal, View, StyleSheet } from "react-native";
import { Button, Text } from "@ui-kitten/components";

interface IConfirmModal {
  isVisible: boolean;
  handleConfirm: (result: string) => void;
  handleCancel: (error: string) => void;
}

interface IConfirmModalParams {
  message: string;
  confirmText: string;
  cancelText: string;
}

/**
 * Imperative modal. Renders a modal with a message and confirm / delete buttons.
 * Adapted from https://github.com/sarathkcm/react-native-awaitable-modals
 * @returns
 */
export const useConfirmModal = () => {
  const [isVisible, setIsVisible] = useState(false);

  const promiseRef = useRef({
    resolve: (value: string) => {},
    reject: () => {},
    params: { message: "", confirmText: "Confirm", cancelText: "Cancel" },
  });

  const open = (params: IConfirmModalParams) => {
    return new Promise((resolve, reject) => {
      promiseRef.current = {
        resolve: resolve,
        reject: reject,
        params: params,
      };
      setIsVisible(true);
    });
  };

  const render = () => {
    const resolveAndClose = (result: string) => {
      promiseRef.current.resolve(result);
      setIsVisible(false);
    };

    const rejectAndClose = (error: string) => {
      promiseRef.current.reject();
      setIsVisible(false);
    };

    const modal: IConfirmModal = {
      isVisible,
      handleConfirm: resolveAndClose,
      handleCancel: rejectAndClose,
    };

    return (
      <Modal visible={isVisible} transparent={true}>
        <View style={styles.window}>{modalView(modal, promiseRef.current.params)}</View>
      </Modal>
    );
  };

  const modalView = (modal: IConfirmModal, params: IConfirmModalParams) => (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <View style={{ width: 300, padding: 20, backgroundColor: "white", borderRadius: 10 }}>
        {params.message && <Text style={{ marginTop: 10 }}>{params.message}</Text>}
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 20 }}>
          <Button onPressOut={() => modal.handleConfirm("Confirmed")}>{params.confirmText}</Button>
          <Button onPressOut={() => modal.handleCancel("Canceled")}>{params.cancelText}</Button>
        </View>
      </View>
    </View>
  );

  return {
    openModal: open,
    renderModal: render,
  };
};

const styles = StyleSheet.create({
  window: {
    backgroundColor: "#000000aa",
    flex: 1,
    justifyContent: "center",
  },
});

import React from "react";
import { TouchableOpacity, Image, ImageSourcePropType } from "react-native";
import styles from "./screenheader.style";
import { Entypo } from '@expo/vector-icons'; 

type Props = {
  size?: number;
  onPress?: () => void;
};

const ScreenHeaderBtn = ({ size = 25, onPress = () => {} }: Props) => {
  return (
    <TouchableOpacity style={styles.btnContainer} onPress={onPress}>
      <Entypo name="add-to-list" size={size} color="black" />
    </TouchableOpacity>
  );
};

export default ScreenHeaderBtn;

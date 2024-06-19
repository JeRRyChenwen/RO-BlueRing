import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import {
  Layout,
  Text,
  Avatar,
  Input,
  Button,
  Toggle,
  Select,
  SelectItem,
  IndexPath,
} from "@ui-kitten/components";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  validateName,
  validateABN,
  validateAddress,
  validateContactName,
  validatePhone,
  validateEmail,
} from "@functions/workplace/workplaceValidator";
import { createWorkplace, getWorkplace, updateWorkplace } from "@api/db/workplaceDatabase";
import { getAuth } from "firebase/auth";
import { Workplace } from "@api/types/Workplace";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { getAUDCurrency } from "@functions/util/currencyUtil";
import currency from "currency.js";
import CurrencyInput from "react-native-currency-input";
import PhoneInput from "react-native-phone-input";

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

const WorkplaceEditPage = () => {
  const router = useRouter();
  const { workplaceId } = useLocalSearchParams() as { workplaceId: string };
  const [name, setName] = useState<string>("");
  const [abn, setABN] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [contactName, setContactName] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("+61");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [standardRate, setStandardRate] = useState<currency>(getAUDCurrency(0));
  const [overtimeRate, setOvertimeRate] = useState<currency>(getAUDCurrency(0));
  const [frequency, setFrequency] = useState<"Day" | "Hour">("Hour");

  const frequencyOptions: { text: "Day" | "Hour" }[] = [{ text: "Day" }, { text: "Hour" }];

  const [errors, setErrors] = useState({
    name: "",
    abn: "",
    address: "",
    contactName: "",
    phone: "",
    email: "",
  });

  const [phoneValid, setPhoneValid] = useState<boolean>(false);
  const [phoneType, setPhoneType] = useState<string>("");
  const [phoneValue, setPhoneValue] = useState<string>("");

  const phoneRef = React.useRef<PhoneInput>(null);

  const updatePhoneInfo = () => {
    if (phoneRef.current) {
      setPhoneValid(phoneRef.current.isValidNumber());
      setPhoneType(phoneRef.current.getNumberType());
      setPhoneValue(phoneRef.current.getValue());
    }
  };

  useEffect(() => {
    try {
      // Retrieve latest workplace data.
      if (workplaceId) {
        getWorkplace(workplaceId, uid).then((workplace) => {
          if (workplace != null) {
            setName(workplace.name);
            setABN(workplace.abn);
            setAddress(workplace.address);
            setContactName(workplace.contactName);
            setContactEmail(workplace.contactEmail);
            setFrequency(workplace.frequency);
            setStandardRate(workplace.standardRate);
            setOvertimeRate(workplace.overtimeRate);

            // Set the phone number to the state and to the PhoneInput component
            setContactPhone(workplace.contactPhone);
            if (phoneRef.current) {
              phoneRef.current.setValue(workplace.contactPhone);
            }
          }
        });
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  }, []);


  const handleSaveWorkplace = async () => {
    const nameError = validateName(name);
    const ABNError = validateABN(abn);
    const addressError = validateAddress(address);
    const contactNameError = validateContactName(contactName);
    const phoneError = validatePhone(contactPhone);
    const emailError = validateEmail(contactEmail);

    setErrors({
      name: nameError,
      abn: ABNError,
      address: addressError,
      contactName: contactNameError,
      phone: phoneError,
      email: emailError,
    });

    if (nameError || ABNError || addressError || contactNameError || phoneError || emailError) {
      return;
    }

    try {
      const updatedWorkplace: Workplace = {
        name: name,
        address: address,
        contactName: contactName,
        contactPhone: contactPhone,
        contactEmail: contactEmail,
        abn: abn,
        frequency: frequency,
        standardRate: standardRate,
        overtimeRate: overtimeRate,
      };
      if (workplaceId) await updateWorkplace(workplaceId, updatedWorkplace, uid);
      else await createWorkplace(updatedWorkplace, uid);
      router.push({
        pathname: "/workplaces",
      });
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  //Toggle
  const [isActive, setIsActive] = useState(false);

  // Handler to update the state when the toggle is clicked
  const onToggleChange = (isChecked: boolean) => {
    setIsActive(isChecked);
  };

  //UI Design
  return (
    //
    <Layout style={styles.container}>
      <Stack.Screen
        options={{
          title: "Edit Workplace",
        }}
        initialParams={{ workplaceName: "" }}
      />
      <KeyboardAwareScrollView>
        <View style={styles.profileContainer}>
          <View style={styles.inputContainer}>
            <Text style={{ color: "red" }}>{errors.name}</Text>
            <Input
              value={name}
              label="Employer Name"
              onChangeText={(text) => setName(text)}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={{ color: "red" }}>{errors.abn}</Text>
            <Input value={abn} label="Employer ABN" onChangeText={(text) => setABN(text)} />
          </View>
          <View style={styles.inputContainer}>
            <Text style={{ color: "red" }}>{errors.address}</Text>
            <Input
              value={address}
              label="Employer Address"
              onChangeText={(text) => setAddress(text)}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={{ color: "red" }}>{errors.contactName}</Text>
            <Input
              value={contactName}
              label="Employer Contact Name"
              onChangeText={(text) => setContactName(text)}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={{ color: "red" }}>{errors.phone}</Text>
            <Text style={styles.label}>Select Phone Region</Text>
            <PhoneInput
              ref={phoneRef}
              initialCountry="au"
              style={styles.phoneInput}
              onChangePhoneNumber={(text) => {
                setContactPhone(text);
                updatePhoneInfo();
              }}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={{ color: "red" }}>{errors.email}</Text>
            <Input
              value={contactEmail}
              label="Employer Email"
              onChangeText={(text) => setContactEmail(text)}
            />
          </View>
          <View style={styles.toggleContainer}>
            <Text>Manage Pay Details</Text>
            <Toggle style={styles.toggle} checked={isActive} onChange={onToggleChange} />
          </View>
          {isActive && (
            <>
              <View style={styles.inputContainer}>
                <Select
                  label="Frequency"
                  value={frequency}
                  onSelect={(index) =>
                    setFrequency(frequencyOptions[(index as IndexPath).row].text)
                  }
                  style={{ width: "100%" }}
                >
                  {frequencyOptions.map((option) => (
                    <SelectItem title={option.text} key={option.text} />
                  ))}
                </Select>
              </View>
              <View style={styles.currencyInputContainer}>
                <Text style={styles.currencyInputTitle}>Standard Rate</Text>
                <View style={styles.currencyInput}>
                  <CurrencyInput
                    value={standardRate.value}
                    onChangeValue={(value) => setStandardRate(getAUDCurrency(value!))}
                    prefix="$"
                    delimiter=","
                    separator="."
                    precision={2}
                    minValue={0}
                  />
                </View>
              </View>
              <View style={styles.currencyInputContainer}>
                <Text style={styles.currencyInputTitle}>Overtime Rate</Text>
                <View style={styles.currencyInput}>
                  <CurrencyInput
                    value={overtimeRate.value}
                    onChangeValue={(value) => setOvertimeRate(getAUDCurrency(value!))}
                    prefix="$"
                    delimiter=","
                    separator="."
                    precision={2}
                    minValue={0}
                  />
                </View>
              </View>
            </>
          )}
          <Button style={styles.saveButton} onPress={() => handleSaveWorkplace()}>
            Save
          </Button>
        </View>
      </KeyboardAwareScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    backgroundColor: "#f7f9fc",
  },
  profileContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 15,  // Added space between input containers
  },
  currencyInputContainer: {
    width: "100%",
    marginTop: 15,
  },
  currencyInputTitle: {
    fontSize: 14,  // Increased font size for better readability
    marginBottom: 5,
    fontWeight: 'bold',
    color: '#555',
  },
  currencyInput: {
    height: 45,
    justifyContent: "center",
    paddingHorizontal: 15,
    backgroundColor: "#f5f7f7",
    borderRadius: 5,
    borderColor: '#e4e9f2',
    borderWidth: 1,
  },
  saveButton: {
    marginTop: 35,
    backgroundColor: '#3366FF',  // Primary color for better attention
    borderColor: 'transparent',
  },
  toggleContainer: {
    marginVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggle: {
    margin: 2,
  },
  phoneInput: {
    borderColor: '#e4e9f2',
    borderWidth: 1,
    borderRadius: 5,
    height: 45,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: 'bold',
    color: '#555',
  },
  errorText: {
    color: "red",
    marginBottom: 5,
  }
});


export default WorkplaceEditPage;

export const validateName = (name: string) => {
  console.log("enter validateName");
  const regex = /^[A-Za-z\s\-]+$/;
  if (!name) return "Enter a Name";
  if (!regex.test(name)) return "Invalid Name";
  return "";
};

export const validateGender = (gender: string) => {
  console.log("enter validateGender");
  const regex = /^[A-Za-z\s\-]+$/;
  if (!gender) return "Select a Gender";
  if (!regex.test(gender)) return "Select a Gender";
  return "";
};

export const validateAddress = (Address: string) => {
  console.log("enter validateAddress");
  const regex = /^[A-Za-z0-9\s,.-]+$/;
  if (!Address) return "Enter an Address";
  if (!regex.test(Address)) return "Invalid Address";
  return "";
};

export const validateBirthday = (birthday: Date) => {
  console.log("Enter Birthday");
  const today = new Date();
  if (birthday > today) return "You cannot enter a birth date in the future!";
  return "";
};

export const validatePhone = (phone: string) => {
  console.log("enter validatePhone");
  const regex = /^[0-9\s+-]+$/;
  if (!phone) return "Enter a phone number";
  if (!regex.test(phone)) return "Invalid phone num";
  return "";
};

export const validateEmail = (email: string) => {
  console.log("enter validateEmail");
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  if (!email) return "Enter an Email";
  if (!regex.test(email)) return "Invalid Email";
  return "";
};

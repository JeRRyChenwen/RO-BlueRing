// export const validateName = (name: string): boolean => /^[A-Za-z\s-]+$/i.test(name);
// export const validateAbn = (abn: string): boolean => /^[0-9]+$/i.test(abn);
// export const validateAddress = (address: string): boolean => /^[A-Za-z0-9\s,.-]+$/i.test(address);
// export const validatePhone = (phone: string): boolean => /^[0-9\s+-]+$/i.test(phone);
// export const validateEmail = (email: string): boolean => /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i.test(email);


export const validateName = (name: string) => {
    const regex = /^[A-Za-z\s\-]+$/;
    if (!name) return "Enter a Name";
    if (!regex.test(name)) return "Invalid Name";
    return "";
  };
  export const validateABN = (ABN: string) => {
    const regex = /^[0-9]+$/;
    if (!ABN) return "Enter an ABN";
    if (!regex.test(ABN)) return "Invalid ABN";
    return "";
  };
  export const validateAddress = (Address: string) => {
    const regex = /^[A-Za-z0-9\s,.-]+$/;
    if (!Address) return "Enter an Address";
    if (!regex.test(Address)) return "Invalid Address";
    return "";
  };
  export const validateContactName = (contactName: string) => {
    const regex = /^[A-Za-z\s\-]+$/;
    if (!contactName) return "Enter a Name";
    if (!regex.test(contactName)) return "Invalid Name";
    return "";
  };
  export const validatePhone = (phone: string) => {
    const regex = /^[0-9\s+-]+$/;
    if (!phone) return "Enter a phone number";
    if (!regex.test(phone)) return "Invalid phone num";
    return "";
  };
  export const validateEmail = (email: string) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!email) return "Enter an Email";
    if (!regex.test(email)) return "Invalid Email";
    return "";
  };

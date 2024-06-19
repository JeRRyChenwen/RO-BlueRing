# RO-BlueRing

- [Overview](#overview)
- [Demo](#demo)
- [Development Environment](#environment)
- [Get Started](#get-started)
    - [Set Up App Project](#1-setup-your-project)
    - [Set Up Local Backend Emulator](#2-setup-local-backend)
- [Documentation](#documentation)
- [Workflow](#workflow)
- [Changelog](#changelog)

# RosterApp

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![React Native](https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)

An employee-centric rostering tool for mobile devices.
RosterApp provides an portal for employees to manage their work information, see upcoming shifts, share their availabilities with employers, and more.

## Overview
The aim of this project is to build a rostering tool that helps casual work employees manage their work schedule and share their work time availability with employers.

We aim to implement a solution that is:

1. Employee-centric  
2. Intuitive and easy to use  
3. Protect user's privacy, information can only be shared with user's approval  
4. Maintainable and extendable  

### Demo

[dev-1.0 Demo Video (YouTube)](https://youtu.be/0rCtzKLalj8)

[dev-1.1 Demo Video (Google Drive)](https://drive.google.com/file/d/1AfmmqOSob5YZKrzvPM9b7Nei_clITR6n/view?usp=sharing)

[dev-1.2 Demo Video (Google Drive)](https://drive.google.com/file/d/1zOxsx5qXhyeZozqbFkixvkeUFC-1Kr7u/view?usp=sharing)

### Directory Structure
```
|__ docs/
    |__ Project documentation
|__ src/
    |__ Client/
        |__ roster-app/ (Mobile app project folder)
    |__ Server/
        |__ firebase-emulator/ (Local backend emulator for development use)
README.md
```

---

# Development

## Environment

The mobile app `src/Client/roster-app` is an [Expo](https://expo.dev/) project using [React Native](https://reactnative.dev/) with [TypeScript](https://www.typescriptlang.org/) and [Firebase](https://firebase.google.com/docs/emulator-suite).

It uses [Expo Router](https://docs.expo.dev/routing/introduction/) for page navigation, and [UI Kitten](https://akveo.github.io/react-native-ui-kitten/docs/components/components-overview) as the UI library.

Common dependencies:
- [Node.js](https://nodejs.org/en) version 16.13.0 or higher, npm
  
Backend emulator dependencies:
- [Java](https://www.oracle.com/au/java/technologies/downloads/) JDK version 11 or higher
- [Firebase CLI](https://firebase.google.com/docs/cli) version 8.14.0 or higher

## Get Started

### 1. Setup Your Project

1. Clone the repository.
2. Open `src/Client/roster-app` in VSCode. This is the project folder for our mobile app.
3. At `src/Client/roster-app`, install dependencies by running the following command: 
    ```
    npm install
    ```

#### Live Preview on Mobile Device

1. Install [Expo Go app](https://expo.dev/client) on your phone.
2. At `src/Client/roster-app`, start the live preview server by running:
    ```
    npx expo start
    ```
3. A QR code will appear on the Terminal. Scan the QR code with your [Expo Go app](https://expo.dev/client)
   
Note: make sure your phone is connected to the same network as your machine.

For details, see https://docs.expo.dev/get-started/expo-go/

### 2. (Optional) Setup Local Backend

If you don't want to worry about Firebase usage quotas, you can access backend functionalities like database and authentication locally during development.

We use [Firebase Local Emulator Suite](https://firebase.google.com/docs/emulator-suite) to interact with a local emulated Firebase project. The emulator files are located at `src/Server/firebase-local-emulator`.

1. Make sure you have [Node.js](https://nodejs.org/en) v16.13.0 or later, [Java](https://www.oracle.com/au/java/technologies/downloads/) JDK 11 or later.
2. Install [Firebase CLI](https://firebase.google.com/docs/cli) via npm by running the following command:
    ```
    npm install -g firebase-tools
    ```
    Other ways to install: https://firebase.google.com/docs/cli
3. Log into Firebase using your Google account by running the following command:
    ```
    firebase login
    ```
4. At `src/Server/firebase-local-emulator`, start the emulator by running the following command:
    ```
    firebase emulators:start
    ```
5. View the UI in your browser at http://localhost:4000. Port 4000 is the default for the UI, but refer to the terminal messages in case it's different.

6. In `/src/Client/roster-app/src/services/firebaseConfig.js`, uncomment the lines:
```javascript
// Use emulator for development.
// if (__DEV__) {
//   console.log("Using Firebase Local Emulator.");
//   const origin =
//     Constants.expoGoConfig.debuggerHost.split(":").shift() || "localhost";
//   console.log("Origin: " + origin);
//   connectAuthEmulator(auth, `http://${origin}:9099/`);
//   connectFirestoreEmulator(db, origin, 8080);
// }
```
**NOTE: If you wish to connect to remote Firebase again, make sure to comment out these lines!**

For details, see https://firebase.google.com/docs/cli


## Documentation

[Confluence Resources Page](https://confluence.cis.unimelb.edu.au:8443/display/COMP900822023SM2BMBlueRing/Resources)

## Workflow

### How to Contribute

1. On your own machine, create a new **Feature** branch (e.g.`f11-feature-name`) from the latest **Development** branch (e.g. `dev-1.0`).
2. Make commits to your **Feature** branch.
3. After you've finished implementing the feature, create a pull request to the **Development** branch. 

### Branching

| Type | Branch Naming | Description |
| --- | --- | --- |
| Main | main | Accepts merges from Development |
| Development | dev-\<version-number> | Always branch off Main, accepts merges from Features |
| Feature | f\<feature-number>-\<feature-name> | Always branch off Development |

In each phase, we maintain a dedicated **Development** branch for onging development.
New **Feature** branches will be based on the latest **Development** branch. Once a feature is completed, a pull request will be created to merge the **Feature** branch into the **Development** branch.

The **Development** branch will be periodically merged to the **Main** branch.

At the end of each sprint, a baseline tag will be generated on the **Main** branch.

https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow
<img
  src="/docs/images/gitflow-workflow.jpg"
  alt="Gitflow Workflow"
  style="display: inline-block; margin: 0 auto; max-width: 600px">

---

# Changelog

## dev-1.2
**Added**
- Ability to set a custom image for user profile
- Ability to share availability via email
- Work shifts can now be synchronized to your phone's system calendar
- Account logout
- Delete account (experimental)

**Changed**
- Phone number input field now provides selectable country / region codes.

## dev-1.1
**Added**
- Work Shift Management
    - New user interface
    - Work shift deletion
    - Work shift details popup
    - Work shift earning estimates
- Workplace Management
    - Workplace pay rate details editing
    - Workplace swipe interaction
- UX
    - Input field improvements
    - Page layout improvements

**Changed**
- Standardized database operations across Account Management, Profile Management, Workplace Management, Work Shift Management
f
**Fixed**
- Account password recovery

## dev-1.0
**Added**
- Home page navigation
- Home page side menu
- Account Management
    - User login and register
- Profile Management
    - User profile editing
- Availability Management
    - Basic standard and ad-hoc availability creation, editing, deletion
- Workplace Management
    - Create, edit, delete workplace information
- Workshift Management
    - Dynamic calendar view
    - Create workshifts
- Firebase Authentication and Firestore integration for user data persistence

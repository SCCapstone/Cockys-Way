# Cocky's Way

We are making a navigation app tailored to students at the UofSC for the purpose of efficient navigation with GPS, and schedule management.
The app will be able to navigate to specific locations on campus and have
the ability to save locations as 'favorites'. The app will also allow
students to view information about their classes and professors, including
location, time, office hours, and title. The app will integrate Firebase DB
in order to save user settings, favorites, account, and other like information.

## External Requirements

To run this app, you'll first need to download and install:

- [Node.js](https://nodejs.org/en/)
- [Expo Go](https://expo.dev/go) on your phone

## Setup

Once cloning the repo, you'll have to:

1. Open up a terminal, and install the Expo CLI using `npm install -g expo-cli`
2. Install the dependencies the project uses with `npm install`

## Running

To run the app, you'll have to:

- Ensure both your computer and phone are connected to the same local network
- Ensure your working directory is 'Cockys-Way' (the project root directory)
- Run `npx expo start` in your git bash/powershell terminal
- Open Expo app on your phone and select "Scan QR code"
- The app will load automatically

Possible troubleshooting:

- Wireless(Phone) and wired(PC) networks are segregated (common with VLAN), node installed in improper directory, incorrect Java version installed, previous node version is preinstalled.

# Deployment

We will be deploying our build with eas build (using expo.dev) to build an apk that works on android devices. Follow the steps below to initiate the build and deploy the app

1. Globally install the eas-cli by running `npm install -g eas-cli` (this only has to be done once on your computer)

2. Once eas-cli is installed, run `eas login` to login to your expo account

3. Run `eas build -p android --profile preview` to build the app

> Note: The build process may take a while as we are working on the free version of the platform (~20-30 minutes). Also, access to the Cockys-Way project on expo.dev is required to deploy the app. If you need access, please reach out to one of the team members.

# Testing

## Testing Technology

## Running Tests

## Authors

- Ryan Malone: rpmalone@email.sc.edu
- Isaac Mayernik: mayernii@email.sc.edu
- Johnny Hyman: JPHYMAN@email.sc.edu
- Chloe Brown: CHLOERB@email.sc.edu
- Jacob Bagley: jbagley@email.sc.edu

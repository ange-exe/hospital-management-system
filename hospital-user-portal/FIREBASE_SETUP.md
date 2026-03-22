# Firebase Setup Guide 🔥

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `hospital-management-system` (or any name you like)
4. Disable Google Analytics (optional, but makes setup faster)
5. Click "Create project"

## Step 2: Register Your Web App

1. In your Firebase project, click the **Web icon** (`</>`) to add a web app
2. Register app with nickname: `Campus Health Portal`
3. **Don't check** "Set up Firebase Hosting" (not needed for now)
4. Click "Register app"
5. **COPY the firebaseConfig object** - you'll need this!

It looks like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Step 3: Enable Firestore Database

1. In Firebase Console, click **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
4. Select a location (choose closest to you)
5. Click "Enable"

**Important:** Test mode allows read/write for 30 days. For production, you'll need to set up proper security rules!

## Step 4: Configure Your App

1. Open `src/firebase.js` in your project
2. **Replace** the placeholder config with YOUR config from Step 2:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_ACTUAL_PROJECT.firebaseapp.com",
  projectId: "YOUR_ACTUAL_PROJECT_ID",
  storageBucket: "YOUR_ACTUAL_PROJECT.appspot.com",
  messagingSenderId: "YOUR_ACTUAL_SENDER_ID",
  appId: "YOUR_ACTUAL_APP_ID"
};
```

3. Save the file

## Step 5: Install Dependencies & Run

```bash
npm install
npm run dev
```

## Testing It Works! 🎉

1. Open the app at `http://localhost:5173`
2. Go to **Appointments** page
3. Fill out the form and click "Submit Appointment Request"
4. Check your Firebase Console > Firestore Database
5. You should see a new collection called `appointments` with your data!

## What's Working Now:

✅ Appointments are saved to Firebase Firestore  
✅ Real-time data persistence  
✅ Form validation  
✅ Success messages  
✅ Loading states  
✅ AI Agent button (placeholder for next step)

## Next Steps:

- Implement the AI Calling Agent
- Add user authentication
- Set up proper security rules
- Deploy to production

## Troubleshooting:

**Error: "Firebase: No Firebase App..."**
- Make sure you replaced the config in `src/firebase.js` with your actual Firebase config

**Appointments not showing up:**
- Check Firebase Console > Firestore Database to see if data is being saved
- Check browser console for errors
- Make sure Firestore is in "test mode" for now

**Need help?**
- Firebase docs: https://firebase.google.com/docs/firestore
- React + Firebase guide: https://firebase.google.com/docs/web/setup

---

Good luck with your presentation tomorrow! 🚀

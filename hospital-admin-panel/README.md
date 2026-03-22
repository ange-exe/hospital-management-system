# Health Portal - Admin Panel

Complete admin panel for the Health Portal Hospital Management System.

## 🎯 Features

### ✅ Dashboard
- Overview statistics (total/pending/confirmed appointments)
- Recent appointments list
- Quick action cards
- Real-time data from Firebase

### ✅ Appointments Management
- View all appointments from all users
- Filter by status (pending/confirmed/cancelled)
- Filter by date
- Approve appointments
- Cancel appointments  
- Delete appointments
- View detailed appointment info

### ✅ Doctors Management
- View all doctors
- Add new doctors
- Edit doctor information
- Delete doctors
- Track specializations and departments

### ✅ Patients View
- List all patients (from appointments)
- View patient appointment history
- Track visit frequency
- Patient details modal

## 🔐 Login

**Demo Password:** `admin123`

(Later: replace with proper Firebase Authentication)

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

**IMPORTANT:** Copy your Firebase config from the user-side app!

Open `src/firebase.js` and replace with YOUR Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

**Use the SAME Firebase project as your user-side app!**

### 3. Run the Admin Panel

```bash
npm run dev
```

The admin panel will start on **`http://localhost:5174`**

(Different port from user app which runs on 5173!)

## 📁 File Structure

```
hospital-admin-panel/
├── src/
│   ├── components/
│   │   ├── AdminLogin.jsx       # Login page
│   │   ├── AdminNavbar.jsx      # Sidebar navigation
│   │   ├── AdminDashboard.jsx   # Dashboard with stats
│   │   ├── AdminAppointments.jsx # Appointments management
│   │   ├── AdminDoctors.jsx     # Doctors management
│   │   └── AdminPatients.jsx    # Patients list
│   ├── App.jsx                  # Main app component
│   ├── AdminApp.css             # All styling
│   ├── firebase.js              # Firebase config
│   └── main.jsx                 # Entry point
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🎨 Design

- Professional dark theme
- Clean, modern UI
- Responsive design
- Intuitive navigation
- Real-time updates

## 🔗 Integration with User App

Both apps connect to the **SAME Firebase database**:

```
User App (localhost:5173)
    ↓
Firebase Firestore ← Shared Database
    ↑
Admin App (localhost:5174)
```

**What happens:**
1. User books appointment → Saved to Firebase with `status: "pending"`
2. Admin logs in → Sees the appointment
3. Admin approves → Updates `status: "confirmed"`
4. User refreshes → Sees confirmed status!

## 📊 Data Flow

### Appointments Collection

```javascript
{
  patientName: "Neha Patel",
  patientId: "STU-2024-1847",
  appointmentType: "General Checkup",
  department: "General Medicine",
  provider: "Dr. Anjali Sharma",
  date: "2026-02-15",
  time: "10:00",
  reason: "Annual checkup",
  symptoms: "None",
  preferredContact: "email",
  status: "pending",  // Admin can change this!
  createdAt: Timestamp
}
```

## 🎯 For Exhibition Demo

### Demo Script:

1. **Login:** Enter password `admin123`
2. **Dashboard:** Show stats overview
3. **Appointments:** 
   - Show all appointments
   - Filter by status
   - Approve a pending appointment
   - Show detail modal
4. **Doctors:** 
   - Show doctors list
   - Add a new doctor
   - Edit doctor info
5. **Patients:**
   - Show patients list
   - View patient history

### Talking Points:

- "Admin can manage the entire system from this panel"
- "Real-time sync with user app through Firebase"
- "Token system prevents overbooking"
- "Complete appointment lifecycle management"

## 🔧 Future Enhancements

- [ ] Firebase Authentication (replace hardcoded password)
- [ ] Email notifications to patients
- [ ] Export appointments to CSV/Excel
- [ ] Calendar view for appointments
- [ ] Analytics and reporting
- [ ] Doctor availability scheduling
- [ ] SMS notifications
- [ ] Multi-admin roles (super admin, staff, etc.)

## 🐛 Troubleshooting

**Can't login?**
- Password is `admin123` (all lowercase)

**No appointments showing?**
- Make sure Firebase config is correct
- Check if user app has booked any appointments
- Check Firebase Console to see if data exists

**Runs on wrong port?**
- Check `vite.config.js` - should be port 5174
- User app should be 5173, admin should be 5174

## 📝 Notes

- Currently uses simple password authentication
- Doctors list is local (not in Firebase yet)
- Both apps must use SAME Firebase project
- Admin panel is separate React app

## 🎉 You're Ready!

Your admin panel is complete and ready for demo!

**Password:** `admin123`  
**Port:** `5174`  
**Database:** Same as user app (Firebase)

Good luck with your exhibition! 🚀

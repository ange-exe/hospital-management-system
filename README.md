# Hospital Management System - User Portal

A modern, React-based patient portal for hospital management with real-time appointment booking, medical records access, and health resources.

##  Features

### Patient Features
- **Appointment Booking**
  - Book appointments with 8 medical departments
  - Smart token/queue system (5 slots per time)
  - Real-time slot availability
  - View appointment history and status

- **Medical Records**
  - View all appointments and visit history
  - Access prescriptions with dosage and duration details
  - View lab results with scan/report links
  - Track appointment notes and diagnoses from doctors

- **Health Articles**
  - Browse 18+ health articles across 7 categories
  - Filter by category (Mental Health, Nutrition, Fitness, etc.)
  - Maternal & Infant Care resources
  - Latest health research updates

##  Available Departments

- General Medicine
- Cardiology
- Pediatrics
- Orthopedics
- Mental Health
- Dermatology
- Gynecology
- Dental

##  Tech Stack

- **Frontend:** React 18.3.1 with Vite 6.0.1
- **Database:** Firebase Firestore
- **Styling:** Custom CSS with CSS variables
- **State Management:** React Hooks (useState, useEffect)
- **Fonts:** Crimson Pro and DM Sans

##  Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd hospital-user-portal
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Firestore Database
   - Copy your Firebase config
   - Update `src/firebase.js` with your credentials

4. Run the application:
```bash
npm run dev
```

The app will run on `http://localhost:3000`

##  Firebase Setup

### Required Collections:
- `appointments` - Stores all appointment bookings
- `prescriptions` - Patient prescriptions from doctors
- `labResults` - Lab test results and scans
- `healthArticles` - Custom health articles

### Required Indexes:
Create composite indexes for:
- `appointments`: `patientId` (Ascending) + `createdAt` (Descending)
- `prescriptions`: `patientId` (Ascending) + `createdAt` (Descending)
- `labResults`: `patientId` (Ascending) + `createdAt` (Descending)

Firebase will provide index creation links when needed.

##  Patient Information

Current demo patient:
- **Name:** Raju Rastogi
- **Student ID:** STU-2024-1847
- **Blood Type:** O+

##  Project Structure
```
hospital-user-portal/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx           # Navigation bar
│   │   ├── Home.jsx             # Landing page
│   │   ├── MedicalRecords.jsx   # Patient records (Firebase connected)
│   │   ├── Appointments.jsx     # Appointment booking (Firebase connected)
│   │   └── HealthArticles.jsx   # Health articles (Firebase connected)
│   ├── App.jsx                  # Main app component
│   ├── App.css                  # Global styles
│   ├── firebase.js              # Firebase configuration
│   └── main.jsx                 # Entry point
└── README.md                    # This file
```

##  Design Features

- Modern healthcare-focused design
- Trustworthy green primary color with warm accents
- Smooth animations and transitions
- Responsive layout
- Interactive hover effects

##  Related Projects

- [Admin Panel](../hospital-admin-panel) - Hospital staff management interface

##  Future Enhancements

- User authentication and login
- Email notifications for appointments
- Prescription refill requests
- Telemedicine integration
- AI health assistant

##  License

This project is for educational purposes.

##  Author

Built for college exhibition project
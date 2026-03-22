# Hospital Management System - Admin Panel

A comprehensive React-based admin interface for hospital staff to manage appointments, doctors, patients, medical records, and health content.

##  Features

### Appointment Management
- View all appointments with status tracking
- Filter by department (8 medical departments)
- Approve or cancel appointments
- Real-time updates from Firebase

### Medical Records Management
- View patient records by ID
- Add prescriptions (medication, dosage, frequency, duration)
- Add lab results with scan/report URL support
- Add appointment notes and diagnoses
- Complete patient history view

### Doctor Management
- Add new doctors to the system
- Edit doctor information
- Delete doctors
- Assign doctors to departments

### Patient Management
- View all registered patients
- Search patients by name or ID
- Track patient appointment count

### Health Articles Management
- View all health articles (dummy + custom)
- Add new health articles
- Filter articles by category
- Manage health content for patient portal

##  Admin Access

**Login Credentials:**
- Password: `admin123`

##  System Overview

### Departments (18 Doctors Total)
- **General Medicine:** Dr. Dadar, Dr. Bhandup
- **Cardiology:** Dr. Andheri, Dr. Thane
- **Pediatrics:** Dr. Lower Parel, Dr. Vikhroli
- **Orthopedics:** Dr. Mulund, Dr. Bandra
- **Mental Health:** Dr. Kurla, Dr. Ghatkopar
- **Dermatology:** Dr. Borivali, Dr. Kandivali
- **Gynecology:** Dr. Malad, Dr. Goregaon
- **Dental:** Dr. Jogeshwari, Dr. Vile Parle
- **Nursing Staff:** Nurse Chewbacca

##  Tech Stack

- **Frontend:** React 18.3.1 with Vite 6.0.1
- **Database:** Firebase Firestore
- **Styling:** Custom CSS with admin theme
- **State Management:** React Hooks
- **Authentication:** Simple password-based (development)

##  Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd hospital-admin-panel
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Use the SAME Firebase project as User Portal
   - Update `src/firebase.js` with credentials
   - Ensure all collections are accessible

4. Run the application:
```bash
npm run dev
```

The admin panel will run on `http://localhost:3001`

##  Firebase Setup

### Collections Used:
- `appointments` - All patient appointments
- `prescriptions` - Doctor prescriptions
- `labResults` - Lab test results
- `healthArticles` - Health content

### Security Rules:
For development, Firestore rules should allow read/write. 
**Note:** Implement proper authentication before production!

##  Dashboard Stats

- Total appointments count
- Pending appointments
- Approved appointments
- Cancelled appointments

##  Key Features Breakdown

### Medical Records
- **Patient Selection:** Search and select from all patients
- **View History:** Complete appointment history
- **Add Prescriptions:** Full prescription details with doctor name
- **Add Lab Results:** Test name, results, normal range, notes, and image URLs
- **Appointment Notes:** Add diagnosis and visit notes to any appointment

### Health Articles
- **Dummy Articles:** 4 default articles (cannot be deleted)
- **Custom Articles:** Add unlimited articles from admin
- **Categories:** 7 health categories
- **Icons:** Choose from 17+ emoji icons
- **Real-time Sync:** Articles instantly appear in user portal

##  Project Structure
```
hospital-admin-panel/
├── src/
│   ├── components/
│   │   ├── Login.jsx              # Admin login page
│   │   ├── AdminNavbar.jsx        # Admin navigation
│   │   ├── AdminDashboard.jsx     # Dashboard with stats
│   │   ├── AdminAppointments.jsx  # Appointments management
│   │   ├── AdminDoctors.jsx       # Doctors management
│   │   ├── AdminPatients.jsx      # Patients view
│   │   ├── AdminMedicalRecords.jsx # Medical records management
│   │   └── AdminHealthArticles.jsx # Health articles management
│   ├── App.jsx                    # Main app component
│   ├── admin.css                  # Admin styles
│   ├── firebase.js                # Firebase configuration
│   └── main.jsx                   # Entry point
└── README.md                      # This file
```

##  Related Projects

- [User Portal](../hospital-user-portal) - Patient-facing interface

##  Future Enhancements

- Role-based access control (doctors, nurses, admin)
- Analytics dashboard with charts
- Appointment scheduling conflicts detection
- Bulk operations for appointments
- Export reports to PDF/Excel
- Email notifications to patients
- Real authentication system

##  Important Notes

- This is a development version with simple password authentication
- Use the SAME Firebase project for both User and Admin panels
- Create Firebase indexes when prompted (links provided in console)
- Admin panel runs on port 3001 by default

##  License

Educational project for college exhibition.

##  Author

(1) **Angelina Nadar** - [GitHub](https://github.com/anangelina19n-ctrl) | [LinkedIn]()
(2) **Khushi Thorat** - [GitHub](https://github.com/) | [LinkedIn]()

Built for Xavier Institute of Engineering,  Mahim
Mini Project 2026 for Sem 4
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

// PASTE YOUR FIREBASE CONFIG HERE (same as firebase.js)
const firebaseConfig = {
  apiKey: "AIzaSyAVhapAlBDVLzH_WdYLvaXXcn9C_9Lcz18",
  authDomain: "hospital-management-syst-d6216.firebaseapp.com",
  projectId: "hospital-management-syst-d6216",
  storageBucket: "hospital-management-syst-d6216.firebasestorage.app",
  messagingSenderId: "698518206289",
  appId: "1:698518206289:web:6c25c0ab12eb1bbcae4570",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DUMMY APPOINTMENTS DATA
const dummyAppointments = [
  {
    patientName: "Rajesh Sharma",
    patientId: "PAT-2024-001",
    appointmentType: "General Checkup",
    department: "General Medicine",
    provider: "Dr. Bhandup",
    date: "2026-03-18",
    time: "09:00",
    reason: "Annual health checkup",
    symptoms: "None",
    preferredContact: "email",
    status: "confirmed",
    createdAt: Timestamp.now()
  },
  {
    patientName: "Priya Desai",
    patientId: "PAT-2024-002",
    appointmentType: "Follow-up",
    department: "Cardiology",
    provider: "Dr. Thane",
    date: "2026-03-19",
    time: "10:00",
    reason: "Blood pressure monitoring",
    symptoms: "Mild chest discomfort",
    preferredContact: "phone",
    status: "pending",
    createdAt: Timestamp.now()
  },
  {
    patientName: "Amit Patel",
    patientId: "PAT-2024-003",
    appointmentType: "New Patient Visit",
    department: "Pediatrics",
    provider: "Dr. Andheri",
    date: "2026-03-20",
    time: "11:00",
    reason: "Child vaccination",
    symptoms: "None",
    preferredContact: "email",
    status: "confirmed",
    createdAt: Timestamp.now()
  },
  {
    patientName: "Sneha Kulkarni",
    patientId: "PAT-2024-004",
    appointmentType: "Consultation",
    department: "Dermatology",
    provider: "Dr. Sion",
    date: "2026-03-21",
    time: "14:00",
    reason: "Skin rash treatment",
    symptoms: "Itchy rash on arms",
    preferredContact: "phone",
    status: "pending",
    createdAt: Timestamp.now()
  },
  {
    patientName: "Kavita Reddy",
    patientId: "PAT-2024-005",
    appointmentType: "Prenatal Care",
    department: "Gynecology",
    provider: "Dr. Matunga",
    date: "2026-03-22",
    time: "10:30",
    reason: "Second trimester checkup",
    symptoms: "None",
    preferredContact: "email",
    status: "confirmed",
    createdAt: Timestamp.now()
  },
  {
    patientName: "Arjun Mehta",
    patientId: "PAT-2024-006",
    appointmentType: "Follow-up",
    department: "Orthopedics",
    provider: "Dr. Lower Parel",
    date: "2026-03-23",
    time: "15:00",
    reason: "Knee pain assessment",
    symptoms: "Pain while walking",
    preferredContact: "phone",
    status: "pending",
    createdAt: Timestamp.now()
  },
  {
    patientName: "Meera Singh",
    patientId: "PAT-2024-007",
    appointmentType: "Therapy Session",
    department: "Mental Health",
    provider: "Dr. Madh",
    date: "2026-03-24",
    time: "16:00",
    reason: "Anxiety counseling",
    symptoms: "Stress and anxiety",
    preferredContact: "email",
    status: "confirmed",
    createdAt: Timestamp.now()
  },
  {
    patientName: "Vikram Joshi",
    patientId: "PAT-2024-008",
    appointmentType: "Dental Cleaning",
    department: "Dental",
    provider: "Dr. Diva",
    date: "2026-03-25",
    time: "11:30",
    reason: "Regular dental checkup",
    symptoms: "None",
    preferredContact: "phone",
    status: "pending",
    createdAt: Timestamp.now()
  },
  {
    patientName: "Ananya Iyer",
    patientId: "PAT-2024-009",
    appointmentType: "Pregnancy Consultation",
    department: "Gynecology",
    provider: "Dr. Matunga",
    date: "2026-03-26",
    time: "09:30",
    reason: "First trimester visit",
    symptoms: "Morning sickness",
    preferredContact: "email",
    status: "confirmed",
    createdAt: Timestamp.now()
  },
  {
    patientName: "Rohan Kapoor",
    patientId: "PAT-2024-010",
    appointmentType: "General Checkup",
    department: "General Medicine",
    provider: "Dr. Bhandup",
    date: "2026-03-27",
    time: "13:00",
    reason: "Flu symptoms",
    symptoms: "Fever and cough",
    preferredContact: "phone",
    status: "pending",
    createdAt: Timestamp.now()
  },
  {
    patientName: "Neha Patel",
    patientId: "STU-2024-1847",
    appointmentType: "General Checkup",
    department: "General Medicine",
    provider: "Dr. Bhandup",
    date: "2026-03-28",
    time: "10:00",
    reason: "Regular checkup",
    symptoms: "None",
    preferredContact: "email",
    status: "pending",
    createdAt: Timestamp.now()
  }
];

async function addDummyData() {
  console.log('🚀 Starting to add dummy appointments...');
  
  try {
    const appointmentsRef = collection(db, 'appointments');
    
    for (let i = 0; i < dummyAppointments.length; i++) {
      const appointment = dummyAppointments[i];
      const docRef = await addDoc(appointmentsRef, appointment);
      console.log(`✅ Added appointment ${i + 1}/${dummyAppointments.length}: ${appointment.patientName} - ID: ${docRef.id}`);
    }
    
    console.log('🎉 All dummy appointments added successfully!');
    console.log('📊 Total appointments added:', dummyAppointments.length);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding dummy data:', error);
    process.exit(1);
  }
}

addDummyData();
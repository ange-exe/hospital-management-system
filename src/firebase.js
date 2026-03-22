// Import Firebase SDK
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// YOUR Firebase configuration (from Step 3!)
// REPLACE THIS with your actual config!!!
const firebaseConfig = {
  apiKey: "AIzaSyAVhapAlBDVLzH_WdYLvaXXcn9C_9Lcz18",
  authDomain: "hospital-management-syst-d6216.firebaseapp.com",
  projectId: "hospital-management-syst-d6216",
  storageBucket: "hospital-management-syst-d6216.firebasestorage.app",
  messagingSenderId: "698518206289",
  appId: "1:698518206289:web:6c25c0ab12eb1bbcae4570",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firestore database
export const db = getFirestore(app);
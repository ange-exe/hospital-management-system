import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// IMPORTANT: Use the SAME Firebase config as your user-side app!
// Replace with YOUR actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAVhapAlBDVLzH_WdYLvaXXcn9C_9Lcz18",
  authDomain: "hospital-management-syst-d6216.firebaseapp.com",
  projectId: "hospital-management-syst-d6216",
  storageBucket: "hospital-management-syst-d6216.firebasestorage.app",
  messagingSenderId: "698518206289",
  appId: "1:698518206289:web:6c25c0ab12eb1bbcae4570",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

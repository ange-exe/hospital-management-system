# Health Portal - Hospital Management System

A modern, full-stack React application for managing healthcare services. Features real-time appointment scheduling with Firebase backend and AI calling agent integration (coming soon).

## 🎉 NEW FEATURES (Updated for PPT Demo!)

### 🔥 Firebase Integration
- **Real appointment scheduling** - Data persists in Firebase Firestore
- **Live database** - Appointments saved and retrieved in real-time
- **Production-ready backend** - No more dummy data!

### 🤖 AI Calling Agent (UI Ready)
- Prominent call button on Appointments page
- Voice-based appointment booking (implementation in progress)
- Hands-free scheduling experience

## Features

### 🏠 Home Page
- Welcome hero section with call-to-action buttons
- Quick access cards to all major features
- Personal health statistics dashboard
- Recent announcements and updates

### 📋 Medical Records
- Personal information overview
- Complete visit history timeline
- Active prescriptions management
- Recent lab results display
- Allergy and emergency contact information

### 📅 Appointments
- View upcoming appointments
- Interactive appointment scheduling form
- Multiple time slots and provider selection
- Department-specific booking
- Appointment management (reschedule/cancel buttons)

### 👶 Maternal Care
- Comprehensive prenatal care timeline
- Week-by-week pregnancy milestones
- Educational resources for expecting mothers
- Service offerings (prenatal visits, ultrasounds, etc.)
- Emergency contact information
- Postpartum care guidance

### 📚 Health Articles
- Curated health and wellness articles
- Category filtering (Mental Health, Nutrition, Fitness, etc.)
- Latest research updates
- Newsletter subscription
- Detailed article cards with author and read time

## Design Features

- **Modern Aesthetic**: Clean, professional healthcare-focused design
- **Custom Color Palette**: Trustworthy green primary color with warm accent tones
- **Typography**: Elegant Crimson Pro for headings, DM Sans for body text
- **Smooth Animations**: Subtle fade-in and slide-up animations
- **Responsive Layout**: Works on desktop and mobile devices
- **Interactive Elements**: Hover effects, transitions, and micro-interactions

## Tech Stack

- **React 18.3.1**: Modern React with functional components and hooks
- **Vite 6.0.1**: Fast build tool and dev server
- **Firebase 10.7.1**: Backend database and real-time sync
- **Firestore**: NoSQL cloud database for appointments
- **Pure CSS**: Custom styling without external UI libraries
- **Google Fonts**: Crimson Pro and DM Sans

## Project Structure

```
hospital-management-system/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx           # Navigation bar
│   │   ├── Home.jsx              # Landing page
│   │   ├── MedicalRecords.jsx    # Patient records view
│   │   ├── Appointments.jsx      # Appointment scheduling
│   │   ├── MaternalCare.jsx      # Maternal care resources
│   │   └── HealthArticles.jsx    # Health articles & research
│   ├── App.jsx                   # Main app component
│   ├── App.css                   # Global styles
│   └── main.jsx                  # Entry point
├── index.html                    # HTML template
├── package.json                  # Dependencies
├── vite.config.js               # Vite configuration
└── README.md                     # This file
```

## Installation & Setup

### Quick Start (Without Firebase - Static Demo)
1. **Navigate to the project directory:**
   ```bash
   cd hospital-management-system
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - The app will be running at `http://localhost:5173`

### Full Setup (With Firebase - Working Backend!) 🔥

**See detailed instructions in `FIREBASE_SETUP.md`**

Quick version:
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database in test mode
3. Copy your Firebase config
4. Paste it into `src/firebase.js` (replace the placeholder)
5. Run `npm install && npm run dev`
6. Your appointments now save to Firebase! 🎉

## Usage

- **Navigation**: Click on the navigation links to switch between different sections
- **AI Calling Agent**: Click the "📞 Call AI Agent" button on Appointments page (coming soon!)
- **Appointments**: Fill out the form and submit - **data saves to Firebase!** 🔥
- **Records**: View static sample medical history and prescriptions
- **Articles**: Browse health articles and filter by category
- **Maternal Care**: Explore pregnancy timeline and resources

## Demo for PPT/Presentation 🎤

**What's Actually Working:**
1. ✅ Full appointment form with validation
2. ✅ Data saves to Firebase Firestore in real-time
3. ✅ Appointments load from database on page refresh
4. ✅ Success messages and loading states
5. ✅ AI Agent button (frontend ready, agent integration next)

**How to Demo:**
1. Show the beautiful UI and navigation
2. Click "📞 Call AI Agent" button - show it's there!
3. Fill out appointment form
4. Submit and show success message
5. **Open Firebase Console** - show data was actually saved! 🎉
6. Refresh page - appointments still there (persistent data!)

## Features to Note

- Appointment data **actually saves to Firebase** (not just dummy data!)
- AI Calling Agent **button is visible** and ready for integration
- **Smooth page transitions** using React state management
- **Responsive design** that adapts to different screen sizes
- **Professional healthcare aesthetic** with thoughtful color choices

## Next Steps / Roadmap 🚀

### Immediate (For Next Demo)
- [ ] Implement AI Calling Agent with voice recognition
- [ ] Connect calling agent to appointment booking
- [ ] Add phone number input for callbacks

### Short-term
- [ ] User authentication (Firebase Auth)
- [ ] User-specific appointment history
- [ ] Email notifications
- [ ] SMS reminders

### Long-term
- [ ] Real-time appointment availability checking
- [ ] File upload for medical documents
- [ ] Prescription refill requests
- [ ] Telemedicine video consultations
- [ ] Payment integration
- [ ] Doctor dashboard

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Development Notes

This is a **prototype/demonstration application** designed to showcase:
- React component architecture
- Modern UI/UX design principles
- Healthcare portal functionality
- Clean, maintainable code structure

No backend, database, or API integration is included in this version.

## License

This project is for educational/demonstration purposes.

## Author

Built with React, Vite, and attention to detail for an excellent user experience.

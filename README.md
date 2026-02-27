# Bato-Bato Pick Arena - Rock Paper Scissors Game

A real-time Rock-Paper-Scissors game with Firebase authentication and real-time database tracking.

## 📋 Prerequisites

- Firebase project set up (https://console.firebase.google.com)
- Node.js 14+ (for admin scripts only)
- Modern web browser with JavaScript enabled

## 🚀 Deployment Guide

### 1. GitHub Setup
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/bato-bato-pick.git
git push -u origin main
```

### 2. Firebase Configuration
Update `firebase-init.js` with your Firebase project credentials:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 3. Firebase Security Rules
Set these rules in Firebase Console > Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /players/{userId} {
      allow read, write: if request.auth.uid == userId;
      allow read: if request.auth != null;
    }
  }
}
```

### 4. Firebase Authentication
Enable these auth methods in Firebase Console:
- Email/Password authentication

### 5. Admin Functions (Local Only)
To set a user as admin locally:
```bash
node scripts/set-admin-claim.js /path/to/serviceAccountKey.json USER_UID
```

**IMPORTANT:** Never commit `serviceAccountKey.json`. Keep it local and secure.

## 🔒 Security Notes

✅ **What's Secure:**
- Firebase handles password hashing
- All communications use HTTPS
- Database rules restrict unauthorized access
- Authentication state validated server-side

⚠️ **What to Monitor:**
- Enable Firebase Security Rules (see above)
- Monitor Firebase usage in Console
- Keep dependencies updated
- Enable 2FA on Firebase Console account

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Firebase (Auth + Firestore)
- **Deployment:** GitHub Pages or Firebase Hosting

## 📝 Features

- User registration and login
- Real-time game arena
- Win/loss tracking
- Dark mode toggle
- Admin portal
- Responsive design (mobile, tablet, desktop)
- Sound effects (togglable)

## 🎮 How to Play

1. Register an account
2. Log in with credentials
3. Choose Rock (👊), Paper (🖐), or Scissors (✌️)
4. Win the best-of-5 match
5. Track your legendary wins

## 📄 License

Project completed for educational purposes.

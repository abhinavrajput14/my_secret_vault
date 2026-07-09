/* ============================================================
   config.js
   Central place for secrets & tunables.
   ------------------------------------------------------------
   - Replace USER_PASSWORD / ADMIN_PASSWORD with your own.
   - Replace firebaseConfig with the config object from your
     Firebase project (Project settings → General → Your apps).
   - Edit QUESTIONS below to change what's asked on the page.
   ============================================================ */

// Access passwords (case-sensitive)
const USER_PASSWORD = "friend123";
const ADMIN_PASSWORD = "admin14";

// Firebase project config — replace with your own project's values.
// Get this from Firebase Console > Project Settings > General > Your apps > SDK setup.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// The private message shown with the typewriter effect on the user page.
const PRIVATE_MESSAGE = `Hey. I made this just for you — a small, private corner of the internet where I could say something honestly and hear back from you just as honestly. Take your time. There's no wrong answer here.`;

// The questions asked, in order. Each becomes a YES / NO card.
// The FIRST question in this list is treated as the "primary" question
// for the admin dashboard's YES / NO summary counters.
const QUESTIONS = [
  { id: "q1", text: "Do you think we're truly good friends?" },
  { id: "q2", text: "Do you feel comfortable being fully honest with me?" },
  { id: "q3", text: "Would you want more moments like this, just checking in?" }
];

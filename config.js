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
const USER_PASSWORD = "123456789";
const ADMIN_PASSWORD = "admin14";

// Firebase project config — replace with your own project's values.
// Get this from Firebase Console > Project Settings > General > Your apps > SDK setup.
const firebaseConfig = {
  apiKey: "AIzaSyAD7e4d4QaO7E-fgI1RP8dvBGRaATX5loQ",
  authDomain: "my-vault-8cbe8.firebaseapp.com",
  projectId: "my-vault-8cbe8",
  storageBucket: "my-vault-8cbe8.firebasestorage.app",
  messagingSenderId: "292546312117",
  appId: "1:292546312117:web:caea085960dccc74fd0bfc",
  measurementId: "G-2W9YW33087"
};
// The private message shown with the typewriter effect on the user page.
const PRIVATE_MESSAGE = `Hey. I made this for you — a small, private corner of the internet where I could say something honestly and hear back from you just as honestly. Take your time. There's no wrong answer here.`;

// The questions asked, in order. Each becomes a YES / NO card.
// The FIRST question in this list is treated as the "primary" question
// for the admin dashboard's YES / NO summary counters.
const QUESTIONS = [
  { id: "q1", text: "So Can We Make a New Start?" },
 
];

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
const PRIVATE_MESSAGE = `Hey how are u...??..
I want to apologise from u because maine sab kharab kar diya ego mein aakar...tume mujhse dosti karni thi aur maine wo cheez bhi ni samjhi...aur ego mein aake tume wo message bheja tha...I'm so sorry yrrr...2 month to holidays mein hi nikal gye kuch pta ni lga..par ab jab tume daily dekh rha hu...to yrr bura lg rha hai...regret ho rha hai ki kyu maine tumse dosti bhi khtm kardi...yrr ab mai apni glti ko thik karna chahta hu...tum jaisa chahti ho hum dost hi rahenge...
Thanking u for again reading my message 👀
Yours Obediently .😅
Abhinav...🫣

"Agr tume kuch kehna ho to tum keh sakti ho...??"(and please kuch likhna..💫)

"Aur yrr mai ye website banake message bhejna ye sab isiliye karta hu...kyunki mere andar itna confidence ni hai ki mai tumse school mein sabke samne baat karu...aur waise bhi logo mein kam baatien ni faili hai..to mai ni chahta ki unhe confirmation mil jaye....Par ab iske baad se mai try karunga ki offline hi baat karu....thodi communication skills develop karu..."
That's All..!!💖
`;

// The questions asked, in order. Each becomes a YES / NO card.
// The FIRST question in this list is treated as the "primary" question
// for the admin dashboard's YES / NO summary counters.
const QUESTIONS = [
  { id: "q1", text: "So Can We Make a New Start?" },
 
];

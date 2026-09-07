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
const PRIVATE_MESSAGE = String.raw`Heyyyy… yrrr, kaisi ho? ❤️


I know tumhe shayad accha na lage ki main Saubhagya ke through tum tak message pahucha raha hoon. She’s not my messenger, and honestly mujhe bhi ye sahi nahi lagta… but school to tum aaogi nahi, isliye mere paas aur koi way nahi tha.


Main honestly ek baat kehna chahta hoon. Us din jab tumne kaha tha ki tum nahi chahti ki tumhari wajah se main hurt hou… I understood that. But things are not that simple for me.


Jab tumne Aditya ke saath photos click karwayi aur mujhe last mein yaad kiya, woh bhi isliye kyunki tumhe laga ki main firse sad ho jaunga… yrr, woh cheez mujhe genuinely hurt hui. Mujhe pata hai tum kahogi ki, “Tum kaun hote ho decide karne wale ki main kiske saath photo click karwau?” Aur honestly, tum bilkul sahi ho. Tumhari life hai, tumhari freedom hai, aur mujhe tumhe ye batane ka koi right nahi ki tum kisse baat karo ya kiske saath raho.


But I just want you to understand one thing — **mujhe hurt hota hai.**


Jab main tumhe kisi aur ke saath dekhta hoon, jab tumhe Aditya ke saath daily jaate hue dekhta hoon… it hurts. Aur sabse zyada tab, jab tumne mujhe chhutti ke baad saath jaane se mana kiya tha, but ab tum uske saath jaati ho.


Main ye nahi keh raha ki tum jaan-bujhkar mujhe hurt kar rahi ho. I know tumhari intention mujhe hurt karne ki nahi hai. Tum apni taraf se jo sahi lag raha hai, woh kar rahi ho. Bas kabhi-kabhi main apni feelings ko control nahi kar pata, aur kaash tum samajh paati ki mujhe andar se kaisa feel hota hai.


Aur rahi tumhare past ki baat… I'm genuinely sorry ki tumhare saath woh sab hua. I can understand ki us experience ne tumhe kitna affect kiya hoga. Main tumhe judge nahi kar raha, na hi tumse ye expect karta hoon ki tum sab kuch suddenly bhool jao. Bas I hope ki time ke saath tumhe cheezein thodi easier feel hone lagen aur tum khud ko un memories se define na karo.


Aur dosti ki baat hai toh… I'm always there for you. Tume mujhe dost samamjhna dost samjho stranger samajhna hai stranger samjho, mujhe koi problem nahi hai. Tumhe relationship mein aane ke liye koi force nahi kar raha, aur na hi main ye keh raha hoon ki tum kisi aur ko pasand na karo.


Agar tumhe Aditya pasand hai, even then, I won't tell you what to do. **It's your life, your choices, and I respect that.**


Bas ek sach aur hai — I know I'm not perfect, but I'm genuinely trying to become a better person. And somewhere in my heart, I still hope that one day, when you look at me, you'll choose me too.


Main tumhe force nahi karunga. Tumhe jab bhi lage ki tum mere paas aana chahti ho, I'll be there.


Bas… I hope jab bhi woh din aaye, tum bina kisi pressure ke, apni marzi se aao. ❤️

Aur current senario mein mai tumse baatein karna chahta hu....i want to know you....and i want u to know me......aur ye jo awkwardness hai humare beech wo khtm ho jayee.....🫡

Aur please yrrr, tum roya mat karo… main nahi chahta ki tum meri wajah se tum sad ho ya ro. ❤️

Aur haan, iss message ko **zyada serious mat lena** ..maine bas jo feel hua woh sab likh diya… pata nahi kya-kya likh diya 🙂


Bas ek chhoti si request hai…


**At least meri friend banke rehna. ❤️**


Thanking you,

Yours Truly,
Abhinav :)
`;

// The questions asked, in order. Each becomes a YES / NO card.
// The FIRST question in this list is treated as the "primary" question
// for the admin dashboard's YES / NO summary counters.
const QUESTIONS = [
  { id: "q1", text: "No more questions..." },
 
];

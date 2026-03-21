import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, getDoc, updateDoc, onSnapshot, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBOXSeatdFbM5wRrGfWD5s2Lau01GA0qHQ",
  authDomain: "mdm1-83b68.firebaseapp.com",
  projectId: "mdm1-83b68",
  storageBucket: "mdm1-83b68.firebasestorage.app",
  messagingSenderId: "1020058862774",
  appId: "1:1020058862774:web:fe1f581b47b8f6dcc39217",
  measurementId: "G-5MMV16YBE0"
};

// Initialize Firebase only if the config is valid/changed
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { 
  app, 
  auth, 
  db, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  setDoc,
  getDoc,
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  serverTimestamp 
};

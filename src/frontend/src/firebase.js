// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAjTNnXClHkNBblM3pclPOuKb18IPdk4t8",
  authDomain: "shelterseek-cd57c.firebaseapp.com",
  projectId: "shelterseek-cd57c",
  storageBucket: "shelterseek-cd57c.firebasestorage.app",
  messagingSenderId: "844107876608",
  appId: "1:844107876608:web:af0dc51891eeb4de434be5",
  measurementId: "G-EDY29R96ZG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
const analytics = getAnalytics(app);
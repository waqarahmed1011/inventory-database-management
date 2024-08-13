// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDJSRO9O8Npdtybq1xEDBTth21q6iJgw-g",
  authDomain: "inventory-management-d3df1.firebaseapp.com",
  projectId: "inventory-management-d3df1",
  storageBucket: "inventory-management-d3df1.appspot.com",
  messagingSenderId: "287586525768",
  appId: "1:287586525768:web:9a64fbe9e71f0c122dee7d",
  measurementId: "G-9X6442DDGN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);

export {firestore};
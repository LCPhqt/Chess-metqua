// src/FireBase/config.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCroSHO5d-ajaUQSB7RxxSy9qb6mtqR9XM",
    authDomain: "chessgame-met.firebaseapp.com",
    projectId: "chessgame-met",
    storageBucket: "chessgame-met.firebasestorage.app",
    messagingSenderId: "663267861412",
    appId: "1:663267861412:web:b312dba7ff5bc95ce5d731",
    measurementId: "G-6Y3VRH9Y0B"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);


export default app;

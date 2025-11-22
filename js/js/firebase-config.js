// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDV7gPgtyJ4aoOKhFG2W8i_6OjHQWDxWDI",
    authDomain: "basmato-2a7d8.firebaseapp.com",
    projectId: "basmato-2a7d8",
    storageBucket: "basmato-2a7d8.firebasestorage.app",
    messagingSenderId: "387104092986",
    appId: "1:387104092986:web:af104a7a657642d6da1603",
    measurementId: "G-KVS7DNEJQ1"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Export Firebase services
const db = firebase.firestore();
const auth = firebase.auth();

// Global variables
let allProducts = [];
let currentUser = null;
let userCart = [];

// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyChsiw2bUgtzX-ifuKaRDtSaDge93D6CDA',
  authDomain: 'fairreport-cf87d.firebaseapp.com',
  projectId: 'fairreport-cf87d',
  storageBucket: 'fairreport-cf87d.firebasestorage.app',
  messagingSenderId: '871476117278',
  appId: '1:871476117278:web:9137495623f1d98340930f',
  measurementId: 'G-8EG4WGBYKK',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)

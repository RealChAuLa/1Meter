import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyBvBM-YoOJqSqs79NtfFLpcmm1msLwAN-Q",
    databaseURL: "https://esp32-web-app-9c807-default-rtdb.asia-southeast1.firebasedatabase.app/",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
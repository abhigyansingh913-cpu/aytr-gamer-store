import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyACDWqAUfElZ4V5ZgkTvjTmjlWezCDUrP4",
  authDomain: "appfor-mod.firebaseapp.com",
  databaseURL: "https://appfor-mod-default-rtdb.firebaseio.com",
  projectId: "appfor-mod",
  storageBucket: "appfor-mod.firebasestorage.app",
  messagingSenderId: "653120516468",
  appId: "1:653120516468:web:1059700f03f846d2073c21",
  measurementId: "G-CJLFWEXXKJ",
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

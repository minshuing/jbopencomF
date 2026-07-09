import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

/*
  아래 firebaseConfig는 Firebase Console > 프로젝트 설정 > 내 앱 > SDK 설정 및 구성 에서 복사해서 넣으세요.
  반드시 본인 값으로 교체해야 합니다.
*/
  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB5cg_Mouoa5rcm14qpVK8knhpmGmsr7u0",
  authDomain: "opencomm-6a384.firebaseapp.com",
  databaseURL: "https://opencomm-6a384-default-rtdb.firebaseio.com",
  projectId: "opencomm-6a384",
  storageBucket: "opencomm-6a384.firebasestorage.app",
  messagingSenderId: "730504240462",
  appId: "1:730504240462:web:169bb8e0938b8212d2521f",
  measurementId: "G-Y3CG92YQR5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };

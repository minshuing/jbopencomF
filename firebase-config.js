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
  apiKey: "AIzaSyA9faC7zR-Ep5tV3aqnD2684xImqrKnG7s",
  authDomain: "opencommjb.firebaseapp.com",
  projectId: "opencommjb",
  storageBucket: "opencommjb.firebasestorage.app",
  messagingSenderId: "850083355543",
  appId: "1:850083355543:web:49f565b041a698b6a542d2",
  measurementId: "G-TEWDXX37W0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };

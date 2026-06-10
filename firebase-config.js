import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

/*
  아래 firebaseConfig는 Firebase Console > 프로젝트 설정 > 내 앱 > SDK 설정 및 구성 에서 복사해서 넣으세요.
  반드시 본인 값으로 교체해야 합니다.
*/
  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBFex4Xozb0v0ZRgJD-CntCth78nWmuVKo",
    authDomain: "jbopencom.firebaseapp.com",
    databaseURL: "https://jbopencom-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "jbopencom",
    storageBucket: "jbopencom.firebasestorage.app",
    messagingSenderId: "1098347062568",
    appId: "1:1098347062568:web:0ed678801423177a965c1d",
    measurementId: "G-XN5EXM9PN1"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };

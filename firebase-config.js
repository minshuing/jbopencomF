import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

/*
  아래 firebaseConfig는 Firebase Console > 프로젝트 설정 > 내 앱 > SDK 설정 및 구성 에서 복사해서 넣으세요.
  반드시 본인 값으로 교체해야 합니다.
*/
  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB5cg_Mouoa5rcm14qpVK8knhpmGmsr7u0",
  authDomain: "opencomm-6a384.firebaseapp.com",
  projectId: "opencomm-6a384",
  storageBucket: "opencomm-6a384.firebasestorage.app",
  messagingSenderId: "730504240462",
  appId: "1:730504240462:web:e6e1bd83a32a4d01d2521f",
  measurementId: "G-HTXNM6435V"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };

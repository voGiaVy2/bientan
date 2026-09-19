// app/lib/firebase.js
// Cấu hình và khởi tạo Firebase cho BiếnTầnPro
// Thêm các giá trị NEXT_PUBLIC_FIREBASE_* vào .env.local

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Tránh khởi tạo nhiều lần trong Next.js (hot reload)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth    = getAuth(app);

// Sửa lỗi treo Firestore trên trình duyệt Cốc Cốc / mạng bị chặn WebSocket
export const db = getApps().length && getApp().firestore ? getFirestore(app) : initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;

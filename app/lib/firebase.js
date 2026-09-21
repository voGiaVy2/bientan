// app/lib/firebase.js
// Cấu hình và khởi tạo Firebase cho BiếnTầnPro
// Thêm các giá trị NEXT_PUBLIC_FIREBASE_* vào .env.local

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, getFirestore, memoryLocalCache } from 'firebase/firestore';
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

// Dùng memoryLocalCache thay vì persistentLocalCache để tránh QuotaExceededError
// (persistentLocalCache lưu vào IndexedDB/localStorage → dễ bị đầy bộ nhớ)
// Import memoryLocalCache cùng chỗ với initializeFirestore để tránh lỗi khi fallback
let dbInstance;
if (getApps().length > 0 && getApp()._options) {
  // Nếu app đã có, thử lấy instance Firestore đã khởi tạo (tránh "already initialized" error)
  try {
    dbInstance = initializeFirestore(app, { localCache: memoryLocalCache() });
  } catch {
    // Firestore đã được khởi tạo trước đó → lấy instance cũ
    dbInstance = getFirestore(app);
  }
} else {
  dbInstance = initializeFirestore(app, { localCache: memoryLocalCache() });
}
export const db = dbInstance;
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;

"use client";

// app/context/AuthContext.js
// Thay thế toàn bộ localStorage auth bằng Firebase Authentication
// Cung cấp: currentUser, userProfile, login, register, loginWithGoogle, logout

import { createContext, useContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { auth, db, googleProvider } from "../lib/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ─── Lắng nghe trạng thái auth và profile ─────────────────────────────────
  useEffect(() => {
    let unsubscribeProfile = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser);
      if (firebaseUser) {
        const profileRef = doc(db, "users", firebaseUser.uid);
        
        // 1. Kiểm tra và tạo profile mặc định nếu chưa có
        try {
          const snap = await getDoc(profileRef);
          if (!snap.exists() || !snap.data().email) {
            const defaultProfile = {
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split("@")[0] : "Người dùng"),
              role: "buyer",
              phone: firebaseUser.phoneNumber || "",
              createdAt: serverTimestamp(),
            };
            await setDoc(profileRef, defaultProfile, { merge: true });
          }
        } catch (err) {
          console.error("Lỗi khởi tạo profile:", err);
        }

        // 2. Lắng nghe Realtime thay đổi từ Firestore
        unsubscribeProfile = onSnapshot(profileRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserProfile(docSnap.data());
          }
        });
      } else {
        setUserProfile(null);
        if (unsubscribeProfile) unsubscribeProfile();
      }
      setAuthLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  // ─── Heartbeat cập nhật lastSeen (Online status) ─────────────────────────
  useEffect(() => {
    if (!currentUser || !userProfile) return; // Chỉ cập nhật heartbeat sau khi profile đã load xong để tránh race condition
    const updatePresence = async () => {
      try {
        await setDoc(
          doc(db, "users", currentUser.uid),
          { lastSeen: serverTimestamp() },
          { merge: true }
        );
      } catch (err) {
        console.error("Lỗi cập nhật presence:", err);
      }
    };
    
    updatePresence();
    const interval = setInterval(updatePresence, 60000);
    return () => clearInterval(interval);
  }, [currentUser, userProfile]);

  // ─── Đăng nhập Email/Password ─────────────────────────────────────────────
  const login = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result;
  };

  // ─── Đăng ký Email/Password ───────────────────────────────────────────────
  const register = async ({ email, password, phone, role = "buyer" }) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;

    // Gửi email xác minh
    await sendEmailVerification(user);

    // Lưu profile vào Firestore
    await setDoc(doc(db, "users", user.uid), {
      email,
      displayName: email.split("@")[0],
      phone: phone || "",
      role,
      createdAt: serverTimestamp(),
    });

    return result;
  };

  // ─── Đăng nhập Google ─────────────────────────────────────────────────────
  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  };

  // ─── Cập nhật role người dùng (buyer / seller) ────────────────────────────
  const updateRole = async (role) => {
    if (!currentUser) return;
    
    // Đảm bảo chỉ được set buyer hoặc seller từ client, admin chỉ set từ Firebase Console
    if (role !== 'buyer' && role !== 'seller') {
      throw new Error("Vai trò không hợp lệ. Chỉ có thể là người mua hoặc người bán.");
    }

    const profileRef = doc(db, "users", currentUser.uid);
    
    // Thêm timeout để tránh treo
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("TIMEOUT_FIREBASE")), 10000)
    );

    await Promise.race([
      setDoc(profileRef, { role }, { merge: true }),
      timeoutPromise
    ]);

    setUserProfile((prev) => ({ ...prev, role }));
  };

  // ─── Đăng xuất ────────────────────────────────────────────────────────────
  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    currentUser,
    userProfile,
    authLoading,
    login,
    register,
    loginWithGoogle,
    logout,
    updateRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth phải được dùng bên trong AuthProvider");
  return context;
}

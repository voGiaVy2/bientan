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
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "../lib/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);   // Firebase User object
  const [userProfile, setUserProfile]  = useState(null);  // Firestore profile (role, phone, v.v.)
  const [authLoading, setAuthLoading]  = useState(true);

  // ─── Lắng nghe trạng thái auth ────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser);
      if (firebaseUser) {
        // Lấy profile từ Firestore
        try {
          const profileRef = doc(db, "users", firebaseUser.uid);
          const snap = await getDoc(profileRef);
          if (snap.exists()) {
            setUserProfile(snap.data());
          } else {
            // Tạo profile mặc định nếu chưa có (vd: đăng nhập bằng Google lần đầu)
            const defaultProfile = {
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || firebaseUser.email.split("@")[0],
              role: "buyer",
              phone: "",
              createdAt: serverTimestamp(),
            };
            await setDoc(profileRef, defaultProfile);
            setUserProfile(defaultProfile);
          }
        } catch (err) {
          console.error("Lỗi load userProfile:", err);
        }
      } else {
        setUserProfile(null);
      }
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  // ─── Heartbeat cập nhật lastSeen (Online status) ─────────────────────────
  useEffect(() => {
    if (!currentUser) return;
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
    
    // Cập nhật ngay lần đầu
    updatePresence();
    // Sau đó lặp lại mỗi 60 giây
    const interval = setInterval(updatePresence, 60000);
    return () => clearInterval(interval);
  }, [currentUser]);

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
    const profileRef = doc(db, "users", currentUser.uid);
    await setDoc(profileRef, { role }, { merge: true });
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

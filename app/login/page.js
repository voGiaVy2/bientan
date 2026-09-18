"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // ─── Email / Password Login ────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      window.location.href = "/dashboard";
    } catch (err) {
      const msg = {
        "auth/invalid-credential":   "Email hoặc mật khẩu không đúng.",
        "auth/user-not-found":        "Tài khoản không tồn tại.",
        "auth/wrong-password":        "Mật khẩu không đúng.",
        "auth/too-many-requests":     "Quá nhiều lần thử. Vui lòng thử lại sau.",
        "auth/network-request-failed":"Lỗi mạng. Kiểm tra kết nối internet.",
      }[err.code] || "Đăng nhập thất bại. Vui lòng thử lại.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ─── Google Login ──────────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      const result = await loginWithGoogle();
      // Kiểm tra xem tài khoản này có phải là tài khoản mới vừa được tạo qua Google không
      const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;
      
      if (isNewUser) {
        // Nếu là user mới, chuyển hướng sang trang chọn vai trò giống hệt lúc Đăng ký
        window.location.href = "/choose-role";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError(`Đăng nhập Google thất bại: ${err.message}`);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.backgroundDecor}></div>
      <div className={`${styles.formCard} animate-slide-up`}>
        <div className={styles.header}>
          <div className={styles.logoIcon}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h1 className={`${styles.title} font-heading`}>Đăng Nhập</h1>
          <p className={styles.subtitle}>Chào mừng trở lại BiếnTầnPro</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorAlert}>{error}</div>}
          
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              type="email"
              id="email"
              className={styles.input}
              placeholder="nhap@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.labelWrapper}>
              <label htmlFor="password" className={styles.label}>Mật khẩu</label>
              <Link href="#" className={styles.forgotPassword}>Quên mật khẩu?</Link>
            </div>
            <input
              type="password"
              id="password"
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={loading}>
            {loading ? <span className={styles.loadingSpinner}>Đang xử lý...</span> : "Đăng Nhập"}
          </button>
        </form>

        {/* Divider */}
        <div className={styles.divider}>
          <span>hoặc</span>
        </div>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          className={styles.googleBtn}
          disabled={googleLoading}
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.4 35.5 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8L6 33.2C9.5 39.8 16.2 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2C37 38.3 44 32.5 44 24c0-1.3-.1-2.7-.4-3.9z"/>
          </svg>
          {googleLoading ? "Đang kết nối..." : "Đăng nhập với Google"}
        </button>

        <div className={styles.footer}>
          <p>Chưa có tài khoản? <Link href="/register" className={styles.link}>Đăng ký ngay</Link></p>
        </div>
      </div>
    </div>
  );
}

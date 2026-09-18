"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../login/page.module.css";
import { useAuth } from "../context/AuthContext";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

// Captcha generator
const generateCaptcha = () => Math.random().toString(36).substring(2, 7).toUpperCase();

export default function Register() {
  const router = useRouter();
  const { register, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [captchaCode, setCaptchaCode] = useState("");
  const [userCaptcha, setUserCaptcha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => { setCaptchaCode(generateCaptcha()); }, []);

  const refreshCaptcha = (e) => {
    e.preventDefault();
    setCaptchaCode(generateCaptcha());
    setUserCaptcha("");
  };

  const isValidGmail   = (email) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
  const isValidVNPhone = (phone) => /^(03|05|07|08|09)\d{8}$/.test(phone);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isValidGmail(email))   { setError("Email phải là địa chỉ @gmail.com hợp lệ."); return; }
    if (!isValidVNPhone(phone)) { setError("Số điện thoại không hợp lệ (03/05/07/08/09 + 8 chữ số)."); return; }
    if (password.length < 6)    { setError("Mật khẩu phải có ít nhất 6 ký tự."); return; }
    if (password !== confirmPassword) { setError("Mật khẩu xác nhận không khớp."); return; }
    if (userCaptcha.toUpperCase() !== captchaCode) { setError("Mã captcha không đúng."); return; }

    setLoading(true);
    try {
      await register({ email, password, phone, role: "buyer" });
      alert("Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản.");
      router.push("/choose-role");
    } catch (err) {
      const msg = {
        "auth/email-already-in-use": "Email này đã được đăng ký.",
        "auth/weak-password":        "Mật khẩu quá yếu. Dùng ít nhất 6 ký tự.",
        "auth/invalid-email":        "Địa chỉ email không hợp lệ.",
      }[err.code] || "Đăng ký thất bại. Vui lòng thử lại.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      router.push("/choose-role");
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError("Đăng ký Google thất bại. Vui lòng thử lại.");
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
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          </div>
          <h1 className={`${styles.title} font-heading`}>Đăng Ký</h1>
          <p className={styles.subtitle}>Tạo tài khoản mới tại BiếnTầnPro</p>
        </div>

        {/* Google Quick Register */}
        <button onClick={handleGoogleRegister} className={styles.googleBtn} disabled={googleLoading} style={{ marginBottom: '1.5rem' }}>
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.4 35.5 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8L6 33.2C9.5 39.8 16.2 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2C37 38.3 44 32.5 44 24c0-1.3-.1-2.7-.4-3.9z"/>
          </svg>
          {googleLoading ? "Đang kết nối..." : "Đăng ký nhanh với Google"}
        </button>

        <div className={styles.divider}><span>hoặc đăng ký bằng email</span></div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorAlert}>{error}</div>}
          
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email (@gmail.com)</label>
            <input type="email" id="email" className={styles.input} placeholder="ten.cua.ban@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="phone" className={styles.label}>Số điện thoại</label>
            <input type="tel" id="phone" className={styles.input} placeholder="0912345678" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Mật khẩu</label>
            <input type="password" id="password" className={styles.input} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>Xác nhận Mật khẩu</label>
            <input type="password" id="confirmPassword" className={styles.input} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="captcha" className={styles.label}>Mã xác thực (Captcha)</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ background: 'repeating-linear-gradient(45deg, var(--bg-subtle), var(--bg-subtle) 10px, rgba(14, 165, 233, 0.1) 10px, rgba(14, 165, 233, 0.1) 20px)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontWeight: 'bold', letterSpacing: '5px', userSelect: 'none', flex: 1, textAlign: 'center', border: '1px solid var(--border)', color: 'var(--primary)', fontSize: '1.2rem', fontStyle: 'italic' }}>
                {captchaCode}
              </div>
              <button onClick={refreshCaptcha} className="btn-outline" style={{ padding: '0.5rem 1rem', flexShrink: 0 }} title="Tạo mã mới">🔄</button>
            </div>
            <input type="text" id="captcha" className={styles.input} placeholder="Nhập mã captcha phía trên" value={userCaptcha} onChange={(e) => setUserCaptcha(e.target.value)} required />
          </div>

          <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={loading}>
            {loading ? <span className={styles.loadingSpinner}>Đang xử lý...</span> : "Đăng Ký"}
          </button>
        </form>

        <div className={styles.footer}>
          <p>Đã có tài khoản? <Link href="/login" className={styles.link}>Đăng nhập</Link></p>
        </div>
      </div>
    </div>
  );
}

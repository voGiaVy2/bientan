"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../login/page.module.css";
import { useAuth } from "../context/AuthContext";

// Captcha generator
const generateCaptcha = () => Math.random().toString(36).substring(2, 7).toUpperCase();

export default function Register() {
  const router = useRouter();
  const { register, loginWithGoogle } = useAuth();
  
  const [step, setStep] = useState(1); // 1: Thông tin, 2: Nhập OTP
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [captchaCode, setCaptchaCode] = useState("");
  const [userCaptcha, setUserCaptcha] = useState("");
  
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [emailExists, setEmailExists] = useState(false);
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

  // Bước 1: Gửi yêu cầu lấy OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError("");

    if (!isValidGmail(email))   { setError("Email phải là địa chỉ @gmail.com hợp lệ."); return; }
    if (!isValidVNPhone(phone)) { setError("Số điện thoại không hợp lệ (03/05/07/08/09 + 8 chữ số)."); return; }
    if (password.length < 6)    { setError("Mật khẩu phải có ít nhất 6 ký tự."); return; }
    if (password !== confirmPassword) { setError("Mật khẩu xác nhận không khớp."); return; }
    if (userCaptcha.toUpperCase() !== captchaCode) { setError("Mã captcha không đúng."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone, password }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Lỗi khi gửi OTP.");
      }
      
      alert(data.message || "Đã gửi mã OTP 6 số đến email của bạn! (Kiểm tra cả hộp thư Rác/Spam)");
      setStep(2); // Chuyển sang màn hình nhập OTP
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Xác thực OTP và Đăng ký vào Firebase
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    
    if (otpCode.length !== 6) {
      setError("Mã OTP phải bao gồm 6 chữ số.");
      return;
    }

    setLoading(true);
    try {
      // Xác minh OTP với server
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Mã OTP không hợp lệ.");
      }

      // Đăng ký tài khoản trên Firebase
      await register({ email, password, phone, role: "buyer" });
      
      alert("Đăng ký thành công!");
      router.push("/choose-role");
    } catch (err) {
      // Xử lý lỗi Firebase
      if (err.code === "auth/email-already-in-use") {
        setEmailExists(true);
        setError("Email này đã được đăng ký rồi. Vui lòng đăng nhập thay vì tạo tài khoản mới.");
      } else {
        setError(err.message || "Đăng ký thất bại. Vui lòng thử lại.");
      }
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
        // Hiện lỗi chi tiết từ Firebase để người dùng tự xem tại sao lỗi Google Sign-In
        setError(`Lỗi Google: ${err.message}`);
        console.error("Google Auth Error:", err);
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

        {step === 1 && (
          <>
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

            <form onSubmit={handleRequestOTP} className={styles.form}>
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
                  <button onClick={refreshCaptcha} className="btn-outline" style={{ padding: '0.5rem', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Tạo mã mới">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
                    </svg>
                  </button>
                </div>
                <input type="text" id="captcha" className={styles.input} placeholder="Nhập mã captcha phía trên" value={userCaptcha} onChange={(e) => setUserCaptcha(e.target.value)} required />
              </div>

              <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={loading}>
                {loading ? <span className={styles.loadingSpinner}>Đang xử lý...</span> : "Tiếp tục"}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className={styles.form}>
            {emailExists ? (
              <div className={styles.errorAlert} style={{ textAlign: 'center' }}>
                <strong>⚠️ Email này đã có tài khoản!</strong><br />
                <span style={{ fontSize: '0.9rem' }}>Email <strong>{email}</strong> đã được đăng ký trước đó rồi.</span><br />
                <Link href={`/login?email=${encodeURIComponent(email)}`} className={styles.link} style={{ display: 'inline-block', marginTop: '0.5rem', fontWeight: 700 }}>
                  → Đi đăng nhập ngay
                </Link>
              </div>
            ) : error ? (
              <div className={styles.errorAlert}>{error}</div>
            ) : null}
            <div className={styles.inputGroup}>
              <p style={{ marginBottom: "1rem", color: "var(--text-main)", lineHeight: 1.5 }}>
                Mã xác nhận 6 số đã được gửi tới email <strong>{email}</strong>.
                Vui lòng kiểm tra hộp thư đến (và mục thư Rác/Spam) để lấy mã.
              </p>
              <label htmlFor="otp" className={styles.label}>Nhập mã OTP</label>
              <input
                type="text"
                id="otp"
                className={styles.input}
                placeholder="Ví dụ: 123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                maxLength={6}
                required
                style={{ fontSize: "1.2rem", letterSpacing: "2px", textAlign: "center" }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="btn-outline" onClick={() => setStep(1)} disabled={loading} style={{ flex: 1 }}>
                Quay lại
              </button>
              <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={loading} style={{ flex: 2, marginTop: 0 }}>
                {loading ? <span className={styles.loadingSpinner}>Xác thực...</span> : "Hoàn tất đăng ký"}
              </button>
            </div>
          </form>
        )}

        <div className={styles.footer}>
          <p>Đã có tài khoản? <Link href="/login" className={styles.link}>Đăng nhập</Link></p>
        </div>
      </div>
    </div>
  );
}

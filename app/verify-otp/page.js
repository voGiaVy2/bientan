"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "../login/page.module.css";

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      router.push("/register");
    }
  }, [email, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (otp.length !== 6) {
      setError("Mã OTP phải bao gồm 6 chữ số.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Xác thực thành công! Đang chuyển hướng...");
        
        // Finalize registration
        const tempReg = localStorage.getItem('temp_register');
        if (tempReg) {
          const user = JSON.parse(tempReg);
          // Add to registered users
          const existing = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
          existing.push(user);
          localStorage.setItem('registeredUsers', JSON.stringify(existing));
          
          // Login the user automatically
          localStorage.setItem('currentUser', JSON.stringify({ email: user.email }));
          localStorage.removeItem('temp_register');
          
          // Trigger storage event so Header updates
          window.dispatchEvent(new Event("storage"));
        }

        setTimeout(() => {
          // Force a full page reload so Header picks up the new local storage state cleanly
          // Redirect to role selection page
          window.location.href = "/choose-role";
        }, 1500);
      } else {
        setError(data.message || "Mã OTP không hợp lệ.");
        setLoading(false);
      }
    } catch (err) {
      setError("Không thể kết nối đến máy chủ.");
      setLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>Xác Thực OTP</h1>
          <p className={styles.subtitle}>
            Chúng tôi đã gửi mã xác nhận đến email<br/>
            <strong>{email}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorAlert}>{error}</div>}
          {success && <div className={styles.errorAlert} style={{backgroundColor: '#dcfce7', color: '#166534', borderColor: '#86efac'}}>{success}</div>}
          
          <div className={styles.inputGroup}>
            <label htmlFor="otp" className={styles.label}>Nhập mã OTP (6 chữ số)</label>
            <input
              type="text"
              id="otp"
              className={styles.input}
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              style={{ textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.25rem', fontWeight: 'bold' }}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "1rem" }} disabled={loading}>
            {loading ? "Đang xác thực..." : "Xác Thực"}
          </button>
        </form>

        <div className={styles.footer}>
          <p>Không nhận được mã? <button className={styles.link} style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit'}}>Gửi lại mã</button></p>
          <p style={{marginTop: '0.5rem'}}><Link href="/register" className={styles.link}>Quay lại</Link></p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOTP() {
  return (
    <Suspense fallback={<div className={styles.container}>Đang tải...</div>}>
      <VerifyOTPContent />
    </Suspense>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { useAuth } from "../context/AuthContext";

export default function ChooseRolePage() {
  const router = useRouter();
  const { currentUser, authLoading, updateRole } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/login");
    }
  }, [authLoading, currentUser, router]);

  const handleSelectRole = async (role) => {
    if (!currentUser) return;
    setLoading(true);
    try {
      await updateRole(role);
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      if (err.message === "TIMEOUT_FIREBASE") {
        alert("Kết nối Firestore thất bại hoặc bị treo. Vui lòng kiểm tra lại cấu hình Database trong Firebase.");
      } else {
        alert("Có lỗi xảy ra: " + (err.message || "Vui lòng thử lại."));
      }
      setLoading(false);
    }
  };


  return (
    <div className={styles.container}>
      <div className={styles.backgroundDecor}></div>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className="h2 font-heading">Chào mừng bạn đến với BiếnTầnPro!</h1>
          <p className="text-lead">
            Để mang lại trải nghiệm tốt nhất, vui lòng cho chúng tôi biết mục đích chính của bạn khi tham gia nền tảng.
          </p>
        </div>

        <div className={styles.rolesContainer}>
          {/* Buyer Role Card */}
          <div 
            className={`${styles.roleCard} animate-slide-up`} 
            onClick={() => handleSelectRole('buyer')}
            style={loading ? { pointerEvents: 'none', opacity: 0.7 } : {}}
          >
            <div className={styles.iconWrapper}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </div>
            <h3 className={styles.roleTitle}>Tôi là Người Mua</h3>
            <p className={styles.roleDesc}>
              Tôi muốn tìm kiếm, so sánh và mua các thiết bị biến tần chính hãng với giá tốt nhất.
            </p>
          </div>

          {/* Seller Role Card */}
          <div 
            className={`${styles.roleCard} ${styles.sellerCard} animate-slide-up`} 
            style={{ animationDelay: '0.1s', ...(loading ? { pointerEvents: 'none', opacity: 0.7 } : {}) }}
            onClick={() => handleSelectRole('seller')}
          >
            <div className={styles.iconWrapper}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <h3 className={styles.roleTitle}>Tôi là Người Bán</h3>
            <p className={styles.roleDesc}>
              Tôi có thiết bị biến tần (mới hoặc cũ) và muốn đăng tin bán để tiếp cận khách hàng.
            </p>
          </div>
        </div>

        {loading && (
          <div className={styles.loadingState}>
            Đang lưu lựa chọn của bạn...
          </div>
        )}
      </div>
    </div>
  );
}

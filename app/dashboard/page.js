"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import {
  collection, query, where, orderBy, onSnapshot, doc, deleteDoc, updateDoc, serverTimestamp
} from "firebase/firestore";

function AdminPanel({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    // Cập nhật thời gian hiện tại mỗi phút để tính online chính xác
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleChangeRole = async (userId, newRole) => {
    if (!confirm(`Xác nhận đổi vai trò thành ${newRole}?`)) return;
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
    } catch (err) {
      alert("Lỗi khi cập nhật vai trò!");
      console.error(err);
    }
  };

  const onlineUsersCount = users.filter(u => {
    if (!u.lastSeen) return false;
    return now - u.lastSeen.toMillis() < 180000;
  }).length;

  return (
    <section className={styles.contentSection}>
      <h2 className={styles.sectionTitle}>Bảng Điều Khiển Quản Trị Viên</h2>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Tổng người dùng</span>
          <span className={styles.statValue}>{users.length}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Đang Online (3 phút)</span>
          <span className={styles.statValue} style={{ color: "#10b981" }}>{onlineUsersCount}</span>
        </div>
      </div>

      <div className={styles.tableResponsive} style={{ marginTop: "2rem" }}>
        {loading ? (
          <p>Đang tải danh sách người dùng...</p>
        ) : (
          <table className={styles.adminUsersTable}>
            <thead>
              <tr>
                <th>Tên Hiển Thị</th>
                <th>Email</th>
                <th>Điện Thoại</th>
                <th>Trạng Thái</th>
                <th>Vai Trò</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isOnline = u.lastSeen && (now - u.lastSeen.toMillis() < 180000);
                return (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 500 }}>{u.displayName || "Chưa có tên"}</td>
                    <td style={{ color: "var(--text-muted)" }}>{u.email}</td>
                    <td>{u.phone || "---"}</td>
                    <td>
                      {isOnline ? (
                        <span className={styles.statusOnline}>Online</span>
                      ) : (
                        <span className={styles.statusOffline}>Offline</span>
                      )}
                    </td>
                    <td>
                      <select 
                        value={u.role || "buyer"} 
                        onChange={(e) => handleChangeRole(u.id, e.target.value)}
                        className={styles.roleSelect}
                        disabled={u.id === currentUser.uid}
                      >
                        <option value="buyer">Người mua</option>
                        <option value="seller">Người bán</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const { currentUser, userProfile, authLoading, logout } = useAuth();
  const [myProducts, setMyProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // ─── Edit Profile State ───────────────────────────────────────────────────
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ displayName: "", phone: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  // ─── Bảo vệ route ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/login");
    }
  }, [authLoading, currentUser, router]);

  // ─── Init profile form khi userProfile load xong ─────────────────────────
  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        displayName: userProfile.displayName || "",
        phone: userProfile.phone || "",
      });
      // Nếu có query param tab=admin thì mở tab Admin
      const params = new URLSearchParams(window.location.search);
      if (params.get("tab") === "admin" && userProfile.role === "admin") {
        setActiveTab("adminPanel");
      }
    }
  }, [userProfile]);

  // ─── Load sản phẩm của user từ Firestore (realtime) ───────────────────────
  useEffect(() => {
    if (!currentUser) return;

    setLoadingProducts(true);
    const q = query(
      collection(db, "products"),
      where("sellerId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setMyProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingProducts(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) return;
    try {
      await deleteDoc(doc(db, "products", productId));
    } catch (err) {
      console.error("Lỗi xóa sản phẩm:", err);
      alert("Không thể xóa sản phẩm. Vui lòng thử lại.");
    }
  };

  // ─── Cập nhật thông tin cá nhân ──────────────────────────────────────────
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    setSavingProfile(true);
    setProfileMsg("");
    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        displayName: profileForm.displayName.trim(),
        phone: profileForm.phone.trim(),
        updatedAt: serverTimestamp(),
      });
      setProfileMsg("✅ Cập nhật thành công!");
      setIsEditingProfile(false);
      // Refresh lại trang sau 1s
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err) {
      console.error("Lỗi cập nhật profile:", err);
      setProfileMsg("❌ Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setSavingProfile(false);
    }
  };

  if (authLoading) {
    return <div className={styles.loadingContainer}>Đang tải dữ liệu...</div>;
  }

  if (!currentUser) return null;

  const displayName = userProfile?.displayName || currentUser.email?.split("@")[0] || "Người dùng";

  return (
    <div className={styles.dashboardContainer}>
      <div className="container">
        <div className={styles.dashboardHeader}>
          <h1 className="h2 font-heading">Quản Lý Tài Khoản</h1>
          <p className="text-muted">Quản lý thông tin cá nhân và sản phẩm của bạn.</p>
        </div>

        <div className={styles.dashboardGrid}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.userInfoCard}>
              <div className={styles.avatar}>
                {currentUser.photoURL
                  ? <img src={currentUser.photoURL} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                  : displayName.charAt(0).toUpperCase()
                }
              </div>
              <div className={styles.userDetails}>
                <h3 className={styles.userName}>{displayName}</h3>
                <p className={styles.userEmail}>{currentUser.email}</p>
                {userProfile?.role && (
                  <span className={`${styles.roleBadge} ${
                    userProfile.role === "admin" ? styles.adminBadge :
                    userProfile.role === "seller" ? styles.sellerBadge : styles.buyerBadge
                  }`}>
                    {userProfile.role === "admin" ? "Quản Trị Viên" : userProfile.role === "seller" ? "Người Bán" : "Người Mua"}
                  </span>
                )}
              </div>
            </div>

            <nav className={styles.sidebarNav}>
              <button
                className={`${styles.navItem} ${activeTab === "overview" ? styles.active : ""}`}
                onClick={() => setActiveTab("overview")}
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M9 21V9"/>
                </svg>
                Thông tin chung
              </button>
              <button
                className={`${styles.navItem} ${activeTab === "editProfile" ? styles.active : ""}`}
                onClick={() => setActiveTab("editProfile")}
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                </svg>
                Cập nhật hồ sơ
              </button>
              {userProfile?.role === "seller" && (
                <button
                  className={`${styles.navItem} ${activeTab === "myProducts" ? styles.active : ""}`}
                  onClick={() => setActiveTab("myProducts")}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line>
                  </svg>
                  Sản phẩm đã đăng ({myProducts.length})
                </button>
              )}
              {userProfile?.role === "seller" && (
                <button className={styles.navItem} onClick={() => router.push("/post-product")} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/>
                  </svg>
                  Đăng sản phẩm mới
                </button>
              )}
              {userProfile?.role === "admin" && (
                <button
                  className={`${styles.navItem} ${activeTab === "adminPanel" ? styles.active : ""}`}
                  onClick={() => setActiveTab("adminPanel")}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  Quản trị viên
                </button>
              )}
              <button className={styles.navItem} onClick={() => router.push("/choose-role")} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"/>
                </svg>
                Đổi vai trò
              </button>
              <button onClick={handleLogout} className={`${styles.navItem} ${styles.navLogout}`} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
                </svg>
                Đăng xuất
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className={styles.mainContent}>

            {/* ─── Overview Tab ─────────────────────────── */}
            {activeTab === "overview" && (
              <>
                <section className={styles.contentSection}>
                  <h2 className={styles.sectionTitle}>Tổng Quan</h2>
                  <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                      <span className={styles.statLabel}>Sản Phẩm Đã Đăng</span>
                      <span className={styles.statValue}>{myProducts.length}</span>
                    </div>
                    {userProfile?.role === "seller" && (
                      <>
                        <div className={styles.statCard}>
                          <span className={styles.statLabel}>Đánh Giá (Uy Tín)</span>
                          <span className={styles.statValue} style={{ color: "#f59e0b" }}>5.0 ★</span>
                        </div>
                        <div className={styles.statCard}>
                          <span className={styles.statLabel}>Tỉ Lệ Phản Hồi</span>
                          <span className={styles.statValue} style={{ color: "#10b981" }}>100%</span>
                        </div>
                      </>
                    )}
                  </div>
                </section>

                <section className={styles.contentSection}>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Thông Tin Tài Khoản</h2>
                    <button
                      className="btn-outline"
                      style={{ fontSize: "0.875rem", padding: "0.5rem 1rem" }}
                      onClick={() => setActiveTab("editProfile")}
                    >
                      Chỉnh sửa
                    </button>
                  </div>
                  <div className={styles.accountInfoGrid}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Tên hiển thị</span>
                      <span className={styles.infoValue}>{displayName}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Email</span>
                      <span className={styles.infoValue}>{currentUser.email}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>SĐT</span>
                      <span className={styles.infoValue}>{userProfile?.phone || "Chưa cập nhật"}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Vai trò</span>
                      <span className={styles.infoValue}>
                        {userProfile?.role === "admin" ? "Quản Trị Viên" : userProfile?.role === "seller" ? "Người Bán" : "Người Mua"}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Xác thực email</span>
                      <span className={styles.infoValue} style={{ color: currentUser.emailVerified ? "#10b981" : "#ef4444" }}>
                        {currentUser.emailVerified ? "✓ Đã xác thực" : "✗ Chưa xác thực"}
                      </span>
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* ─── Edit Profile Tab ──────────────────────── */}
            {activeTab === "editProfile" && (
              <section className={styles.contentSection}>
                <h2 className={styles.sectionTitle}>Cập Nhật Hồ Sơ</h2>
                {profileMsg && (
                  <div className={styles.profileMsg}>{profileMsg}</div>
                )}
                <form onSubmit={handleSaveProfile} className={styles.profileForm}>
                  <div className={styles.profileFormGroup}>
                    <label htmlFor="displayName">Tên hiển thị</label>
                    <input
                      type="text"
                      id="displayName"
                      placeholder="VD: Nguyễn Văn A"
                      value={profileForm.displayName}
                      onChange={(e) => setProfileForm(f => ({ ...f, displayName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className={styles.profileFormGroup}>
                    <label htmlFor="phone">Số điện thoại / Zalo</label>
                    <input
                      type="text"
                      id="phone"
                      placeholder="VD: 0901234567"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                    />
                  </div>
                  <div className={styles.profileFormGroup}>
                    <label>Email</label>
                    <input type="email" value={currentUser.email} disabled style={{ opacity: 0.6 }} />
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Email không thể thay đổi.</span>
                  </div>
                  <div className={styles.profileActions}>
                    <button type="button" className="btn-outline" onClick={() => setActiveTab("overview")}>Hủy</button>
                    <button type="submit" className="btn-primary" disabled={savingProfile}>
                      {savingProfile ? "Đang lưu..." : "Lưu Thay Đổi"}
                    </button>
                  </div>
                </form>
              </section>
            )}

            {/* ─── My Products Tab ───────────────────────── */}
            {activeTab === "myProducts" && (
              <section className={styles.contentSection}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Sản Phẩm Của Tôi</h2>
                  <Link href="/post-product" className="btn-primary" style={{ fontSize: "0.875rem", padding: "0.5rem 1rem" }}>
                    + Đăng thêm
                  </Link>
                </div>

                <div className={styles.tableResponsive}>
                  {loadingProducts ? (
                    <p>Đang tải sản phẩm...</p>
                  ) : myProducts.length === 0 ? (
                    <div className={styles.emptyState}>
                      <p>Bạn chưa đăng sản phẩm nào.</p>
                      <Link href="/post-product" className={`btn-primary ${styles.shopNowBtn}`}>
                        Đăng sản phẩm ngay
                      </Link>
                    </div>
                  ) : (
                    <table className={styles.ordersTable}>
                      <thead>
                        <tr>
                          <th>Hình Ảnh</th>
                          <th>Tên Sản Phẩm</th>
                          <th>Giá Bán</th>
                          <th>Ngày Đăng</th>
                          <th>Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myProducts.map((product) => {
                          const date = product.createdAt?.toDate?.();
                          const dateStr = date ? date.toLocaleDateString("vi-VN") : "Vừa xong";
                          return (
                            <tr key={product.id}>
                              <td>
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "4px" }}
                                />
                              </td>
                              <td className={styles.orderId}>
                                <Link href={`/products/${product.id}`}>{product.name}</Link>
                              </td>
                              <td className={styles.orderTotal}>{product.price}</td>
                              <td>{dateStr}</td>
                              <td>
                                <div style={{ display: "flex", gap: "10px" }}>
                                  <button
                                    onClick={() => router.push(`/edit-product/${product.id}`)}
                                    className="btn-outline"
                                    style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                                  >
                                    Sửa
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(product.id)}
                                    style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", backgroundColor: "#fee2e2", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: "var(--radius-md)", cursor: "pointer" }}
                                  >
                                    Xóa
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </section>
            )}

            {/* ─── Admin Panel Tab ───────────────────────── */}
            {activeTab === "adminPanel" && userProfile?.role === "admin" && (
              <AdminPanel currentUser={currentUser} />
            )}

          </main>
        </div>
      </div>
    </div>
  );
}

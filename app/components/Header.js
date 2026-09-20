"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import styles from "./Header.module.css";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import CartSidebar from "./CartSidebar";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cartCount, setIsCartOpen } = useCart();
  const { currentUser, userProfile, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Đóng mobile menu khi navigate
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/products");
    }
    setMobileMenuOpen(false);
  };

  const displayName =
    userProfile?.displayName ||
    currentUser?.displayName ||
    currentUser?.email?.split("@")[0] ||
    "Tài khoản";

  const navLinks = [
    { href: "/", label: "Trang Chủ" },
    { href: "/products", label: "Mua Bán Thiết Bị" },
    { href: "/requests", label: "Cộng Đồng Thợ" },
    { href: "/documents", label: "Tài Liệu Kỹ Thuật" },
  ];

  if (userProfile?.role === "admin") {
    navLinks.push({ href: "/dashboard?tab=admin", label: "Quản Trị Viên" });
  }

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
        <div className={`container ${styles.headerInner}`}>
          {/* Logo */}
          <div className={styles.logo}>
            <Link href="/" className={styles.logoLink}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.logoIcon}>
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-heading">BiếnTần<span className={styles.logoHighlight}>Pro</span></span>
            </Link>
          </div>

          {/* Search bar */}
          <form className={styles.searchForm} onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Tìm kiếm biến tần, linh kiện..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className={styles.searchBtn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </form>

          {/* Desktop Actions */}
          <div className={styles.actions}>
            <Link href="/post-product" className={styles.postBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span className={styles.postBtnText}>Đăng tin</span>
            </Link>
            <div className={styles.divider}></div>

            {currentUser ? (
              <div className={styles.userProfile}>
                <Link href="/dashboard" className={styles.dashboardLink}>
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt={displayName} style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }} />
                  ) : (
                    <span className={styles.avatarInitial}>{String(displayName).charAt(0).toUpperCase()}</span>
                  )}
                  <strong>{displayName}</strong>
                </Link>
                <button onClick={handleLogout} className={styles.logoutBtn}>Đăng xuất</button>
              </div>
            ) : (
              <Link href="/login" className={styles.loginLink}>Đăng nhập</Link>
            )}

            <div className={styles.divider}></div>
            <button className={styles.cartBtn} aria-label="Yêu thích" onClick={() => setIsCartOpen(true)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
              {cartCount > 0 && <span className={styles.cartCount}>{cartCount}</span>}
            </button>

            {/* Hamburger Button — mobile only */}
            <button
              className={styles.hamburger}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Desktop Sub-navigation */}
        <div className={styles.subheader}>
          <div className="container">
            <nav className={styles.nav}>
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${styles.navLink} ${pathname === link.href ? styles.navLinkActive : ""}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className={styles.mobileMenu}>
            <nav className={styles.mobileNav}>
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${styles.mobileNavLink} ${pathname === link.href ? styles.mobileNavLinkActive : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className={styles.mobileDivider}></div>
              {currentUser ? (
                <>
                  <Link href="/dashboard" className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
                    👤 {displayName}
                  </Link>
                  <button className={`${styles.mobileNavLink} ${styles.mobileLogout}`} onClick={handleLogout}>
                    🚪 Đăng xuất
                  </button>
                </>
              ) : (
                <Link href="/login" className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
                  🔑 Đăng nhập
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>
      <CartSidebar />
    </>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import { useState, useEffect } from "react";
import { useCart } from "./context/CartContext";
import { db } from "./lib/firebase";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";

const categories = [
  { id: 1, name: "Biến tần 1 Pha", icon: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg> },
  { id: 2, name: "Biến tần 3 Pha", icon: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11m16-11v11M8 14v3m4-3v3m4-3v3" /></svg> },
  { id: 3, name: "Biến tần Solar", icon: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
  { id: 4, name: "Linh kiện (Tụ, IGBT,...)", icon: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> }
];

export default function Home() {
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  
  // ─── Query 4 sản phẩm mới nhất từ Firestore ─────────────────────────────
  useEffect(() => {
    const q = query(
      collection(db, "products"),
      where("status", "==", "active"),
      orderBy("createdAt", "desc"),
      limit(4)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setFeaturedProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingProducts(false);
    }, () => setLoadingProducts(false));

    return () => unsubscribe();
  }, []);

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      {/* Empty Hero - Replaced by Top Bar / Banner if needed, or just start with Categories */}
      <div style={{ padding: '1rem 0', backgroundColor: '#fff', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>Gợi ý nhanh:</span>
          <Link href="/products?q=yaskawa" style={{ color: 'var(--secondary)', whiteSpace: 'nowrap' }}>#Biến tần Yaskawa</Link>
          <Link href="/products?q=igbt" style={{ color: 'var(--secondary)', whiteSpace: 'nowrap' }}>#IGBT tháo máy</Link>
          <Link href="/products?q=hmi" style={{ color: 'var(--secondary)', whiteSpace: 'nowrap' }}>#Màn hình HMI</Link>
          <Link href="/products?q=plc" style={{ color: 'var(--secondary)', whiteSpace: 'nowrap' }}>#PLC cũ</Link>
        </div>
      </div>

      {/* Categories Section */}
      <section className={styles.categoriesSection}>
        <div className="container">
          <div className={`${styles.sectionHeader} animate-slide-up`}>
            <h2 className="h2 font-heading">Danh Mục Sản Phẩm</h2>
            <p className="text-muted">Tìm kiếm biến tần phù hợp với nhu cầu của bạn</p>
          </div>
          <div className={styles.categoryGrid}>
            {categories.map((cat, index) => (
              <div key={cat.id} className={`${styles.categoryCard} animate-slide-up`} style={{animationDelay: `${0.1 * index}s`}}>
                <span className={styles.categoryIcon}>{cat.icon}</span>
                <h3 className={styles.categoryName}>{cat.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section id="products" className={styles.productsSection}>
        <div className="container">
          <div className={`${styles.sectionHeader} animate-slide-up`}>
            <h2 className="h2 font-heading">Tin Đăng Mới Nhất</h2>
            <p className="text-muted">Các sản phẩm vừa được cộng đồng đăng bán</p>
          </div>
          <div className={styles.productGrid}>
            {featuredProducts.map((product, index) => (
              <div key={product.id} className={`${styles.productCard} animate-slide-up`} style={{animationDelay: `${0.1 * index}s`}}>
                <div className={styles.productImageWrapper}>
                  {product.condition && (
                    <div className={styles.conditionBadge} data-condition={product.condition === 'Mới 100%' ? 'new' : product.condition === 'Cũ - Hoạt động tốt' ? 'used' : 'broken'}>
                      {product.condition}
                    </div>
                  )}
                  <Link href={`/products/${product.id}`}>
                    <img src={product.image} alt={product.name} className={styles.productImage} />
                  </Link>
                  <div className={styles.productOverlay}>
                    <button 
                      className={styles.quickAddBtn}
                      onClick={() => addToCart(product)}
                    >
                      Thêm vào giỏ
                    </button>
                  </div>
                </div>
                <div className={styles.productInfo}>
                  <Link href={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
                    <h3 className={styles.productName}>{product.name}</h3>
                  </Link>
                  <div className={styles.productMeta}>
                    <span className={styles.productPrice}>{product.price}</span>
                  </div>
                  <div className={styles.productFooter}>
                    <span className={styles.productLocation}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      {product.sellerAddress ? product.sellerAddress.split(',')[0] : 'Toàn quốc'}
                    </span>
                    <span className={styles.productTime}>
                      {product.id > 1000000 ? 'Vừa xong' : '1 ngày trước'}
                    </span>
                  </div>
                  <div className={styles.sellerMiniInfo}>
                    <div className={styles.sellerAvatar}>
                      {product.sellerEmail ? product.sellerEmail.charAt(0).toUpperCase() : 'B'}
                    </div>
                    <span className={styles.sellerName}>
                      {product.sellerEmail ? product.sellerEmail.split('@')[0] : 'BiếnTầnPro'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link href="/products" className="btn-outline">Xem Tất Cả Sản Phẩm</Link>
          </div>
        </div>
      </section>

    </div>
  );
}

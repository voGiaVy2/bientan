"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import styles from './page.module.css';
import { productCategories } from '../data/products';
import { useCart } from '../context/CartContext';
import { db } from '../lib/firebase';
import {
  collection, query, orderBy, onSnapshot,
  where, limit, startAfter, getDocs
} from 'firebase/firestore';

const PAGE_SIZE = 12;

function ProductsContent() {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q') || '';

  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [sortOrder, setSortOrder] = useState("newest");
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  // Sync URL search param → search box
  useEffect(() => { setSearchQuery(urlQuery); }, [urlQuery]);

  // ─── Realtime query từ Firestore ────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    // Remove where("status", "==", "active") to avoid Firebase Composite Index requirement
    let q = query(
      collection(db, "products"),
      orderBy("createdAt", "desc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const activeDocs = docs.filter(doc => doc.status === 'active');
      setAllProducts(activeDocs);
      setLoading(false);
    }, (err) => {
      console.error("Firestore error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ─── Filter & Sort (client-side) ────────────────────────────────────────
  let filtered = allProducts.filter(product => {
    const matchCat = activeCategory === "Tất cả" || product.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q
      || product.name.toLowerCase().includes(q)
      || (product.brand && product.brand.toLowerCase().includes(q))
      || (product.model && product.model.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  if (sortOrder === "price-asc") {
    filtered = [...filtered].sort((a, b) => (a.priceNumber || 0) - (b.priceNumber || 0));
  } else if (sortOrder === "price-desc") {
    filtered = [...filtered].sort((a, b) => (b.priceNumber || 0) - (a.priceNumber || 0));
  }
  // "newest" đã được orderBy createdAt desc từ Firestore

  const formatTime = (ts) => {
    if (!ts) return 'Vừa xong';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    const diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 60)   return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${Math.floor(diff / 86400)} ngày trước`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className="h1 font-heading">Sản Phẩm Công Nghiệp</h1>
        <p className="text-lead">Khám phá các dòng biến tần chất lượng cao, đáp ứng mọi nhu cầu điều khiển.</p>
      </div>

      <div className={styles.content}>
        {/* Sidebar Filters */}
        <aside className={styles.sidebar}>
          <div className={styles.filterGroup}>
            <h3 className={styles.filterTitle}>Tìm kiếm</h3>
            <input
              type="text"
              placeholder="Tên, hãng, model..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <h3 className={styles.filterTitle}>Danh mục</h3>
            <div className={styles.categoryList}>
              {productCategories.map(category => (
                <div
                  key={category}
                  className={`${styles.categoryItem} ${activeCategory === category ? styles.active : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Product Grid */}
        <main className={styles.mainArea}>
          <div className={styles.resultsBar}>
            <div className={styles.resultsCount}>
              {loading ? 'Đang tải...' : <>Hiển thị <strong>{filtered.length}</strong> sản phẩm</>}
            </div>
            <div className={styles.sortSelectWrapper}>
              <select className={styles.sortSelect} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá: Thấp đến Cao</option>
                <option value="price-desc">Giá: Cao xuống Thấp</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className={styles.loadingGrid}>
              {[...Array(12)].map((_, i) => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={styles.skeletonImage}></div>
                  <div className={styles.skeletonLine}></div>
                  <div className={styles.skeletonLineShort}></div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.productGrid}>
              {filtered.length > 0 ? (
                filtered.map(product => (
                  <div key={product.id} className={styles.productCard}>
                    <div className={styles.imageWrapper}>
                      {product.condition && (
                        <div className={styles.conditionBadge} data-condition={
                          product.condition === 'Mới 100%' ? 'new'
                          : product.condition === 'Cũ - Hoạt động tốt' ? 'used'
                          : 'broken'
                        }>
                          {product.condition}
                        </div>
                      )}
                      <Link href={`/products/${product.id}`}>
                        <img src={product.image} alt={product.name} className={styles.productImage} />
                      </Link>
                    </div>

                    <div className={styles.productInfo}>
                      <Link href={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <h3 className={styles.productName}>{product.name}</h3>
                      </Link>

                      <div className={styles.specs}>
                        {product.power   && <div className={styles.specItem}><span>⚡</span> {product.power}</div>}
                        {product.voltage && <div className={styles.specItem}><span>🔌</span> {product.voltage}</div>}
                      </div>

                      <div className={styles.priceWrapper}>
                        <span className={styles.price}>{product.price}</span>
                        {product.isNegotiable && <span className={styles.negotiable}>Thương lượng</span>}
                      </div>

                      <div className={styles.productFooter}>
                        <span className={styles.productLocation}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                          {product.sellerAddress ? product.sellerAddress.split(',')[0] : 'Toàn quốc'}
                        </span>
                        <span className={styles.productTime}>{formatTime(product.createdAt)}</span>
                      </div>

                      <div className={styles.sellerMiniInfo}>
                        <div className={styles.sellerAvatar}>
                          {product.sellerName ? product.sellerName.charAt(0).toUpperCase() : 'B'}
                        </div>
                        <span className={styles.sellerName}>
                          {product.sellerName || 'BiếnTầnPro'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>🔍</div>
                  <h3>Không tìm thấy sản phẩm nào!</h3>
                  <p>Vui lòng thử lại với từ khóa hoặc danh mục khác.</p>
                  <Link href="/post-product" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
                    Đăng sản phẩm đầu tiên
                  </Link>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải trang...</div>}>
      <ProductsContent />
    </Suspense>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Phone, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import styles from "./page.module.css";

export default function ProductDetail({ params }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        // Thử lấy từ Firestore trước (document ID là chuỗi Firestore)
        const docRef = doc(db, "products", params.id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setProduct({ id: snap.id, ...snap.data() });
        } else {
          // Không tìm thấy → về trang danh sách
          router.push('/products');
        }
      } catch (err) {
        console.error("Lỗi fetch sản phẩm:", err);
        router.push('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className={styles.productPage}>
        <div className="container">
          <div className={styles.loadingContainer}>
            <div className={styles.skeletonMain}>
              <div className={styles.skeletonImage}></div>
              <div className={styles.skeletonDetails}>
                <div className={styles.skeletonLine} style={{ height: 32, width: '80%' }}></div>
                <div className={styles.skeletonLine} style={{ height: 24, width: '40%' }}></div>
                <div className={styles.skeletonLine} style={{ height: 100 }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const formatTime = (ts) => {
    if (!ts) return 'Vừa xong';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    const diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 3600)  return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${Math.floor(diff / 86400)} ngày trước`;
  };

  const handleZaloContact = () => {
    if (product.contactPhone) {
      window.open(`https://zalo.me/${product.contactPhone.replace(/^0/, '84')}`, '_blank');
    }
  };

  const handleCall = () => {
    if (product.contactPhone) {
      window.location.href = `tel:${product.contactPhone}`;
    }
  };

  return (
    <div className={styles.productPage}>
      <div className="container">
        
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link href="/">Trang chủ</Link>
          <span className={styles.separator}>/</span>
          <Link href="/products">Sản phẩm</Link>
          <span className={styles.separator}>/</span>
          <span className={styles.currentPath}>{product.name}</span>
        </div>

        <div className={styles.productMain}>
          {/* Product Image */}
          <div className={styles.imageGallery}>
            <div className={styles.mainImageWrapper}>
              {product.condition && (
                <div className={styles.conditionBadgeDetail} data-condition={
                  product.condition === 'Mới 100%' ? 'new'
                  : product.condition === 'Cũ - Hoạt động tốt' ? 'used'
                  : 'broken'
                }>
                  {product.condition}
                </div>
              )}
              <img src={product.image} alt={product.name} className={styles.mainImage} />
            </div>
            <div className={styles.postedTime}>
              🕐 Đăng {formatTime(product.createdAt)}
            </div>
          </div>

          {/* Product Info */}
          <div className={styles.productDetails}>
            {product.category && (
              <div className={styles.categoryInfo}>{product.category}</div>
            )}
            <h1 className={`${styles.productTitle} font-heading`}>{product.name}</h1>

            <div className={styles.pricing}>
              <span className={styles.currentPrice}>{product.price}</span>
              {product.isNegotiable && (
                <span className={styles.negotiableBadge}>Có thể thương lượng</span>
              )}
            </div>

            {product.description && (
              <p className={styles.description}>{product.description}</p>
            )}

            {product.sellerAddress && (
              <div className={styles.locationRow}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span>{product.sellerAddress}</span>
              </div>
            )}

            {/* Thông số kỹ thuật */}
            <div className={styles.specsList}>
              {product.brand     && <div className={styles.specItem}><span className={styles.specLabel}>Hãng SX:</span><span className={styles.specValue}>{product.brand}</span></div>}
              {product.model     && <div className={styles.specItem}><span className={styles.specLabel}>Model:</span><span className={styles.specValue}>{product.model}</span></div>}
              {product.condition && <div className={styles.specItem}><span className={styles.specLabel}>Tình trạng:</span><span className={styles.specValue}>{product.condition}</span></div>}
              {product.power     && <div className={styles.specItem}><span className={styles.specLabel}>Công suất:</span><span className={styles.specValue}>{product.power}</span></div>}
              {product.voltage   && <div className={styles.specItem}><span className={styles.specLabel}>Điện áp:</span><span className={styles.specValue}>{product.voltage}</span></div>}
            </div>

            {/* Seller Widget */}
            <div className={styles.sellerProfileWidget}>
              <div className={styles.sellerWidgetHeader}>
                <div className={styles.sellerWidgetAvatar}>
                  {product.sellerName ? String(product.sellerName).charAt(0).toUpperCase() : 'B'}
                </div>
                <div className={styles.sellerWidgetInfo}>
                  <div className={styles.sellerWidgetName}>
                    {product.sellerName || product.sellerEmail?.split('@')[0] || 'Người bán'}
                    <span className={styles.verifiedBadge}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      Đã xác thực
                    </span>
                  </div>
                  <div className={styles.sellerWidgetMeta}>
                    {product.sellerEmail} • Đang hoạt động
                  </div>
                </div>
              </div>
              <div className={styles.sellerWidgetStats}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>5.0 ★</span>
                  <span className={styles.statLabel}>Đánh giá</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>100%</span>
                  <span className={styles.statLabel}>Phản hồi</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.actions} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              {product.contactPhone && (
                <>
                  <button
                    className={`btn-primary ${styles.contactBtn}`}
                    style={{ backgroundColor: '#0068ff', borderColor: '#0068ff', padding: '0.875rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    onClick={handleZaloContact}
                  >
                    <MessageCircle size={20} /> Chat Zalo
                  </button>
                  <button
                    className={`btn-primary ${styles.contactBtn}`}
                    style={{ backgroundColor: '#10b981', borderColor: '#10b981', padding: '0.875rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    onClick={handleCall}
                  >
                    <Phone size={20} /> Gọi {product.contactPhone}
                  </button>
                </>
              )}
              <button
                className={`btn-outline ${styles.addToCartBtn}`}
                onClick={() => addToCart(product)}
                style={{ gridColumn: '1 / -1', padding: '0.875rem' }}
              >
                Thêm vào yêu thích
              </button>
            </div>
          </div>
        </div>

        {/* Mô tả chi tiết */}
        <div className={styles.productTabs}>
          <div className={styles.tabHeader}>
            <button className={`${styles.tabBtn} ${styles.active}`}>Mô tả sản phẩm</button>
          </div>
          <div className={styles.tabContent}>
            {product.description
              ? <p style={{ whiteSpace: 'pre-line' }}>{product.description}</p>
              : <p>Người bán chưa cung cấp mô tả chi tiết.</p>
            }
          </div>
        </div>

      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import styles from "./page.module.css";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    note: "",
    paymentMethod: "cod"
  });

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      router.push("/login?redirect=/checkout");
      return;
    }
    setUser(JSON.parse(currentUser));

    if (cartItems.length === 0) {
      router.push("/products");
      return;
    }
    setLoading(false);
  }, [router, cartItems.length]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create new order
      const newOrder = {
        id: `ORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`,
        userEmail: user.email,
        date: new Date().toLocaleDateString('vi-VN'),
        status: "Đang xử lý",
        total: `${cartTotal.toLocaleString('vi-VN')} đ`,
        items: cartItems.reduce((acc, item) => acc + item.quantity, 0),
        cartItems: [...cartItems],
        shippingInfo: { ...formData }
      };

      // Save to localStorage
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      existingOrders.unshift(newOrder);
      localStorage.setItem('orders', JSON.stringify(existingOrders));

      // Clear cart
      clearCart();

      // Wait a bit to simulate processing
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);

    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng:", error);
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className={styles.loadingContainer}>Đang tải...</div>;
  }

  return (
    <div className={styles.checkoutContainer}>
      <div className="container">
        <h1 className={`h2 font-heading ${styles.pageTitle}`}>Thanh Toán</h1>

        <div className={styles.checkoutGrid}>
          {/* Form Checkout */}
          <div className={styles.formSection}>
            <form onSubmit={handleSubmit} className={styles.form}>
              <h2 className={styles.sectionTitle}>Thông tin giao hàng</h2>
              
              <div className={styles.formGroup}>
                <label htmlFor="fullName">Họ và tên *</label>
                <input 
                  type="text" 
                  id="fullName" 
                  name="fullName" 
                  required 
                  value={formData.fullName} 
                  onChange={handleInputChange} 
                  placeholder="Nhập họ tên người nhận"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="phone">Số điện thoại *</label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone" 
                  required 
                  value={formData.phone} 
                  onChange={handleInputChange} 
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="address">Địa chỉ nhận hàng *</label>
                <textarea 
                  id="address" 
                  name="address" 
                  required 
                  rows="3"
                  value={formData.address} 
                  onChange={handleInputChange} 
                  placeholder="Nhập địa chỉ giao hàng chi tiết"
                ></textarea>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="note">Ghi chú (Tùy chọn)</label>
                <textarea 
                  id="note" 
                  name="note" 
                  rows="2"
                  value={formData.note} 
                  onChange={handleInputChange} 
                  placeholder="Ví dụ: Giao hàng giờ hành chính..."
                ></textarea>
              </div>

              <h2 className={styles.sectionTitle} style={{marginTop: '2rem'}}>Phương thức thanh toán</h2>
              
              <div className={styles.paymentMethods}>
                <label className={styles.radioLabel}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="cod" 
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleInputChange}
                  />
                  <span>Thanh toán khi nhận hàng (COD)</span>
                </label>
                
                <label className={styles.radioLabel}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="bank" 
                    checked={formData.paymentMethod === 'bank'}
                    onChange={handleInputChange}
                  />
                  <span>Chuyển khoản ngân hàng</span>
                </label>
              </div>

              <button 
                type="submit" 
                className={`btn-primary ${styles.submitBtn}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang xử lý...' : 'Hoàn tất đặt hàng'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className={styles.summarySection}>
            <div className={styles.summaryCard}>
              <h2 className={styles.sectionTitle}>Đơn hàng của bạn</h2>
              
              <ul className={styles.itemList}>
                {cartItems.map(item => (
                  <li key={item.id} className={styles.item}>
                    <img src={item.image} alt={item.name} className={styles.itemImg} />
                    <div className={styles.itemDetails}>
                      <span className={styles.itemName}>{item.name}</span>
                      <span className={styles.itemQty}>SL: {item.quantity}</span>
                    </div>
                    <span className={styles.itemPrice}>{item.price}</span>
                  </li>
                ))}
              </ul>

              <div className={styles.priceRow}>
                <span>Tạm tính</span>
                <span>{cartTotal.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className={styles.priceRow}>
                <span>Phí vận chuyển</span>
                <span>Miễn phí</span>
              </div>
              <div className={`${styles.priceRow} ${styles.totalRow}`}>
                <span>Tổng cộng</span>
                <span className={styles.totalPrice}>{cartTotal.toLocaleString('vi-VN')} đ</span>
              </div>
              
              <Link href="/products" className={styles.backLink}>
                ← Quay lại mua thêm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

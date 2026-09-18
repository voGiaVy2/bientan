"use client";

import { useCart } from '../context/CartContext';
import styles from './CartSidebar.module.css';
import { useRouter } from 'next/navigation';

export default function CartSidebar() {
  const router = useRouter();
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={() => setIsCartOpen(false)} />
      <div className={`${styles.sidebar} ${isCartOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <h2 className="h3 font-heading">Giỏ hàng của bạn</h2>
          <button className={styles.closeBtn} onClick={() => setIsCartOpen(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={styles.content}>
          {cartItems.length === 0 ? (
            <div className={styles.emptyState}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <p>Giỏ hàng đang trống</p>
            </div>
          ) : (
            <ul className={styles.itemList}>
              {cartItems.map((item) => (
                <li key={item.id} className={styles.item}>
                  <img src={item.image} alt={item.name} className={styles.itemImage} />
                  <div className={styles.itemInfo}>
                    <h4 className={styles.itemName}>{item.name}</h4>
                    <p className={styles.itemPrice}>{item.price}</p>
                    <div className={styles.quantityControls}>
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                  <button className={styles.removeBtn} onClick={() => removeFromCart(item.id)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.totalRow}>
            <span>Tổng cộng:</span>
            <span className={styles.totalPrice}>{cartTotal.toLocaleString('vi-VN')} đ</span>
          </div>
          <button 
            className={`btn-primary ${styles.checkoutBtn}`} 
            disabled={cartItems.length === 0}
            onClick={() => {
              setIsCartOpen(false);
              router.push("/checkout");
            }}
          >
            Thanh Toán
          </button>
        </div>
      </div>
    </>
  );
}

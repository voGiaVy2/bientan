"use client";

import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerInner}`}>
        {/* Brand / About */}
        <div className={styles.column}>
          <h3 className={styles.title}>
            BiếnTần<span className={styles.highlight}>Pro</span>
          </h3>
          <p className={styles.desc}>
            Cộng đồng mua bán, trao đổi biến tần và linh kiện tự động hoá lớn nhất dành cho anh em kỹ thuật.
          </p>
          <div className={styles.socials}>
            <Link href="#" className={styles.socialIcon} aria-label="Facebook">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path></svg>
            </Link>
            <Link href="#" className={styles.socialIcon} aria-label="YouTube">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
            </Link>
          </div>
        </div>

        {/* Khám phá */}
        <div className={styles.column}>
          <h4 className={styles.subtitle}>Khám Phá</h4>
          <ul className={styles.list}>
            <li><Link href="/products">Tất cả tin đăng</Link></li>
            <li><Link href="/products?q=bien+tan+1+pha">Biến tần 1 Pha</Link></li>
            <li><Link href="/products?q=bien+tan+3+pha">Biến tần 3 Pha</Link></li>
            <li><Link href="/products?q=linh+kien">Linh kiện / Bo mạch</Link></li>
            <li><Link href="/requests">Cộng đồng</Link></li>
          </ul>
        </div>

        {/* Hỗ Trợ */}
        <div className={styles.column}>
          <h4 className={styles.subtitle}>Hỗ Trợ</h4>
          <ul className={styles.list}>
            <li><Link href="#">Quy định đăng tin</Link></li>
            <li><Link href="#">Hướng dẫn mua bán an toàn</Link></li>
            <li><Link href="#">Trung tâm trợ giúp</Link></li>
            <li><Link href="#">Câu hỏi thường gặp</Link></li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={`container ${styles.bottomInner}`}>
          <p>&copy; {new Date().getFullYear()} BiếnTầnPro. Nền tảng mua bán cộng đồng.</p>
          <div className={styles.legalLinks}>
            <Link href="#">Điều khoản sử dụng</Link>
            <Link href="#">Chính sách bảo mật</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

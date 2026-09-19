/** @type {import('next').NextConfig} */

const securityHeaders = [
  // Chặn trang web bị nhúng vào iframe (Clickjacking)
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Ngăn trình duyệt đoán kiểu MIME (MIME-sniffing)
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Kiểm soát thông tin referrer khi chuyển trang
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Tắt các API nguy hiểm không cần dùng
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  // Bắt buộc dùng HTTPS (HSTS) - khi deploy production
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // Content Security Policy - cho phép Firebase + XSS protection
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Next.js cần unsafe-eval, Firebase Auth cần unsafe-inline
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://*.firebaseapp.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      // Cho phép ảnh từ Firebase Storage và các nguồn phổ biến
      "img-src 'self' data: blob: https: https://firebasestorage.googleapis.com https://lh3.googleusercontent.com",
      // Firebase Firestore, Auth, Storage APIs
      "connect-src 'self' https://api.imgbb.com https://*.googleapis.com https://*.firebaseio.com https://*.cloudfunctions.net wss://*.firebaseio.com https://firebasestorage.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com",
      // Google Sign-In popup
      "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com",
      "frame-ancestors 'self'",
      "form-action 'self'",
      "base-uri 'self'",
    ].join('; '),
  },
];

const nextConfig = {
  // Tự động thêm security headers cho mọi trang
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },

  // Tắt header X-Powered-By để ẩn framework
  poweredByHeader: false,

  // Bật strict mode React để phát hiện lỗi tiềm ẩn
  reactStrictMode: true,

  // Giới hạn kích thước ảnh upload (phòng tấn công DoS)
  images: {
    remotePatterns: [],
    dangerouslyAllowSVG: false,
  },
};

export default nextConfig;

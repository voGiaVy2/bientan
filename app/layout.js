import { Inter, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";

const inter = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-inter" });
const headingFont = Be_Vietnam_Pro({ subsets: ["latin", "vietnamese"], weight: ['400', '500', '600', '700', '800'], variable: "--font-heading" });

export const metadata = {
  title: "BiếnTầnPro | Chợ Mua Bán Biến Tần Cộng Đồng",
  description: "Mua bán, trao đổi biến tần công nghiệp, linh kiện tự động hoá từ người dùng dành cho người dùng.",
  robots: {
    index: true,
    follow: true,
    noindex: false,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className={`${inter.variable} ${headingFont.variable} ${inter.className}`}>
        <AuthProvider>
          <CartProvider>
            <Header />
            <main>{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

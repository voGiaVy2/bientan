"use client";

import { useState } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Link from "next/link";

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const generateProducts = async () => {
    setLoading(true);
    setProgress(0);
    const colRef = collection(db, "products");

    const categories = ["Biến tần 1 Pha", "Biến tần 3 Pha", "Biến tần Solar", "Linh kiện (Tụ, IGBT,...)"];
    const brands = ["Yaskawa", "INVT", "Siemens", "Delta", "Mitsubishi", "LS", "Fuji"];
    const models = ["V1000", "A1000", "GD200A", "G120", "FR-D700", "IG5A", "FRENIC"];

    for (let i = 1; i <= 100; i++) {
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const model = models[Math.floor(Math.random() * models.length)];
      const priceNumber = Math.floor(Math.random() * 90 + 10) * 100000; // 1tr - 10tr

      const product = {
        name: `Sản phẩm thử nghiệm ${i} - ${brand} ${model}`,
        brand: brand,
        model: model,
        condition: i % 3 === 0 ? "Mới 100%" : "Cũ - Hoạt động tốt",
        category: category,
        price: `${priceNumber.toLocaleString('vi-VN')} đ`,
        priceNumber: priceNumber,
        isNegotiable: i % 2 === 0,
        power: `${(Math.random() * 10 + 1).toFixed(1)} kW`,
        voltage: i % 2 === 0 ? "3 Pha 380V" : "1 Pha 220V",
        image: "/images/hero.jpg", // Dùng ảnh mặc định để tiết kiệm băng thông
        description: `Đây là mô tả tự động cho sản phẩm thử nghiệm số ${i}. Sản phẩm này được tạo ra để test tốc độ tải trang và tìm kiếm.`,
        sellerAddress: "Quận 1, TP. Hồ Chí Minh",
        contactPhone: "0901234567",
        sellerId: "test-admin-id",
        sellerEmail: "admin@bientanpro.com",
        sellerName: "Admin Test",
        rating: 5.0,
        reviews: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active',
      };

      try {
        await addDoc(colRef, product);
        setProgress(i);
      } catch (err) {
        console.error("Lỗi khi tạo SP:", err);
      }
    }
    setLoading(false);
    alert("Đã tạo xong 100 sản phẩm giả!");
  };

  return (
    <div style={{ padding: "4rem", maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
      <h1>Công Cụ Test Luồng Nghiệp Vụ</h1>
      <p style={{ margin: "2rem 0", color: "#666" }}>
        Nút này sẽ tự động đẩy 100 sản phẩm giả (dummy data) vào cơ sở dữ liệu Firebase của bạn. 
        Mục đích là để kiểm tra tốc độ tải, phân trang (nếu có), và tốc độ tìm kiếm.
      </p>
      
      <button 
        onClick={generateProducts} 
        disabled={loading}
        style={{
          padding: "12px 24px",
          backgroundColor: "#ff5722",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1
        }}
      >
        {loading ? `Đang tạo... (${progress}/100)` : "Bấm để tạo 100 Sản Phẩm"}
      </button>

      {progress === 100 && (
        <div style={{ marginTop: "2rem" }}>
          <Link href="/products" style={{ color: "#0ea5e9", textDecoration: "underline" }}>
            Vào trang Sản Phẩm để kiểm tra
          </Link>
        </div>
      )}
    </div>
  );
}

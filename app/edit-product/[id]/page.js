"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import Link from "next/link";
import { productCategories } from "../../data/products";
import { useAuth } from "../../context/AuthContext";
import { db, storage } from "../../lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const provinces = [
  "TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Bình Dương", "Đồng Nai",
  "Hải Phòng", "Cần Thơ", "Bắc Ninh", "Khác"
];

export default function EditProductPage({ params }) {
  const router = useRouter();
  const { currentUser, userProfile, authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState("");
  const [originalProduct, setOriginalProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    model: "",
    condition: "Cũ - Hoạt động tốt",
    category: productCategories[1] || productCategories[0],
    price: "",
    power: "",
    voltage: "",
    description: "",
    sellerAddress: "TP. Hồ Chí Minh",
    sellerDistrict: "",
    contactPhone: "",
    isNegotiable: false,
  });

  // ─── Bảo vệ route ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/login?redirect=/dashboard");
    }
  }, [authLoading, currentUser, router]);

  // ─── Load sản phẩm từ Firestore ──────────────────────────────────────────
  useEffect(() => {
    if (authLoading || !currentUser) return;

    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", params.id);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("TIMEOUT_FIREBASE")), 15000)
        );
        const snap = await Promise.race([getDoc(docRef), timeoutPromise]);

        if (!snap.exists()) {
          alert("Sản phẩm không tồn tại!");
          router.push("/dashboard");
          return;
        }

        const product = { id: snap.id, ...snap.data() };

        // Kiểm tra quyền sở hữu
        if (product.sellerId !== currentUser.uid) {
          alert("Bạn không có quyền chỉnh sửa sản phẩm này!");
          router.push("/dashboard");
          return;
        }

        setOriginalProduct(product);

        // Tách sellerAddress nếu có quận/huyện
        const addressParts = typeof product.sellerAddress === 'string' ? product.sellerAddress.split(", ") : [];
        const district = addressParts.length > 1 ? addressParts[0] : "";
        const province = addressParts.length > 1 ? addressParts[1] : (addressParts[0] || "TP. Hồ Chí Minh");

        setFormData({
          name: product.name || "",
          brand: product.brand || "",
          model: product.model || "",
          condition: product.condition || "Cũ - Hoạt động tốt",
          category: product.category || productCategories[1],
          price: product.priceNumber?.toString() || String(product.price || "").replace(/[^\d]/g, "") || "",
          power: product.power || "",
          voltage: product.voltage || "",
          description: product.description || "",
          sellerAddress: provinces.includes(province) ? province : "Khác",
          sellerDistrict: district,
          contactPhone: product.contactPhone || "",
          isNegotiable: product.isNegotiable || false,
        });

        setImagePreview(product.image || null);
      } catch (err) {
        console.error("Lỗi load sản phẩm:", err);
        alert("Không thể tải thông tin sản phẩm. Vui lòng thử lại.");
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id, currentUser, authLoading, router]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser || !originalProduct) return;
    setIsSubmitting(true);

    try {
      let imageUrl = originalProduct.image;

      // ── Upload ảnh mới nếu có ────────────────────────────────────────────
      if (imageFile) {
        setUploadProgress("Đang tải ảnh lên...");
        const storageRef = ref(storage, `products/${currentUser.uid}/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
        setUploadProgress("Ảnh đã tải lên!");
      }

      // ── Cập nhật Firestore ───────────────────────────────────────────────
      setUploadProgress("Đang cập nhật tin đăng...");
      const priceNumber = parseInt(formData.price) || 0;
      const priceFormatted = `${priceNumber.toLocaleString("vi-VN")} đ`;

      const updatedData = {
        name: formData.name,
        brand: formData.brand,
        model: formData.model,
        condition: formData.condition,
        category: formData.category,
        price: priceFormatted,
        priceNumber,
        isNegotiable: formData.isNegotiable,
        power: formData.power,
        voltage: formData.voltage,
        image: imageUrl,
        description: formData.description,
        sellerAddress: formData.sellerDistrict
          ? `${formData.sellerDistrict}, ${formData.sellerAddress}`
          : formData.sellerAddress,
        contactPhone: formData.contactPhone,
        updatedAt: new Date(),
      };

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("TIMEOUT_FIREBASE")), 4000)
      );

      try {
        await Promise.race([
          updateDoc(doc(db, "products", params.id), updatedData),
          timeoutPromise
        ]);
        alert("Cập nhật sản phẩm thành công!");
      } catch (err) {
        if (err.message === "TIMEOUT_FIREBASE") {
          console.log("Offline write successful");
        } else {
          throw err;
        }
      }

      router.push(`/products/${params.id}`);
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
      setUploadProgress("");
    }
  };

  if (authLoading || loading) {
    return <div className={styles.loadingContainer}>Đang tải...</div>;
  }

  if (!currentUser) return null;

  return (
    <div className={styles.pageContainer}>
      <div className="container">
        <div className={styles.formWrapper}>
          <div className={styles.headerInfo}>
            <h1 className="h2 font-heading">Chỉnh Sửa Sản Phẩm</h1>
            <p className="text-muted">Cập nhật thông tin chi tiết cho sản phẩm của bạn.</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Tên sản phẩm *</label>
              <input type="text" id="name" name="name" required value={formData.name} onChange={handleInputChange} placeholder="VD: Biến tần Yaskawa A1000 7.5kW" />
            </div>

            <div className={styles.rowGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="brand">Hãng sản xuất *</label>
                <input type="text" id="brand" name="brand" required value={formData.brand} onChange={handleInputChange} placeholder="VD: INVT, Yaskawa, Siemens..." />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="model">Model / Mã SP *</label>
                <input type="text" id="model" name="model" required value={formData.model} onChange={handleInputChange} placeholder="VD: GD200A, V1000..." />
              </div>
            </div>

            <div className={styles.rowGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="category">Danh mục *</label>
                <select id="category" name="category" required value={formData.category} onChange={handleInputChange}>
                  {productCategories.filter(c => c !== "Tất cả").map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="condition">Tình trạng máy *</label>
                <select id="condition" name="condition" required value={formData.condition} onChange={handleInputChange}>
                  <option value="Mới 100%">Mới 100%</option>
                  <option value="Cũ - Hoạt động tốt">Cũ - Hoạt động tốt</option>
                  <option value="Xác máy / Hỏng (Lấy linh kiện)">Xác máy / Hỏng (Lấy linh kiện)</option>
                </select>
              </div>
            </div>

            <div className={styles.rowGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="price">Giá bán (VNĐ) *</label>
                <input type="number" id="price" name="price" required value={formData.price} onChange={handleInputChange} placeholder="VD: 5500000" />
                <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <input type="checkbox" id="isNegotiable" name="isNegotiable" checked={formData.isNegotiable} onChange={handleInputChange} style={{ width: "auto" }} />
                  <label htmlFor="isNegotiable" style={{ fontSize: "0.875rem", fontWeight: "normal", margin: 0, cursor: "pointer" }}>Có thể thương lượng giá</label>
                </div>
              </div>
            </div>

            <div className={styles.rowGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="power">Công suất *</label>
                <input type="text" id="power" name="power" required value={formData.power} onChange={handleInputChange} placeholder="VD: 7.5kW / 10HP" />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="voltage">Điện áp *</label>
                <input type="text" id="voltage" name="voltage" required value={formData.voltage} onChange={handleInputChange} placeholder="VD: 3 Pha 380V" />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="image">Đổi hình ảnh (để trống nếu không muốn thay ảnh)</label>
              <input type="file" id="image" name="image" accept="image/*" onChange={handleImageChange} />
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
              )}
            </div>

            <div className={styles.rowGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="sellerAddress">Tỉnh / Thành phố *</label>
                <select id="sellerAddress" name="sellerAddress" required value={formData.sellerAddress} onChange={handleInputChange}>
                  {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="sellerDistrict">Quận / Huyện / Địa chỉ cụ thể</label>
                <input type="text" id="sellerDistrict" name="sellerDistrict" value={formData.sellerDistrict} onChange={handleInputChange} placeholder="VD: Quận 7, hoặc 123 Đường ABC..." />
              </div>
            </div>

            <div className={styles.rowGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="contactPhone">SĐT / Zalo liên hệ *</label>
                <input type="text" id="contactPhone" name="contactPhone" required value={formData.contactPhone} onChange={handleInputChange} placeholder="VD: 0901234567" />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Mô tả chi tiết *</label>
              <textarea id="description" name="description" required rows="5" value={formData.description} onChange={handleInputChange} placeholder="Mô tả tình trạng máy, thời gian bảo hành (nếu có),..."></textarea>
            </div>

            {uploadProgress && (
              <div style={{ padding: "0.75rem 1rem", background: "rgba(14,165,233,0.1)", borderRadius: "var(--radius-md)", color: "var(--primary)", fontSize: "0.9rem" }}>
                ⏳ {uploadProgress}
              </div>
            )}

            <div className={styles.actions}>
              <Link href="/dashboard" className="btn-outline">Hủy bỏ</Link>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? "Đang cập nhật..." : "Lưu Thay Đổi"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

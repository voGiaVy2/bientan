"use client";

import React, { useState } from "react";
import styles from "./page.module.css";

const documentData = [
  // Yaskawa
  {
    id: 1,
    title: "Yaskawa A1000 Technical Manual (TOEP C710606 01D)",
    brand: "Yaskawa",
    type: "Technical Manual",
    size: "18.4 MB",
    date: "2023",
    url: "https://www.yaskawa.com/downloads/search?q=A1000+technical+manual",
  },
  {
    id: 2,
    title: "Yaskawa V1000 Quick Start Guide",
    brand: "Yaskawa",
    type: "Quick Start Guide",
    size: "3.2 MB",
    date: "2022",
    url: "https://www.yaskawa.com/downloads/search?q=V1000+quick+start",
  },
  {
    id: 3,
    title: "Yaskawa E7 Drive Technical Manual",
    brand: "Yaskawa",
    type: "Technical Manual",
    size: "12.1 MB",
    date: "2021",
    url: "https://www.yaskawa.com/downloads/search?q=E7+technical",
  },
  // INVT
  {
    id: 4,
    title: "INVT GD200A Series VFD User Manual",
    brand: "INVT",
    type: "User Manual",
    size: "6.8 MB",
    date: "2024",
    url: "https://www.invt.com/download.html",
  },
  {
    id: 5,
    title: "INVT CHF100A Series Inverter Manual",
    brand: "INVT",
    type: "User Manual",
    size: "4.5 MB",
    date: "2023",
    url: "https://www.invt.com/download.html",
  },
  // Danfoss
  {
    id: 6,
    title: "VLT® COMPACT STARTER MCD 202 Operating Instructions",
    brand: "Danfoss",
    type: "Operating Instructions",
    size: "2.1 MB",
    date: "02/2020",
    url: "https://drives.danfoss.com/downloads/",
  },
  {
    id: 7,
    title: "Danfoss FC302 Programming Guide (VLT AutomationDrive)",
    brand: "Danfoss",
    type: "Programming Guide",
    size: "8.9 MB",
    date: "2023",
    url: "https://drives.danfoss.com/downloads/",
  },
  // Schneider Electric
  {
    id: 8,
    title: "Altivar 212 Variable Speed Drives Programming Manual",
    brand: "Schneider Electric",
    type: "Programming Manual",
    size: "5.4 MB",
    date: "06/2025",
    url: "https://www.se.com/ww/en/download/",
  },
  {
    id: 9,
    title: "Altivar 320 Variable Speed Drives — Installation Manual",
    brand: "Schneider Electric",
    type: "Installation Manual",
    size: "7.2 MB",
    date: "2024",
    url: "https://www.se.com/ww/en/download/",
  },
  // Siemens
  {
    id: 10,
    title: "SINAMICS G120 Control Unit CU240E-2 Operating Instructions",
    brand: "Siemens",
    type: "Operating Instructions",
    size: "15.3 MB",
    date: "2023",
    url: "https://support.industry.siemens.com/cs/ww/en/view/",
  },
  {
    id: 11,
    title: "SINAMICS G120C Getting Started Guide",
    brand: "Siemens",
    type: "Quick Start Guide",
    size: "4.1 MB",
    date: "2022",
    url: "https://support.industry.siemens.com/cs/ww/en/view/",
  },
  // Mitsubishi
  {
    id: 12,
    title: "Mitsubishi FR-E700 Inverter Instruction Manual",
    brand: "Mitsubishi",
    type: "Instruction Manual",
    size: "9.7 MB",
    date: "2022",
    url: "https://dl.mitsubishielectric.com/dl/fa/",
  },
  {
    id: 13,
    title: "Mitsubishi FR-D700 Series Parameter Manual",
    brand: "Mitsubishi",
    type: "Programming Guide",
    size: "6.4 MB",
    date: "2023",
    url: "https://dl.mitsubishielectric.com/dl/fa/",
  },
  // Delta
  {
    id: 14,
    title: "Delta VFD-M Series User Manual",
    brand: "Delta",
    type: "User Manual",
    size: "5.8 MB",
    date: "2022",
    url: "https://www.deltaww.com/en-US/products/AC-Motor-Drives/",
  },
  {
    id: 15,
    title: "Delta VFD-E Series Compact Drive Manual",
    brand: "Delta",
    type: "User Manual",
    size: "4.3 MB",
    date: "2023",
    url: "https://www.deltaww.com/en-US/products/AC-Motor-Drives/",
  },
  // Emerson / Control Techniques
  {
    id: 16,
    title: "Unidrive M200 User Guide (Control Techniques)",
    brand: "Emerson",
    type: "User Manual",
    size: "7.6 MB",
    date: "2023",
    url: "https://www.controltechniques.com/products/ac-drives/",
  },
  // Fonis.vn Documents (Vacon)
  {
    id: 17,
    title: "Vacon 100 X Installation Manual",
    brand: "Vacon",
    type: "Installation Manual",
    size: "Unknown",
    date: "2024",
    url: "https://fonis.vn/upload/file/vacon-100-x-installation-manual-5947-attach0.pdf",
  },
  {
    id: 18,
    title: "Vacon 100 Industrial Application Manual",
    brand: "Vacon",
    type: "Application Manual",
    size: "Unknown",
    date: "2024",
    url: "https://fonis.vn/upload/file/vacon-100-industrial-application-manua-8754-attach1.pdf",
  },
  {
    id: 19,
    title: "Vacon 20 Complete Manual",
    brand: "Vacon",
    type: "User Manual",
    size: "Unknown",
    date: "2024",
    url: "https://fonis.vn/upload/file/vacon-20-complete-manual-3983-attach1.pdf",
  },
  {
    id: 20,
    title: "Vacon NXC User Manual",
    brand: "Vacon",
    type: "User Manual",
    size: "Unknown",
    date: "2024",
    url: "https://fonis.vn/upload/file/vacon-nxc-user-manual-7411-attach1.pdf",
  },
  {
    id: 21,
    title: "Vacon NXL User Manual",
    brand: "Vacon",
    type: "User Manual",
    size: "Unknown",
    date: "2024",
    url: "https://fonis.vn/upload/file/vacon-nxl-8611-attach0.pdf",
  },
  {
    id: 22,
    title: "Vacon NXS/NXP User Manual",
    brand: "Vacon",
    type: "User Manual",
    size: "Unknown",
    date: "2024",
    url: "https://fonis.vn/upload/file/vacon-nxs-nxp-user-manual-2692-attach1.pdf",
  },
  {
    id: 23,
    title: "Vacon 10 User Manual",
    brand: "Vacon",
    type: "User Manual",
    size: "Unknown",
    date: "2024",
    url: "https://fonis.vn/upload/file/vacon-10-user-manual-3692-attach1.pdf",
  },
  // Fonis.vn Documents (Danfoss)
  {
    id: 24,
    title: "Danfoss VLT FC102 Instruction Manual",
    brand: "Danfoss",
    type: "Instruction Manual",
    size: "Unknown",
    date: "2024",
    url: "https://fonis.vn/upload/file/danfoss-vlt-fc102-instruction-manual-9608-attach0.pdf",
  },
  {
    id: 25,
    title: "Danfoss VLT FC102 Programming Manual",
    brand: "Danfoss",
    type: "Programming Manual",
    size: "Unknown",
    date: "2024",
    url: "https://fonis.vn/upload/file/danfoss-vlt-fc102-programing-manual-7046-attach1.pdf",
  },
  {
    id: 26,
    title: "Danfoss VLT FC202 Programming Manual",
    brand: "Danfoss",
    type: "Programming Manual",
    size: "Unknown",
    date: "2024",
    url: "https://fonis.vn/upload/file/danfoss-vlt-fc202-programing-manual-5014-attach1.pdf",
  },
  {
    id: 27,
    title: "Danfoss VLT FC360 Programming Manual",
    brand: "Danfoss",
    type: "Programming Manual",
    size: "Unknown",
    date: "2024",
    url: "https://fonis.vn/upload/file/danfoss-vlt-fc360-programing-manual-6013-attach1.pdf",
  },
  {
    id: 28,
    title: "Danfoss VLT FC280 Operating Manual",
    brand: "Danfoss",
    type: "Operating Manual",
    size: "Unknown",
    date: "2024",
    url: "https://fonis.vn/upload/file/danfoss-vlt-fc280-operating-manual-4507-attach1.pdf",
  },
  {
    id: 29,
    title: "Danfoss VLT FC051 Design Manual",
    brand: "Danfoss",
    type: "Design Manual",
    size: "Unknown",
    date: "2024",
    url: "https://fonis.vn/upload/file/danfoss-vlt-fc051-design-manual-8504-attach1.pdf",
  },
  {
    id: 30,
    title: "Danfoss VLT FC051 Programming Manual",
    brand: "Danfoss",
    type: "Programming Manual",
    size: "Unknown",
    date: "2024",
    url: "https://fonis.vn/upload/file/danfoss-vlt-fc051-programing-manual-3360-attach0.pdf",
  },
  // Fonis.vn Documents (Rockwell)
  {
    id: 31,
    title: "PowerFlex 400 User Manual",
    brand: "Rockwell",
    type: "User Manual",
    size: "Unknown",
    date: "2024",
    url: "https://fonis.vn/upload/file/powerlfex-400-user-manual-9238-attach1.pdf",
  },
];

const brands = ["Tất cả", ...Array.from(new Set(documentData.map(d => d.brand))).sort()];
const types = ["Tất cả", ...Array.from(new Set(documentData.map(d => d.type))).sort()];

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeBrand, setActiveBrand] = useState("Tất cả");
  const [activeType, setActiveType] = useState("Tất cả");

  const filteredDocs = documentData.filter(doc => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      doc.title.toLowerCase().includes(q) ||
      doc.brand.toLowerCase().includes(q) ||
      doc.type.toLowerCase().includes(q);
    const matchBrand = activeBrand === "Tất cả" || doc.brand === activeBrand;
    const matchType = activeType === "Tất cả" || doc.type === activeType;
    return matchSearch && matchBrand && matchType;
  });

  const handleDownload = (doc) => {
    // Mở link chính hãng trong tab mới
    window.open(doc.url, "_blank", "noopener,noreferrer");
  };

  const typeIcon = (type) => {
    if (type.includes("Quick Start")) return "🚀";
    if (type.includes("Programming") || type.includes("Parameter")) return "⚙️";
    if (type.includes("Installation")) return "🔧";
    if (type.includes("Operating")) return "📋";
    if (type.includes("Technical")) return "🔬";
    return "📄";
  };

  return (
    <div className={styles.pageContainer}>
      <div className="container">

        <div className={styles.header}>
          <h1 className="h2 font-heading">Tài Liệu Kỹ Thuật</h1>
          <p className="text-muted">
            Tổng hợp Manual, Catalog, Datasheet và Hướng dẫn lập trình các dòng biến tần phổ biến nhất.
          </p>
        </div>

        <div className={styles.searchSection}>
          <div className={styles.searchWrapper}>
            <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Tìm kiếm tên tài liệu, hãng, mã lỗi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className={styles.clearSearch} onClick={() => setSearchQuery("")} title="Xóa tìm kiếm">✕</button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filtersRow}>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Hãng:</span>
            <div className={styles.filterChips}>
              {brands.map(b => (
                <button
                  key={b}
                  className={`${styles.chip} ${activeBrand === b ? styles.chipActive : ""}`}
                  onClick={() => setActiveBrand(b)}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Loại:</span>
            <div className={styles.filterChips}>
              {types.map(t => (
                <button
                  key={t}
                  className={`${styles.chip} ${activeType === t ? styles.chipActive : ""}`}
                  onClick={() => setActiveType(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className={styles.resultsInfo}>
          Tìm thấy <strong>{filteredDocs.length}</strong> tài liệu
        </div>

        <div className={styles.docList}>
          {filteredDocs.length > 0 ? (
            filteredDocs.map(doc => (
              <div key={doc.id} className={`${styles.docCard} animate-slide-up`}>
                <div className={styles.docIcon}>
                  <span className={styles.docEmoji}>{typeIcon(doc.type)}</span>
                </div>
                <div className={styles.docInfo}>
                  <h3 className={styles.docTitle}>{doc.title}</h3>
                  <div className={styles.docMeta}>
                    <span className={styles.docBrand}>{doc.brand}</span>
                    <span className={styles.docType}>{doc.type}</span>
                    <span className={styles.docSize}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      {doc.size}
                    </span>
                    <span className={styles.docDate}>📅 {doc.date}</span>
                  </div>
                </div>
                <button
                  className={`btn-primary ${styles.downloadBtn}`}
                  onClick={() => handleDownload(doc)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Tải Về
                </button>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔍</div>
              <p>Không tìm thấy tài liệu phù hợp.</p>
              <button className="btn-outline" style={{ marginTop: "1rem" }} onClick={() => { setSearchQuery(""); setActiveBrand("Tất cả"); setActiveType("Tất cả"); }}>
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>

        {/* Note */}
        <div className={styles.note}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          Tài liệu được dẫn về trang chính hãng. Nếu link lỗi, hãy tìm trực tiếp trên website của nhà sản xuất.
        </div>

      </div>
    </div>
  );
}

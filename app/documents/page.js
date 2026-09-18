"use client";

import React, { useState } from "react";
import styles from "./page.module.css";

const documentData = [
  {
    id: 1,
    title: "Vacon 10 Complete User Manual",
    brand: "Vacon",
    type: "User Manual",
    size: "2.1 MB",
    date: "2011",
    url: "/documents/vacon-10-user-manual-3692-attach1.pdf",
  },
  {
    id: 2,
    title: "PowerFlex 400 Adjustable Frequency AC Drive",
    brand: "Rockwell Automation",
    type: "User Manual",
    size: "4.5 MB",
    date: "2017",
    url: "/documents/powerlfex-400-user-manual-9238-attach1.pdf",
  },
  {
    id: 3,
    title: "VLT Micro Drive FC 51 Design Guide",
    brand: "Danfoss",
    type: "Design Guide",
    size: "3.8 MB",
    date: "2016",
    url: "/documents/danfoss-vlt-fc051-design-manual-8504-attach1.pdf",
  },
  {
    id: 4,
    title: "Altivar 212 Programming Manual",
    brand: "Schneider Electric",
    type: "Programming Manual",
    size: "5.2 MB",
    date: "2025",
    url: "/documents/ATV212_programming_manual_EN_S1A53838_04.pdf",
  }
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
    // Tải file trực tiếp
    const link = document.createElement("a");
    link.href = doc.url;
    link.download = doc.url.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const typeIcon = (type) => {
    if (type.includes("Programming") || type.includes("Parameter")) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      );
    }
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
    );
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
                    <span className={styles.docDate}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px', verticalAlign: 'text-bottom'}}>
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      {doc.date}
                    </span>
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
              <div className={styles.emptyIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
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

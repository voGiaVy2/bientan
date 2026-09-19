"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { Phone, MessageCircle } from "lucide-react";
import { db } from "../lib/firebase";
import {
  collection, query, orderBy, onSnapshot, addDoc,
  deleteDoc, doc, updateDoc, arrayUnion, serverTimestamp, Timestamp
} from "firebase/firestore";

const formatTime = (ts) => {
  if (!ts) return "Vừa xong";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return "Vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
};

export default function RequestsPage() {
  const router = useRouter();
  const { currentUser, userProfile, authLoading } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newContact, setNewContact] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});
  const [submittingComment, setSubmittingComment] = useState({});

  // ─── Realtime listener từ Firestore ──────────────────────────────────────
  useEffect(() => {
    const q = query(
      collection(db, "communityRequests"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingFeed(false);
    }, (err) => {
      console.error("Lỗi load requests:", err);
      setLoadingFeed(false);
    });

    return () => unsubscribe();
  }, []);

  // ─── Đăng bài ─────────────────────────────────────────────────────────────
  const handlePostRequest = async (e) => {
    e.preventDefault();
    if (!newContent.trim() || !newContact.trim() || !currentUser) return;
    setIsPosting(true);

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("TIMEOUT_FIREBASE")), 15000)
      );

      const addPromise = addDoc(collection(db, "communityRequests"), {
        authorId: currentUser.uid,
        authorEmail: currentUser.email,
        authorName: userProfile?.displayName || currentUser.email.split("@")[0],
        role: userProfile?.role === "seller" ? "Người Bán" : "Người Mua",
        content: newContent.trim(),
        contact: newContact.trim(),
        createdAt: serverTimestamp(),
        comments: [],
      });

      await Promise.race([addPromise, timeoutPromise]);

      setNewContent("");
      setNewContact("");
      setShowForm(false);
    } catch (err) {
      console.error("Lỗi đăng bài:", err);
      if (err.message === "TIMEOUT_FIREBASE") {
        alert("Kết nối đến máy chủ quá lâu (có thể do hết dung lượng hoặc lỗi mạng). Vui lòng thử lại sau.");
      } else {
        alert("Có lỗi khi đăng bài. Vui lòng thử lại.");
      }
    } finally {
      setIsPosting(false);
    }
  };

  // ─── Bình luận ───────────────────────────────────────────────────────────
  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    const commentText = commentInputs[postId]?.trim();
    if (!commentText) return;

    if (!currentUser) {
      alert("Vui lòng đăng nhập để bình luận!");
      router.push("/login?redirect=/requests");
      return;
    }

    setSubmittingComment(prev => ({ ...prev, [postId]: true }));

    try {
      const newComment = {
        id: Date.now(),
        authorId: currentUser.uid,
        author: currentUser.email,
        authorName: userProfile?.displayName || currentUser.email.split("@")[0],
        content: commentText,
        createdAt: Timestamp.now(),
      };

      await updateDoc(doc(db, "communityRequests", postId), {
        comments: arrayUnion(newComment),
      });

      setCommentInputs(prev => ({ ...prev, [postId]: "" }));
    } catch (err) {
      console.error("Lỗi bình luận:", err);
      alert("Không thể gửi bình luận. Vui lòng thử lại.");
    } finally {
      setSubmittingComment(prev => ({ ...prev, [postId]: false }));
    }
  };

  // ─── Xóa bài ─────────────────────────────────────────────────────────────
  const handleDeleteRequest = async (postId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài đăng này?")) return;
    try {
      await deleteDoc(doc(db, "communityRequests", postId));
    } catch (err) {
      console.error("Lỗi xóa bài:", err);
      alert("Không thể xóa bài đăng. Vui lòng thử lại.");
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className="container">

        <div className={styles.header}>
          <h1 className="h2 font-heading">Cộng Đồng Biến Tần</h1>
          <p className="text-muted">Nơi người mua tìm đồ, người bán tìm khách. Đăng bài ngay để kết nối!</p>
        </div>

        <div className={styles.feedWrapper}>

          {/* Create Post Section */}
          <div className={styles.createPostCard}>
            {!authLoading && currentUser ? (
              !showForm ? (
                <div className={styles.createPostPrompt} onClick={() => setShowForm(true)}>
                  <div className={styles.avatar}>
                    {(userProfile?.displayName || currentUser.email).charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.promptText}>Bạn đang cần tìm mua hoặc bán linh kiện gì?</div>
                </div>
              ) : (
                <form onSubmit={handlePostRequest} className={styles.postForm}>
                  <div className={styles.formHeader}>
                    <div className={styles.avatar}>
                      {(userProfile?.displayName || currentUser.email).charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 600 }}>{userProfile?.displayName || currentUser.email.split("@")[0]}</span>
                    <span className={`${styles.roleBadge} ${userProfile?.role === "seller" ? styles.sellerBadge : styles.buyerBadge}`}>
                      {userProfile?.role === "seller" ? "Người Bán" : "Người Mua"}
                    </span>
                  </div>
                  <textarea
                    className={styles.textarea}
                    placeholder="Mô tả chi tiết món hàng bạn cần tìm hoặc linh kiện bạn muốn bán..."
                    rows="4"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    required
                    autoFocus
                  />
                  <input
                    type="text"
                    className={styles.contactInput}
                    placeholder="Số điện thoại / Zalo để liên hệ *"
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    required
                  />
                  <div className={styles.formActions}>
                    <button type="button" className="btn-outline" onClick={() => { setShowForm(false); setNewContent(""); setNewContact(""); }}>Hủy</button>
                    <button type="submit" className="btn-primary" disabled={isPosting}>
                      {isPosting ? "Đang đăng..." : "Đăng Bài"}
                    </button>
                  </div>
                </form>
              )
            ) : !authLoading ? (
              <div className={styles.loginPrompt}>
                <p>Vui lòng đăng nhập để đăng bài tìm kiếm / rao vặt.</p>
                <Link href="/login?redirect=/requests" className="btn-primary">Đăng Nhập Ngay</Link>
              </div>
            ) : null}
          </div>

          {/* Feed Stream */}
          <div className={styles.feedStream}>
            {loadingFeed ? (
              <div className={styles.loadingState}>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={styles.skeletonCard}>
                    <div className={styles.skeletonAvatar}></div>
                    <div className={styles.skeletonLines}>
                      <div className={styles.skeletonLine}></div>
                      <div className={styles.skeletonLineShort}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : requests.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon} style={{ display: 'flex', justifyContent: 'center' }}>
                  <MessageCircle size={48} color="#9ca3af" />
                </div>
                <h3>Chưa có bài đăng nào</h3>
                <p>Hãy là người đầu tiên đăng bài tìm kiếm linh kiện!</p>
              </div>
            ) : (
              requests.map(req => (
                <div key={req.id} className={`${styles.postCard} animate-slide-up`}>
                  <div className={styles.postHeader}>
                    <div className={styles.postAvatar}>
                      {(req.authorName || req.authorEmail || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.postAuthorInfo}>
                      <div className={styles.authorName}>
                        {req.authorName || req.authorEmail?.split("@")[0] || "Ẩn danh"}
                        <span className={`${styles.roleBadge} ${req.role === "Người Bán" ? styles.sellerBadge : styles.buyerBadge}`}>
                          {req.role}
                        </span>
                      </div>
                      <div className={styles.postMeta}>
                        {formatTime(req.createdAt)}
                        {currentUser && currentUser.uid === req.authorId && (
                          <button
                            className={styles.deletePostBtn}
                            onClick={() => handleDeleteRequest(req.id)}
                            title="Xóa bài đăng"
                          >
                            Xóa bài
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={styles.postContent}>{req.content}</div>

                  <div className={styles.postFooter}>
                    <div className={styles.contactInfo} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={18} style={{ color: '#0068ff' }} />
                      <span>Liên hệ: </span>
                      <strong>{req.contact}</strong>
                    </div>
                    <a
                      href={`https://zalo.me/${req.contact?.replace(/^0/, "84")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.contactBtn}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <MessageCircle size={18} /> Nhắn Zalo
                    </a>
                  </div>

                  {/* Comments Section */}
                  <div className={styles.commentsSection}>
                    {req.comments && req.comments.length > 0 && (
                      <div className={styles.commentsList}>
                        {req.comments.map(comment => (
                          <div key={comment.id} className={styles.commentItem}>
                            <div className={styles.commentAvatar}>
                              {(comment.authorName || comment.author || "?").charAt(0).toUpperCase()}
                            </div>
                            <div className={styles.commentBody}>
                              <div className={styles.commentHeader}>
                                <span className={styles.commentAuthor}>
                                  {comment.authorName || comment.author?.split("@")[0]}
                                </span>
                                <span className={styles.commentTime}>
                                  {formatTime(comment.createdAt)}
                                </span>
                              </div>
                              <div className={styles.commentText}>{comment.content}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <form
                      className={styles.commentForm}
                      onSubmit={(e) => handleCommentSubmit(e, req.id)}
                    >
                      <div className={styles.commentAvatarSmall}>
                        {currentUser ? (userProfile?.displayName || currentUser.email).charAt(0).toUpperCase() : "?"}
                      </div>
                      <input
                        type="text"
                        className={styles.commentInput}
                        placeholder={currentUser ? "Viết bình luận..." : "Đăng nhập để bình luận"}
                        value={commentInputs[req.id] || ""}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [req.id]: e.target.value })}
                        disabled={!currentUser}
                      />
                      <button
                        type="submit"
                        className={styles.commentSubmitBtn}
                        disabled={!commentInputs[req.id]?.trim() || submittingComment[req.id] || !currentUser}
                      >
                        {submittingComment[req.id] ? "..." : "Gửi"}
                      </button>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

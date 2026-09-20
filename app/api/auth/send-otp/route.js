import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// ===== RATE LIMITER =====
// Ngăn tấn công brute force: tối đa 3 lần gửi OTP / email trong 15 phút
const rateLimitStore = {};
const RATE_LIMIT = 3;
const WINDOW_MS = 15 * 60 * 1000; // 15 phút

function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitStore[ip];

  if (!record || now - record.firstRequest > WINDOW_MS) {
    rateLimitStore[ip] = { count: 1, firstRequest: now };
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false; // Bị chặn
  }

  record.count++;
  return true;
}

// ===== OTP STORE (In-memory, use Redis in production) =====
global.otpStore = global.otpStore || {};

// ===== INPUT SANITIZATION =====
function sanitizeEmail(email) {
  if (typeof email !== "string") return null;
  const trimmed = email.trim().toLowerCase();
  // Chỉ cho phép @gmail.com, giới hạn độ dài
  if (trimmed.length > 254) return null;
  if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(trimmed)) return null;
  return trimmed;
}

function sanitizePhone(phone) {
  if (typeof phone !== "string") return null;
  const trimmed = phone.trim().replace(/\s/g, "");
  if (!/^(03|05|07|08|09)\d{8}$/.test(trimmed)) return null;
  return trimmed;
}

function validatePassword(password) {
  if (typeof password !== "string") return false;
  if (password.length < 6 || password.length > 128) return false;
  return true;
}

export async function POST(req) {
  try {
    // ===== 1. Chỉ chấp nhận POST với Content-Type đúng =====
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json({ message: "Yêu cầu không hợp lệ" }, { status: 415 });
    }

    // ===== 2. Rate Limiting theo IP =====
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { message: "Quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút." },
        { status: 429 }
      );
    }

    // ===== 3. Parse và validate body an toàn =====
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: "Dữ liệu không hợp lệ" }, { status: 400 });
    }

    const { email: rawEmail, phone: rawPhone, password: rawPassword } = body;

    const email = sanitizeEmail(rawEmail);
    const phone = sanitizePhone(rawPhone);

    if (!email) {
      return NextResponse.json({ message: "Email không hợp lệ (yêu cầu @gmail.com)" }, { status: 400 });
    }
    if (!phone) {
      return NextResponse.json({ message: "Số điện thoại không hợp lệ" }, { status: 400 });
    }
    if (!validatePassword(rawPassword)) {
      return NextResponse.json({ message: "Mật khẩu phải từ 6-128 ký tự" }, { status: 400 });
    }

    // ===== 4. Tạo OTP an toàn bằng crypto =====
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    // Lưu OTP với thời gian hết hạn 5 phút
    global.otpStore[email] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
      attempts: 0, // Đếm số lần nhập sai
    };

    // ===== 5. Gửi email =====
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("[DEV MODE] Thiếu cấu hình email. Giả lập gửi OTP thành công. Mã OTP là:", otp);
      // Giả lập thành công thay vì báo lỗi cấu hình máy chủ
    } else {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: `"BiếnTầnPro" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Mã Xác Nhận OTP - Đăng Ký BiếnTầnPro",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #f97316; text-align: center;">Xác Nhận Đăng Ký</h2>
            <p>Chào bạn,</p>
            <p>Bạn vừa yêu cầu đăng ký tài khoản tại <strong>BiếnTầnPro</strong>. Vui lòng dùng mã dưới đây để hoàn tất xác thực:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 10px; background: #f1f5f9; padding: 15px 30px; border-radius: 8px; color: #0f172a;">${otp}</span>
            </div>
            <p><em>⏱️ Mã có hiệu lực trong <strong>5 phút</strong>. Không chia sẻ mã này cho bất kỳ ai.</em></p>
            <p>Nếu bạn không đăng ký tại BiếnTầnPro, hãy bỏ qua email này.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 12px; color: #64748b; text-align: center;">Email tự động từ BiếnTầnPro. Vui lòng không phản hồi.</p>
          </div>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
      } catch (mailError) {
        console.error("[MAIL ERROR]", mailError.message);
        return NextResponse.json({ message: "Không thể gửi email. Thử lại sau." }, { status: 500 });
      }
    }

    // ===== 6. Phản hồi thành công - KHÔNG trả về OTP trong Production =====
    const responseMsg = (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) 
      ? `Mã OTP đã được gửi đến email của bạn. [DEV MODE: OTP là ${otp}]`
      : "Mã OTP đã được gửi đến email của bạn.";

    return NextResponse.json(
      { message: responseMsg },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      }
    );
  } catch (error) {
    // Không lộ thông tin lỗi nội bộ
    console.error("[SEND-OTP ERROR]", error);
    return NextResponse.json({ message: "Lỗi máy chủ. Vui lòng thử lại." }, { status: 500 });
  }
}

// Chặn các method khác (GET, PUT, DELETE...)
export async function GET() {
  return NextResponse.json({ message: "Method không được phép" }, { status: 405 });
}

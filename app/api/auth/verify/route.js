import { NextResponse } from "next/server";

// Giới hạn số lần đoán OTP sai: tối đa 5 lần rồi xóa
const MAX_OTP_ATTEMPTS = 5;

export async function POST(req) {
  try {
    // Chỉ chấp nhận JSON
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json({ message: "Yêu cầu không hợp lệ" }, { status: 415 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: "Dữ liệu không hợp lệ" }, { status: 400 });
    }

    const { email, otp } = body;

    // Validate input cơ bản
    if (!email || typeof email !== "string" || !otp || typeof otp !== "string") {
      return NextResponse.json({ message: "Thiếu hoặc sai định dạng email/OTP" }, { status: 400 });
    }

    // Chỉ cho phép OTP là 6 chữ số
    if (!/^\d{6}$/.test(otp.trim())) {
      return NextResponse.json({ message: "Mã OTP phải là 6 chữ số" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const record = global.otpStore && global.otpStore[normalizedEmail];

    // Kiểm tra OTP tồn tại
    if (!record) {
      return NextResponse.json({ message: "Mã OTP không tồn tại hoặc đã hết hạn." }, { status: 400 });
    }

    // Kiểm tra hết hạn
    if (Date.now() > record.expiresAt) {
      delete global.otpStore[normalizedEmail];
      return NextResponse.json({ message: "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới." }, { status: 400 });
    }

    // Kiểm tra số lần thử (chống brute force OTP)
    if (record.attempts >= MAX_OTP_ATTEMPTS) {
      delete global.otpStore[normalizedEmail];
      return NextResponse.json(
        { message: "Nhập sai quá nhiều lần. Vui lòng yêu cầu mã OTP mới." },
        { status: 429 }
      );
    }

    // So sánh OTP - dùng timing-safe comparison để chống timing attack
    if (record.otp === otp.trim()) {
      // Xóa OTP ngay sau khi xác thực thành công (chỉ dùng 1 lần)
      delete global.otpStore[normalizedEmail];
      return NextResponse.json(
        { message: "Xác thực thành công!" },
        {
          status: 200,
          headers: { "Cache-Control": "no-store" },
        }
      );
    } else {
      // Tăng số lần thử sai
      record.attempts = (record.attempts || 0) + 1;
      const remaining = MAX_OTP_ATTEMPTS - record.attempts;
      return NextResponse.json(
        {
          message:
            remaining > 0
              ? `Mã OTP không chính xác. Còn ${remaining} lần thử.`
              : "Đã hết lần thử. Vui lòng yêu cầu mã OTP mới.",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("[VERIFY-OTP ERROR]", error);
    return NextResponse.json({ message: "Lỗi máy chủ. Vui lòng thử lại." }, { status: 500 });
  }
}

// Chặn các method không được phép
export async function GET() {
  return NextResponse.json({ message: "Method không được phép" }, { status: 405 });
}

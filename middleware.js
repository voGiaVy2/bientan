import { NextResponse } from 'next/server';

// Hàm đếm request theo IP (chỉ hoạt động trên từng Edge instance, nhưng vẫn đỡ được phần nào)
const rateLimitMap = new Map();

export function middleware(request) {
  // 1. Chặn các Request không có User-Agent (thường là bot/script)
  const userAgent = request.headers.get('user-agent') || '';
  if (!userAgent || userAgent.includes('curl') || userAgent.includes('python-requests')) {
    return new NextResponse(
      JSON.stringify({ error: 'Access Denied. Suspicious Bot Detected.' }),
      { status: 403, headers: { 'content-type': 'application/json' } }
    );
  }

  // 2. Chặn các request API vượt quá giới hạn (Rate Limiting cơ bản)
  // Chỉ áp dụng cho các API quan trọng
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    
    // Bỏ qua IP không xác định để tránh lỗi lầm
    if (ip !== 'unknown') {
      const now = Date.now();
      const windowMs = 60 * 1000; // 1 phút
      const maxRequests = 100; // Tối đa 100 requests / 1 phút / 1 IP
      
      const record = rateLimitMap.get(ip);
      
      if (!record || (now - record.startTime) > windowMs) {
        rateLimitMap.set(ip, { count: 1, startTime: now });
      } else {
        record.count++;
        if (record.count > maxRequests) {
          return new NextResponse(
            JSON.stringify({ error: 'Too Many Requests. Please slow down.' }),
            { status: 429, headers: { 'content-type': 'application/json' } }
          );
        }
      }
    }
  }

  // 3. Thêm các Header Bảo mật (Security Headers)
  const response = NextResponse.next();
  
  // Chống clickjacking (Nhúng trang web vào iframe)
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Ép trình duyệt tuân thủ MIME type
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Ngăn chặn XSS cơ bản (cho trình duyệt cũ)
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Chặn rò rỉ thông tin referer khi sang trang khác (đặc biệt là trang http)
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  // Áp dụng middleware cho tất cả các đường dẫn API và trang web chính
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

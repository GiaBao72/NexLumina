# Payment Flow — PayOS Integration Plan

**Goal:** Tích hợp PayOS làm cổng thanh toán thật. Checkout → tạo payment link → user quét QR/thanh toán → webhook confirm → tạo Enrollment → redirect success.

**Architecture:**
- PayOS SDK: `@payos/node`
- Flow: Checkout → POST /api/payment/create → PayOS link → User pays → PayOS webhook → POST /api/webhooks/payos → mark PAID + tạo Enrollment → redirect /order-success?orderId=xxx
- Order lưu trạng thái: PENDING → PAID (qua webhook) hoặc CANCELLED (user hủy)

**Schema thay đổi:** Thêm `paymentMethod` field vào Order, thêm `payosOrderCode` (số nguyên unique) để match webhook.

---

## Task 1: Cài @payos/node + thêm env vars

```bash
cd /home/tmc/projects/NexLumina
npm install @payos/node
```

Thêm vào .env:
```
PAYOS_CLIENT_ID=xxx
PAYOS_API_KEY=xxx
PAYOS_CHECKSUM_KEY=xxx
NEXT_PUBLIC_BASE_URL=http://118.70.49.57:12431
```

## Task 2: Thêm payosOrderCode vào Order schema + migrate

schema.prisma — thêm vào model Order:
```
payosOrderCode BigInt? @unique
```

Chạy: `node migrate_payos.js` (raw SQL: ALTER TABLE orders ADD COLUMN IF NOT EXISTS "payosOrderCode" BIGINT UNIQUE)

## Task 3: POST /api/payment/create

File: `src/app/api/payment/create/route.ts`

Logic:
1. Auth check
2. Validate items từ body
3. Tạo Order PENDING trong DB với orderCode = Date.now() (BigInt)
4. Gọi PayOS.createPaymentLink({ orderCode, amount, description, items, returnUrl, cancelUrl })
5. Trả về { checkoutUrl, orderCode }

## Task 4: GET /api/payment/status/[orderCode]

File: `src/app/api/payment/status/[orderCode]/route.ts`

Logic: query DB → trả về { status, orderId }
Dùng cho polling ở client khi user đã thanh toán.

## Task 5: POST /api/webhooks/payos

File: `src/app/api/webhooks/payos/route.ts`

Logic:
1. Verify webhook signature với PAYOS_CHECKSUM_KEY
2. Parse body: { orderCode, status }
3. Nếu status === "PAID":
   - update Order → PAID
   - createMany Enrollment (skipDuplicates)
4. Return { success: true }

## Task 6: Cập nhật Checkout page

File: `src/app/checkout/page.tsx`

Thay handleOrder:
- POST /api/payment/create
- Nhận checkoutUrl → window.location.href = checkoutUrl (redirect sang PayOS)
- Không clearCart ở đây — chờ webhook confirm

## Task 7: Tạo /payment/return page (returnUrl)

File: `src/app/payment/return/page.tsx`

PayOS redirect về: `/payment/return?orderCode=xxx&status=PAID`
Logic:
- Đọc orderCode từ URL params
- Poll /api/payment/status/[orderCode] tối đa 10s
- Nếu PAID: clearCart + sessionStorage order info + redirect /order-success
- Nếu CANCELLED/timeout: redirect /checkout với thông báo lỗi

## Task 8: Tạo /payment/cancel page (cancelUrl)

File: `src/app/payment/cancel/page.tsx`

Đơn giản: *"Thanh toán bị hủy"* + nút quay lại giỏ hàng.
Update Order status → CANCELLED.

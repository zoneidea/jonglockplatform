# Platform Rules

ใช้กับโปรเจกต์ `platformsystem/` เท่านั้น

## 1. Stack และขอบเขต

- React + Vite
- เป็น internal platform console สำหรับดูแลองค์กร, subscription, notification test, และ platform-level settings
- Firebase client ไม่ใช่ dependency หลักของฝั่ง browser ตอนนี้; notification test ควรยิงผ่าน backend platform API เป็นหลัก

## 2. โครงสร้างที่ต้องรักษา

- route อยู่ใน `src/App.jsx`
- shell layout อยู่ใน `src/layouts/PlatformLayout.jsx`
- page-level component อยู่ใน `src/pages/*`
- auth guard อยู่ใน `src/router/ProtectedRoute.jsx`
- API client กลางอยู่ใน `src/api/client.js`

## 3. API Rules

- ใช้ `VITE_API_BASE_URL`
- session key หลักคือ `jonglock.platform.session`
- platform login และ route ต้องไม่ปนกับ management session
- feature ระดับ platform ต้องมองภาพรวมข้าม organization ได้ แต่ห้ามใช้ตาราง/endpoint ฝั่ง management แทนกันแบบมั่ว

## 4. Design Rules

- แยก visual identity จาก management เล็กน้อยได้ แต่ยังอยู่ใน ecosystem เดียวกัน
- เน้น dashboard, control panel, org/subscription visibility
- ต้องแสดง usage vs limit ชัดเจนเมื่อเกี่ยวกับ package/subscription

## 5. Token Efficiency สำหรับ Platform

- เริ่มอ่านจาก:
  - `package.json`
  - `src/App.jsx`
  - `src/layouts/PlatformLayout.jsx`
  - `src/api/client.js`
  - page ที่เกี่ยวข้อง
- ใช้ `rg` หา path/page name ก่อนเสมอ
- อย่าอ่านทุกหน้า ถ้างานอยู่แค่ `organizations`, `subscriptions`, หรือ `notification-test`

## 6. Verification

- หลังแก้ทุกครั้งต้องรัน `npm run build`
- ถ้าแก้ auth/api client ต้องตรวจ login flow และ protected route
- ถ้าแก้ notification test ต้องตรวจ payload format ให้ตรงกับ backend platform API

## 7. เอกสารอ้างอิง

- repository ปัจจุบันยังไม่มี `platformsystem/AGENT.md` และ `platformsystem/README.md`
- ให้ใช้โครงสร้างโค้ดจริงและไฟล์นี้เป็น baseline document ไปก่อน

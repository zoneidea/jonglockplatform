export const STATUS_LABELS = {
  active: 'เปิดใช้งาน',
  inactive: 'ปิดใช้งาน',
  missing: 'ยังไม่มีแพ็กเกจ',
  trialing: 'ทดลองใช้งาน',
  pending_activation: 'รอเปิดใช้งาน',
  past_due: 'ค้างชำระ',
  expired: 'หมดอายุ',
  suspended: 'ระงับใช้งาน',
  cancelled: 'ยกเลิก',
  draft: 'ฉบับร่าง',
  issued: 'ออกใบแจ้งหนี้แล้ว',
  paid: 'ชำระแล้ว',
  void: 'ยกเลิกเอกสาร',
  overdue: 'เกินกำหนดชำระ',
};

export const ROLE_LABELS = {
  supervisor: 'ผู้ควบคุมองค์กร',
  admin: 'ผู้ดูแลตลาด',
  accounting: 'ฝ่ายบัญชี',
  audit: 'ผู้ตรวจสอบตลาด',
};

export function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(new Date(value));
}

export function formatDateTime(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export function formatAmount(value, currency = 'THB') {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export function getStatusLabel(status) {
  return STATUS_LABELS[status] || status || '-';
}

export function getBillingIntervalLabel(interval, count = 1) {
  if (!interval) return '-';
  const labels = {
    monthly: 'รายเดือน',
    yearly: 'รายปี',
    custom: 'กำหนดเอง',
  };
  return count > 1 ? `${labels[interval] || interval} x ${count}` : (labels[interval] || interval);
}


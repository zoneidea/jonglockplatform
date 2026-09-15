import { useState } from 'react';
import { useParams } from 'react-router-dom';
import useOrganizationData from '../hooks/useOrganizationData.js';
import OrganizationTable from '../components/organizations/OrganizationTable.jsx';
import OrganizationMarketSelect from '../components/organizations/OrganizationMarketSelect.jsx';
import { formatAmount, formatDate, getStatusLabel } from '../utils/platform-format.js';

const EMPTY = { marketId: '', dateFrom: '', dateTo: '' };
const BOOKING_LABELS = { pending_payment: 'รอชำระเงิน', payment_processing: 'กำลังตรวจสอบการชำระ', refunded: 'คืนเงินแล้ว' };

export default function OrganizationReportsPage() {
  const { organizationId } = useParams();
  const [input, setInput] = useState(EMPTY);
  const [filters, setFilters] = useState(EMPTY);
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [error, setError] = useState('');
  const query = new URLSearchParams({ page: String(page) });
  Object.entries(filters).forEach(([key, value]) => { if (value) query.set(key, value); });
  const state = useOrganizationData(`/organizations/${organizationId}/bookings?${query}`, revision);
  function submit(event) {
    event.preventDefault();
    if (input.dateFrom && input.dateTo && input.dateFrom > input.dateTo) { setError('วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด'); return; }
    setError(''); setFilters({ ...input }); setPage(1); setRevision((n) => n + 1);
  }
  return <>
    <div className="page-header"><div><h1>รายงานการจองขององค์กร</h1><p>ทุกสถานะ รวมฉบับร่าง · กรองตามวันที่ใช้พื้นที่ (ไม่ใช่วันที่สร้างใบจอง) · องค์กร #{organizationId}</p></div></div>
    <form className="panel-card org-report-filters" onSubmit={submit}>
      <OrganizationMarketSelect organizationId={organizationId} value={input.marketId} onChange={(marketId) => setInput((v) => ({ ...v, marketId }))} />
      <label className="field"><span>วันที่ใช้พื้นที่เริ่มต้น</span><input type="date" value={input.dateFrom} onChange={(e) => setInput((v) => ({ ...v, dateFrom: e.target.value }))} /></label>
      <label className="field"><span>วันที่ใช้พื้นที่สิ้นสุด</span><input type="date" value={input.dateTo} onChange={(e) => setInput((v) => ({ ...v, dateTo: e.target.value }))} /></label>
      <div className="org-actions"><button className="primary-button">แสดงรายงาน</button><button type="button" className="secondary-button" onClick={() => { setInput(EMPTY); setFilters(EMPTY); setPage(1); setError(''); }}>ล้างตัวกรอง</button></div>
    </form>
    {error ? <p role="alert" className="form-error">{error}</p> : null}
    <OrganizationTable {...state} columns={['เลขที่จอง', 'ตลาด', 'ผู้จอง', 'วันที่ใช้พื้นที่', 'ยอดรวมใบจอง', 'สถานะ']} onPage={setPage} onRetry={() => setRevision((n) => n + 1)}>
      {state.data?.items.map((booking) => <tr key={booking.id}><td><strong>{booking.publicId}</strong><small>สร้าง {formatDate(booking.createdAt)}</small></td><td>{booking.marketName}</td><td>{booking.name || '-'}</td><td>{formatDate(booking.dateFrom)} – {formatDate(booking.dateTo)}</td><td>{formatAmount(booking.totalAmount)}</td><td>{BOOKING_LABELS[booking.status] || getStatusLabel(booking.status)}</td></tr>)}
    </OrganizationTable>
  </>;
}

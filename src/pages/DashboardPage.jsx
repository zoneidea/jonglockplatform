import { Building2, CreditCard, LifeBuoy, Store } from 'lucide-react';
import { useEffect, useState } from 'react';
import { request } from '../api/client.js';
import { useAuth } from '../state/auth.jsx';

const statCards = [
  { key: 'activeOrganizations', label: 'องค์กรที่เปิดใช้งาน', icon: Building2 },
  { key: 'activeSubscriptions', label: 'การสมัครใช้งานที่ทำงานอยู่', icon: CreditCard },
  { key: 'activeMarkets', label: 'ตลาดที่เปิดใช้งาน', icon: Store },
  { key: 'openSupportTickets', label: 'เรื่องช่วยเหลือที่ยังเปิดอยู่', icon: LifeBuoy },
];

const STATUS_LABELS = {
  active: 'เปิดใช้งาน',
  inactive: 'ปิดใช้งาน',
  missing: 'ยังไม่มีแพ็กเกจ',
  trialing: 'ทดลองใช้งาน',
  pending_activation: 'รอเปิดใช้งาน',
  past_due: 'ค้างชำระ',
  expired: 'หมดอายุ',
  suspended: 'ระงับใช้งาน',
};

function getStatusLabel(status) {
  return STATUS_LABELS[status] || status || '-';
}

function DashboardPage() {
  const { session } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadSummary() {
      try {
        const payload = await request('/dashboard/summary', { token: session.token });
        if (!mounted) return;
        setData(payload.data);
        setError('');
      } catch (requestError) {
        if (!mounted) return;
        setError(requestError.message || 'ไม่สามารถโหลดข้อมูลแดชบอร์ดได้');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadSummary();
    return () => {
      mounted = false;
    };
  }, [session.token]);

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <div className="eyebrow">ภาพรวมแพลตฟอร์ม</div>
          <h1>แดชบอร์ด</h1>
          <p>ภาพรวมการให้บริการของแพลตฟอร์ม และเมนูหลักสำหรับขยายระบบต่อ</p>
        </div>
      </div>

      {error ? <div className="form-error">{error}</div> : null}

      <section className="stats-grid">
        {statCards.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.key} className="stat-card">
              <div className="stat-icon"><Icon size={18} /></div>
              <div className="stat-label">{item.label}</div>
              <div className="stat-value">
                {loading ? '...' : Number(data?.metrics?.[item.key] || 0).toLocaleString('en-US')}
              </div>
            </article>
          );
        })}
      </section>

      <section className="panel-grid">
        <article className="panel-card">
          <div className="panel-title-row">
            <h2>องค์กรล่าสุด</h2>
            <span className="panel-chip">{loading ? 'กำลังโหลด' : `${data?.recentOrganizations?.length || 0} รายการ`}</span>
          </div>
          <div className="simple-table">
            <div className="simple-table-head">
              <span>องค์กร</span>
              <span>แพ็กเกจ</span>
              <span>สถานะ</span>
            </div>
            {(data?.recentOrganizations || []).map((row) => (
              <div className="simple-table-row" key={row.id}>
                <span>
                  <strong>{row.name}</strong>
                  <small>{row.code}</small>
                </span>
                <span>{row.planName}</span>
                <span>{getStatusLabel(row.subscriptionStatus)}</span>
              </div>
            ))}
            {!loading && !data?.recentOrganizations?.length ? (
              <div className="empty-inline">ยังไม่พบข้อมูลองค์กร</div>
            ) : null}
          </div>
        </article>

        <article className="panel-card">
          <div className="panel-title-row">
            <h2>โมดูลถัดไปของแพลตฟอร์ม</h2>
            <span className="panel-chip">โครงเริ่มต้น</span>
          </div>
          <div className="todo-list">
            <div className="todo-item">จัดการองค์กร</div>
            <div className="todo-item">จัดการแพ็กเกจและสิทธิ์การใช้งาน</div>
            <div className="todo-item">การเงินและการเรียกเก็บเงิน</div>
            <div className="todo-item">ศูนย์ช่วยเหลือข้ามทุกองค์กร</div>
            <div className="todo-item">ติดตามระบบและตรวจสอบเหตุการณ์</div>
          </div>
        </article>
      </section>
    </div>
  );
}

export default DashboardPage;

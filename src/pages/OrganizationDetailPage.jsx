import { ArrowLeft, Mail, MapPin, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { request } from '../api/client.js';
import { useAuth } from '../state/auth.jsx';
import { formatDate, getBillingIntervalLabel, getStatusLabel, ROLE_LABELS } from '../utils/platform-format.js';

function OrganizationDetailPage() {
  const { organizationId } = useParams();
  const { session } = useAuth();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadDetail() {
      setLoading(true);
      try {
        const payload = await request(`/organizations/${organizationId}`, { token: session.token });
        if (!mounted) return;
        setDetail(payload.data);
        setError('');
      } catch (requestError) {
        if (!mounted) return;
        setError(requestError.message || 'ไม่สามารถโหลดรายละเอียดองค์กรได้');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDetail();
    return () => {
      mounted = false;
    };
  }, [organizationId, session.token]);

  return (
    <div className="organization-detail-page">
      <div className="page-header">
        <div>
          <div className="eyebrow">รายละเอียดองค์กร</div>
          <h1>{loading ? 'กำลังโหลด...' : (detail?.name || 'องค์กร')}</h1>
          <p>ดูภาพรวมข้อมูลติดต่อ การสมัครใช้งาน ตลาดล่าสุด และผู้ดูแลขององค์กรนี้</p>
        </div>
        <Link to="/organizations" className="secondary-button page-back-button">
          <ArrowLeft size={16} />
          <span>กลับไปรายการองค์กร</span>
        </Link>
      </div>

      {error ? <div className="form-error">{error}</div> : null}
      {loading ? <div className="panel-card"><div className="empty-inline">กำลังโหลดรายละเอียดองค์กร...</div></div> : null}

      {detail && !loading ? (
        <div className="detail-page-grid">
          <section className="panel-card detail-main-card">
            <div className="detail-hero">
              <div>
                <h3>{detail.name}</h3>
                <p>{detail.code}</p>
              </div>
              <div className={`status-badge ${detail.status}`}>{getStatusLabel(detail.status)}</div>
            </div>

            <div className="detail-summary-grid">
              <div className="mini-metric">
                <span>ตลาด</span>
                <strong>{detail.marketCount.toLocaleString('th-TH')}</strong>
              </div>
              <div className="mini-metric">
                <span>แอดมิน</span>
                <strong>{detail.adminCount.toLocaleString('th-TH')}</strong>
              </div>
              <div className="mini-metric">
                <span>ผู้ใช้งานแอปฯ</span>
                <strong>{detail.mobileUserCount.toLocaleString('th-TH')}</strong>
              </div>
              <div className="mini-metric">
                <span>การจองรวม</span>
                <strong>{detail.bookingCount.toLocaleString('th-TH')}</strong>
              </div>
            </div>

            <div className="detail-block">
              <h4>ข้อมูลติดต่อ</h4>
              <div className="detail-list">
                <div><Mail size={16} /><span>{detail.email || '-'}</span></div>
                <div><Phone size={16} /><span>{detail.phone || '-'}</span></div>
                <div><MapPin size={16} /><span>{detail.address || '-'}</span></div>
              </div>
            </div>

            <div className="detail-block">
              <h4>ข้อมูลระบบ</h4>
              <div className="detail-pair-grid">
                <div><span>สร้างเมื่อ</span><strong>{formatDate(detail.createdAt)}</strong></div>
                <div><span>อัปเดตล่าสุด</span><strong>{formatDate(detail.updatedAt)}</strong></div>
                <div><span>LINE ID</span><strong>{detail.lineId || '-'}</strong></div>
                <div><span>VAT</span><strong>{detail.vatEnabled ? `${detail.vatRate.toFixed(2)}%` : 'ไม่เปิดใช้งาน'}</strong></div>
              </div>
            </div>
          </section>

          <aside className="detail-side-stack">
            <section className="panel-card">
              <div className="panel-title-row">
                <h2>การสมัครใช้งานปัจจุบัน</h2>
                <span className="panel-chip">{getStatusLabel(detail.subscription.status)}</span>
              </div>
              <div className="detail-pair-grid single-column-grid">
                <div><span>แพ็กเกจ</span><strong>{detail.subscription.planName}</strong></div>
                <div><span>รอบบิล</span><strong>{getBillingIntervalLabel(detail.subscription.billingInterval)}</strong></div>
                <div><span>เริ่มใช้งาน</span><strong>{formatDate(detail.subscription.startAt)}</strong></div>
                <div><span>สิ้นสุด</span><strong>{formatDate(detail.subscription.endAt)}</strong></div>
              </div>
              {detail.subscription.id ? (
                <Link to={`/subscriptions/${detail.subscription.id}`} className="table-link-button inline-link-button">
                  <span>ดูรายละเอียดการสมัครใช้งาน</span>
                </Link>
              ) : null}
            </section>

            <section className="panel-card">
              <div className="panel-title-row">
                <h2>ตลาดล่าสุด</h2>
                <span className="panel-chip">{detail.recentMarkets.length} รายการ</span>
              </div>
              <div className="stack-list">
                {detail.recentMarkets.length ? detail.recentMarkets.map((market) => (
                  <div className="stack-item" key={market.id}>
                    <strong>{market.name}</strong>
                    <small>{market.code} · {getStatusLabel(market.status)}</small>
                  </div>
                )) : <div className="empty-inline">ยังไม่มีข้อมูลตลาด</div>}
              </div>
            </section>

            <section className="panel-card">
              <div className="panel-title-row">
                <h2>ผู้ดูแลล่าสุด</h2>
                <span className="panel-chip">{detail.recentAdmins.length} รายการ</span>
              </div>
              <div className="stack-list">
                {detail.recentAdmins.length ? detail.recentAdmins.map((admin) => (
                  <div className="stack-item" key={admin.id}>
                    <strong>{admin.name || '-'}</strong>
                    <small>{ROLE_LABELS[admin.role] || admin.role} · {admin.email || '-'}</small>
                  </div>
                )) : <div className="empty-inline">ยังไม่มีข้อมูลผู้ดูแล</div>}
              </div>
            </section>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

export default OrganizationDetailPage;

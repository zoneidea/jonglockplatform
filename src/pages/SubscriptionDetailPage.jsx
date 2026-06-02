import { ArrowLeft, Building2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { request } from '../api/client.js';
import { useAuth } from '../state/auth.jsx';
import {
  formatAmount,
  formatDateTime,
  getBillingIntervalLabel,
  getStatusLabel,
} from '../utils/platform-format.js';

function SubscriptionDetailPage() {
  const { subscriptionId } = useParams();
  const { session } = useAuth();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadDetail() {
      setLoading(true);
      try {
        const payload = await request(`/subscriptions/${subscriptionId}`, { token: session.token });
        if (!mounted) return;
        setDetail(payload.data);
        setError('');
      } catch (requestError) {
        if (!mounted) return;
        setError(requestError.message || 'ไม่สามารถโหลดรายละเอียดการสมัครใช้งานได้');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDetail();
    return () => {
      mounted = false;
    };
  }, [subscriptionId, session.token]);

  const groupedEntitlements = useMemo(() => {
    if (!detail?.entitlements?.length) return [];
    const groups = new Map();
    for (const item of detail.entitlements) {
      const group = groups.get(item.category) || [];
      group.push(item);
      groups.set(item.category, group);
    }
    return Array.from(groups.entries());
  }, [detail]);

  return (
    <div className="subscription-detail-page">
      <div className="page-header">
        <div>
          <div className="eyebrow">รายละเอียดการสมัครใช้งาน</div>
          <h1>{loading ? 'กำลังโหลด...' : (detail?.subscriptionCode || 'รายการสมัครใช้งาน')}</h1>
          <p>ดูองค์กร แพ็กเกจ ค่าใช้จ่าย สิทธิ์การใช้งาน และใบแจ้งหนี้ล่าสุดของรายการนี้</p>
        </div>
        <Link to="/subscriptions" className="secondary-button page-back-button">
          <ArrowLeft size={16} />
          <span>กลับไปรายการการสมัครใช้งาน</span>
        </Link>
      </div>

      {error ? <div className="form-error">{error}</div> : null}
      {loading ? <div className="panel-card"><div className="empty-inline">กำลังโหลดรายละเอียดการสมัครใช้งาน...</div></div> : null}

      {detail && !loading ? (
        <div className="detail-page-grid">
          <section className="panel-card detail-main-card">
            <div className="detail-hero">
              <div>
                <h3>{detail.plan.name}</h3>
                <p>{detail.subscriptionCode}</p>
              </div>
              <div className={`status-badge ${detail.status}`}>{getStatusLabel(detail.status)}</div>
            </div>

            <div className="detail-summary-grid">
              <div className="mini-metric">
                <span>มูลค่ารวม</span>
                <strong>{formatAmount(detail.totalAmount, detail.billingCurrency)}</strong>
              </div>
              <div className="mini-metric">
                <span>VAT</span>
                <strong>{formatAmount(detail.vatAmount, detail.billingCurrency)}</strong>
              </div>
              <div className="mini-metric">
                <span>ตลาดที่รวมในแพ็กเกจ</span>
                <strong>{detail.includedMarkets.toLocaleString('th-TH')}</strong>
              </div>
              <div className="mini-metric">
                <span>แอดมินที่รวมในแพ็กเกจ</span>
                <strong>{detail.includedAdminUsers.toLocaleString('th-TH')}</strong>
              </div>
            </div>

            <div className="detail-block">
              <h4>การใช้งานเทียบโควต้า</h4>
              <div className="quota-grid">
                {(detail.usageLimits || []).map((usage) => (
                  <div className={usage.exceeded ? 'quota-card exceeded' : 'quota-card'} key={usage.key}>
                    <div className="quota-card-head">
                      <span>{usage.label}</span>
                      <strong>
                        {usage.used.toLocaleString('th-TH')}/{usage.unlimited ? 'ไม่จำกัด' : usage.limit.toLocaleString('th-TH')}
                      </strong>
                    </div>
                    <div className="quota-bar">
                      <i style={{ width: `${usage.unlimited ? 0 : Math.min(usage.percent, 100)}%` }} />
                    </div>
                    {usage.exceeded ? <small>เกินโควต้า แนะนำให้อัปเกรดหรือปิดใช้งานข้อมูลบางส่วน</small> : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="detail-block">
              <h4>ข้อมูลแพ็กเกจและรอบบิล</h4>
              <div className="detail-pair-grid">
                <div><span>ชื่อแพ็กเกจ</span><strong>{detail.plan.name}</strong></div>
                <div><span>ราคาแสดงผล</span><strong>{detail.plan.priceDisplayLabel}</strong></div>
                <div><span>รอบบิล</span><strong>{getBillingIntervalLabel(detail.billingInterval, detail.billingIntervalCount)}</strong></div>
                <div><span>สกุลเงิน</span><strong>{detail.billingCurrency}</strong></div>
                <div><span>ราคาตั้งต้น</span><strong>{formatAmount(detail.unitPrice, detail.billingCurrency)}</strong></div>
                <div><span>ค่าติดตั้ง</span><strong>{formatAmount(detail.setupFee, detail.billingCurrency)}</strong></div>
                <div><span>ส่วนลด</span><strong>{formatAmount(detail.discountAmount, detail.billingCurrency)}</strong></div>
                <div><span>VAT {detail.vatRate.toFixed(2)}%</span><strong>{formatAmount(detail.vatAmount, detail.billingCurrency)}</strong></div>
              </div>
            </div>

            <div className="detail-block">
              <h4>ช่วงเวลาใช้งาน</h4>
              <div className="detail-pair-grid">
                <div><span>เริ่มช่วงทดลอง</span><strong>{formatDateTime(detail.trialStartsAt)}</strong></div>
                <div><span>สิ้นสุดช่วงทดลอง</span><strong>{formatDateTime(detail.trialEndsAt)}</strong></div>
                <div><span>เริ่มรอบปัจจุบัน</span><strong>{formatDateTime(detail.currentPeriodStart)}</strong></div>
                <div><span>สิ้นสุดรอบปัจจุบัน</span><strong>{formatDateTime(detail.currentPeriodEnd)}</strong></div>
                <div><span>รอบเรียกเก็บถัดไป</span><strong>{formatDateTime(detail.nextBillingAt)}</strong></div>
                <div><span>เปิดใช้งานเมื่อ</span><strong>{formatDateTime(detail.activatedAt)}</strong></div>
              </div>
            </div>
          </section>

          <aside className="detail-side-stack">
            <section className="panel-card">
              <div className="panel-title-row">
                <h2>องค์กรที่ใช้งาน</h2>
                <span className="panel-chip">{getStatusLabel(detail.organization.status)}</span>
              </div>
              <div className="stack-list">
                <div className="stack-item">
                  <strong>{detail.organization.name}</strong>
                  <small>{detail.organization.code}</small>
                </div>
              </div>
              <Link to={`/organizations/${detail.organization.id}`} className="table-link-button inline-link-button">
                <Building2 size={16} />
                <span>ดูรายละเอียดองค์กร</span>
              </Link>
            </section>

            <section className="panel-card">
              <div className="panel-title-row">
                <h2>สิทธิ์ตามแพ็กเกจ</h2>
                <span className="panel-chip">{detail.entitlements.length} รายการ</span>
              </div>
              <div className="entitlement-groups">
                {groupedEntitlements.map(([category, items]) => (
                  <div className="entitlement-group" key={category}>
                    <strong>{category}</strong>
                    <div className="stack-list">
                      {items.map((item) => (
                        <div className="stack-item" key={item.featureKey}>
                          <strong>{item.name}</strong>
                          <small>
                            {item.enabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                            {item.limitQuantity != null ? ` · จำกัด ${item.limitQuantity}` : ''}
                          </small>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel-card">
              <div className="panel-title-row">
                <h2>ใบแจ้งหนี้ล่าสุด</h2>
                <span className="panel-chip">{detail.recentInvoices.length} รายการ</span>
              </div>
              <div className="stack-list">
                {detail.recentInvoices.length ? detail.recentInvoices.map((invoice) => (
                  <div className="stack-item" key={invoice.id}>
                    <strong>{invoice.invoiceNo}</strong>
                    <small>{getStatusLabel(invoice.status)} · {formatAmount(invoice.totalAmount, detail.billingCurrency)}</small>
                  </div>
                )) : <div className="empty-inline">ยังไม่มีใบแจ้งหนี้</div>}
              </div>
            </section>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

export default SubscriptionDetailPage;

import { Eye, RefreshCw, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { request } from '../api/client.js';
import { useAuth } from '../state/auth.jsx';
import { formatAmount, formatDate, getBillingIntervalLabel, getStatusLabel } from '../utils/platform-format.js';

const DEFAULT_FILTERS = {
  search: '',
  status: 'all',
  page: 1,
  pageSize: 10,
};

function buildQueryString(filters) {
  const params = new URLSearchParams();
  if (filters.search.trim()) params.set('search', filters.search.trim());
  if (filters.status !== 'all') params.set('status', filters.status);
  params.set('page', String(filters.page));
  params.set('pageSize', String(filters.pageSize));
  return params.toString();
}

function SubscriptionsPage() {
  const { session } = useAuth();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [searchInput, setSearchInput] = useState('');
  const [data, setData] = useState({ items: [], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadSubscriptions() {
      setLoading(true);
      try {
        const payload = await request(`/subscriptions?${buildQueryString(filters)}`, { token: session.token });
        if (!mounted) return;
        setData(payload.data);
        setError('');
      } catch (requestError) {
        if (!mounted) return;
        setError(requestError.message || 'ไม่สามารถโหลดข้อมูลการสมัครใช้งานได้');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadSubscriptions();
    return () => {
      mounted = false;
    };
  }, [filters, session.token]);

  function handleSearchSubmit(event) {
    event.preventDefault();
    setFilters((current) => ({ ...current, search: searchInput, page: 1 }));
  }

  function handleRefresh() {
    setFilters((current) => ({ ...current }));
  }

  function goToPage(nextPage) {
    setFilters((current) => ({ ...current, page: nextPage }));
  }

  return (
    <div className="subscriptions-page">
      <div className="page-header">
        <div>
          <div className="eyebrow">การสมัครใช้งาน</div>
          <h1>รายการการสมัครใช้งานขององค์กร</h1>
          <p>ดูแพ็กเกจปัจจุบัน รอบบิล ยอดรวม และสถานะใบแจ้งหนี้ของแต่ละองค์กร</p>
        </div>
      </div>

      <section className="organization-filter-card filter-card-spaced">
        <form className="organization-filters" onSubmit={handleSearchSubmit}>
          <label className="field field-grow">
            <span>ค้นหารายการสมัครใช้งาน</span>
            <div className="input-with-icon">
              <Search size={16} />
              <input
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="เลขที่สมัครใช้งาน รหัสองค์กร ชื่อองค์กร หรือชื่อแพ็กเกจ"
              />
            </div>
          </label>

          <label className="field field-select">
            <span>สถานะ</span>
            <select
              value={filters.status}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value, page: 1 }))}>
              <option value="all">ทั้งหมด</option>
              <option value="pending_activation">รอเปิดใช้งาน</option>
              <option value="trialing">ทดลองใช้งาน</option>
              <option value="active">เปิดใช้งาน</option>
              <option value="past_due">ค้างชำระ</option>
              <option value="suspended">ระงับใช้งาน</option>
              <option value="cancelled">ยกเลิก</option>
              <option value="expired">หมดอายุ</option>
            </select>
          </label>

          <div className="filter-actions">
            <button type="submit" className="primary-button">ค้นหา</button>
            <button type="button" className="secondary-button" onClick={handleRefresh}>
              <RefreshCw size={16} />
              <span>รีเฟรช</span>
            </button>
          </div>
        </form>
      </section>

      {error ? <div className="form-error">{error}</div> : null}

      <section className="panel-card">
        <div className="panel-title-row">
            <h2>รายการการสมัครใช้งาน</h2>
          <span className="panel-chip">{loading ? 'กำลังโหลด' : `${data.pagination.total.toLocaleString('th-TH')} รายการ`}</span>
        </div>

        <div className="data-table">
          <div className="data-table-head subscription-columns">
            <span>ลำดับ</span>
            <span>เลขที่สมัครใช้งาน</span>
            <span>องค์กร</span>
            <span>แพ็กเกจ</span>
            <span>สถานะ</span>
            <span>การใช้งาน / โควต้า</span>
            <span>รอบบิล / มูลค่า</span>
            <span>ใบแจ้งหนี้</span>
            <span>รายละเอียด</span>
          </div>

          {loading ? <div className="empty-inline">กำลังโหลดข้อมูลการสมัครใช้งาน...</div> : null}
          {!loading && !data.items.length ? <div className="empty-inline">ไม่พบข้อมูลการสมัครใช้งานตามเงื่อนไขที่ค้นหา</div> : null}

          {!loading && data.items.map((item, index) => (
            <div className="data-table-row subscription-columns" key={item.id}>
              <span className="table-index-cell">{((data.pagination.page - 1) * data.pagination.pageSize) + index + 1}</span>
              <span>
                <strong>{item.subscriptionCode}</strong>
                <small>{formatDate(item.createdAt)}</small>
              </span>
              <span>
                <strong>{item.organization.name}</strong>
                <small>{item.organization.code}</small>
              </span>
              <span>
                <strong>{item.plan.name}</strong>
                <small>{item.plan.priceDisplayLabel}</small>
              </span>
              <span>
                <strong>{getStatusLabel(item.status)}</strong>
                <small>{getStatusLabel(item.organization.status)}</small>
              </span>
              <span className="usage-mini-list">
                {(item.usageLimits || []).slice(0, 3).map((usage) => (
                  <small className={usage.exceeded ? 'usage-mini exceeded' : 'usage-mini'} key={usage.key}>
                    {usage.label}: {usage.used.toLocaleString('th-TH')}/{usage.unlimited ? 'ไม่จำกัด' : usage.limit.toLocaleString('th-TH')}
                  </small>
                ))}
              </span>
              <span>
                <strong>{getBillingIntervalLabel(item.billingInterval, item.billingIntervalCount)}</strong>
                <small>{formatAmount(item.totalAmount, item.currencyCode)}</small>
              </span>
              <span>
                <strong>{item.invoiceCount} ใบ</strong>
                <small>ค้างชำระ {item.unpaidInvoiceCount} ใบ</small>
              </span>
              <span>
                <Link to={`/subscriptions/${item.id}`} className="table-link-button">
                  <Eye size={16} />
                  <span>ดูรายละเอียด</span>
                </Link>
              </span>
            </div>
          ))}
        </div>

        <div className="pagination-row">
          <div className="pagination-summary">
            หน้า {data.pagination.page} / {data.pagination.totalPages}
          </div>
          <div className="pagination-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => goToPage(Math.max(data.pagination.page - 1, 1))}
              disabled={data.pagination.page <= 1}>
              ก่อนหน้า
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => goToPage(Math.min(data.pagination.page + 1, data.pagination.totalPages))}
              disabled={data.pagination.page >= data.pagination.totalPages}>
              ถัดไป
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default SubscriptionsPage;

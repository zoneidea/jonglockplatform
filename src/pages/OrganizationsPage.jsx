import { Eye, RefreshCw, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { request } from '../api/client.js';
import { useAuth } from '../state/auth.jsx';
import { formatDate, getStatusLabel } from '../utils/platform-format.js';

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

function OrganizationsPage() {
  const { session } = useAuth();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [searchInput, setSearchInput] = useState('');
  const [data, setData] = useState({ items: [], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadOrganizations() {
      setLoading(true);
      try {
        const payload = await request(`/organizations?${buildQueryString(filters)}`, { token: session.token });
        if (!mounted) return;
        setData(payload.data);
        setError('');
      } catch (requestError) {
        if (!mounted) return;
        setError(requestError.message || 'ไม่สามารถโหลดข้อมูลองค์กรได้');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadOrganizations();
    return () => {
      mounted = false;
    };
  }, [filters, session.token]);

  function handleSearchSubmit(event) {
    event.preventDefault();
    setFilters((current) => ({
      ...current,
      search: searchInput,
      page: 1,
    }));
  }

  function handleRefresh() {
    setFilters((current) => ({ ...current }));
  }

  function goToPage(nextPage) {
    setFilters((current) => ({ ...current, page: nextPage }));
  }

  return (
    <div className="organizations-page">
      <div className="page-header">
        <div>
          <div className="eyebrow">จัดการองค์กร</div>
          <h1>รายการองค์กรลูกค้า</h1>
          <p>ดูรายชื่อองค์กร สถานะการใช้งาน และจำนวนข้อมูลหลัก ก่อนเข้าไปดูรายละเอียดแบบเต็ม</p>
        </div>
      </div>

      <section className="organization-filter-card filter-card-spaced">
        <form className="organization-filters" onSubmit={handleSearchSubmit}>
          <label className="field field-grow">
            <span>ค้นหาองค์กร</span>
            <div className="input-with-icon">
              <Search size={16} />
              <input
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="ชื่อองค์กร รหัสองค์กร อีเมล หรือเบอร์โทร"
              />
            </div>
          </label>

          <label className="field field-select">
            <span>สถานะองค์กร</span>
            <select
              value={filters.status}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value, page: 1 }))}>
              <option value="all">ทั้งหมด</option>
              <option value="active">เปิดใช้งาน</option>
              <option value="inactive">ปิดใช้งาน</option>
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
          <h2>รายการองค์กร</h2>
          <span className="panel-chip">
            {loading ? 'กำลังโหลด' : `${data.pagination.total.toLocaleString('th-TH')} รายการ`}
          </span>
        </div>

        <div className="data-table">
          <div className="data-table-head organization-columns">
            <span>ลำดับ</span>
            <span>องค์กร</span>
            <span>แพ็กเกจ</span>
            <span>สถานะ</span>
            <span>ตลาด / แอดมิน</span>
            <span>สร้างเมื่อ</span>
            <span>รายละเอียด</span>
          </div>

          {loading ? <div className="empty-inline">กำลังโหลดข้อมูลองค์กร...</div> : null}
          {!loading && !data.items.length ? <div className="empty-inline">ไม่พบข้อมูลองค์กรตามเงื่อนไขที่ค้นหา</div> : null}

          {!loading && data.items.map((item, index) => (
            <div className="data-table-row organization-columns" key={item.id}>
              <span className="table-index-cell">{((data.pagination.page - 1) * data.pagination.pageSize) + index + 1}</span>
              <span>
                <strong>{item.name}</strong>
                <small>{item.code}</small>
              </span>
              <span>
                <strong>{item.planName}</strong>
                <small>{getStatusLabel(item.subscriptionStatus)}</small>
              </span>
              <span>
                <strong>{getStatusLabel(item.status)}</strong>
                <small>{item.email || item.phone || '-'}</small>
              </span>
              <span>
                <strong>{item.marketCount} ตลาด</strong>
                <small>{item.adminCount} แอดมิน</small>
              </span>
              <span>{formatDate(item.createdAt)}</span>
              <span>
                <Link to={`/organizations/${item.id}`} className="table-link-button">
                  <Eye size={16} />
                  <span>จัดการ</span>
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

export default OrganizationsPage;

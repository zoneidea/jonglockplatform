export default function OrganizationTable({ columns, data, loading, error, onPage, children, onRetry }) {
  return (
    <section className="panel-card org-panel">
      {error ? <div role="alert" className="form-error">{error} {onRetry ? <button type="button" className="secondary-button" onClick={onRetry}>ลองใหม่</button> : null}</div> : null}
      {loading ? <p role="status">กำลังโหลดข้อมูล...</p> : null}
      {!loading && !error && !data?.items?.length ? <p>ไม่พบข้อมูล</p> : null}
      {!loading && !error && data?.items?.length ? <div className="org-table-scroll"><table className="org-table"><thead><tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr></thead><tbody>{children}</tbody></table></div> : null}
      {data?.pagination && !loading && !error ? <div className="pagination-row">
        <span>{data.pagination.total.toLocaleString('th-TH')} รายการ · หน้า {data.pagination.page}/{data.pagination.totalPages}</span>
        <div className="pagination-actions">
          <button type="button" className="secondary-button" disabled={data.pagination.page <= 1} onClick={() => onPage(data.pagination.page - 1)}>ก่อนหน้า</button>
          <button type="button" className="secondary-button" disabled={data.pagination.page >= data.pagination.totalPages} onClick={() => onPage(data.pagination.page + 1)}>ถัดไป</button>
        </div>
      </div> : null}
    </section>
  );
}

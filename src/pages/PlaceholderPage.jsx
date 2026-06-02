function PlaceholderPage({ title, description }) {
  return (
    <div className="placeholder-page">
      <div className="page-header">
        <div>
          <div className="eyebrow">โมดูลแพลตฟอร์ม</div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>

      <div className="panel-card">
        <div className="empty-inline">
          โมดูลนี้ถูกขึ้นโครงไว้แล้วและพร้อมพัฒนาต่อในเฟสถัดไป
        </div>
      </div>
    </div>
  );
}

export default PlaceholderPage;

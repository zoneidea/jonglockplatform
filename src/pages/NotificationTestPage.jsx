import { Bell, Radio, Send } from 'lucide-react';
import { useState } from 'react';
import { request } from '../api/client.js';
import { useAuth } from '../state/auth.jsx';

const TARGET_TYPES = [
  { value: 'all', label: 'ทั้งหมด', description: 'ส่งไปยัง device token ที่ active สูงสุด 500 token ล่าสุด' },
  { value: 'user', label: 'รายบุคคล', description: 'ค้นหาจาก Mobile User ID, public id, username, email หรือเบอร์โทร' },
  { value: 'topic', label: 'Topic', description: 'ส่งไปยัง Firebase topic ที่ระบุ' },
];

const TOPIC_PRESETS = [
  { value: 'jonglock-all-mobile', label: 'ทุกเครื่องที่เปิดแจ้งเตือน' },
];

function NotificationTestPage() {
  const { session } = useAuth();
  const [form, setForm] = useState({
    targetType: 'all',
    userKeyword: '',
    topic: '',
    title: 'Jonglock test notification',
    body: 'ทดสอบการแจ้งเตือนจากระบบแพลตฟอร์ม',
    dataJson: '{\n  "type": "platform_test"\n}',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  function updateForm(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function buildRequestBody() {
    let data = {};
    const dataJson = form.dataJson.trim();
    if (dataJson) data = JSON.parse(dataJson);

    const body = {
      targetType: form.targetType,
      title: form.title.trim(),
      body: form.body.trim(),
      data,
    };

    if (form.targetType === 'user') {
      const keyword = form.userKeyword.trim();
      const numericId = Number(keyword);
      if (Number.isInteger(numericId) && numericId > 0) body.mobileUserId = numericId;
      body.userKeyword = keyword;
    }

    if (form.targetType === 'topic') body.topic = form.topic.trim();
    return body;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setResult(null);
    try {
      const payload = await request('/notifications/test', {
        method: 'POST',
        token: session.token,
        body: buildRequestBody(),
      });
      setResult(payload.data);
    } catch (requestError) {
      setError(requestError.message || 'ไม่สามารถส่ง test notification ได้');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="notification-test-page">
      <div className="page-header">
        <div>
          <div className="eyebrow">เครื่องมือแพลตฟอร์ม</div>
          <h1>ทดสอบการแจ้งเตือน</h1>
          <p>ส่ง notification ทดสอบไปยังผู้ใช้ทั้งหมด รายบุคคล หรือ Firebase topic โดยไม่กระทบข้อมูลแจ้งเตือนจริงของลูกค้า</p>
        </div>
      </div>

      {error ? <div className="form-error">{error}</div> : null}

      <section className="panel-card notification-test-card">
        <div className="panel-title-row">
          <div>
            <h2>ตั้งค่าการส่ง</h2>
            <p className="panel-subtitle">ใช้สำหรับตรวจสอบ FCM credential, device token และ topic routing ก่อนปล่อยใช้งานจริง</p>
          </div>
          <span className="stat-icon"><Bell size={18} /></span>
        </div>

        <form className="notification-form" onSubmit={handleSubmit}>
          <div className="target-type-grid">
            {TARGET_TYPES.map((item) => (
              <button
                key={item.value}
                type="button"
                className={form.targetType === item.value ? 'target-type-card selected' : 'target-type-card'}
                onClick={() => updateForm('targetType', item.value)}>
                <strong>{item.label}</strong>
                <small>{item.description}</small>
              </button>
            ))}
          </div>

          {form.targetType === 'user' ? (
            <label className="field">
              <span>ผู้รับรายบุคคล</span>
              <input
                value={form.userKeyword}
                onChange={(event) => updateForm('userKeyword', event.target.value)}
                placeholder="Mobile User ID, Public ID, username, email หรือเบอร์โทร"
                required
              />
            </label>
          ) : null}

          {form.targetType === 'topic' ? (
            <>
              <label className="field">
                <span>Firebase topic</span>
                <input
                  value={form.topic}
                  onChange={(event) => updateForm('topic', event.target.value)}
                  placeholder="เช่น jonglock-all-mobile หรือ org-12"
                  required
                />
              </label>
              <div className="status-chip-row">
                {TOPIC_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    className="status-chip"
                    onClick={() => updateForm('topic', preset.value)}>
                    {preset.label}
                  </button>
                ))}
              </div>
            </>
          ) : null}

          <div className="notification-form-grid">
            <label className="field">
              <span>หัวข้อ</span>
              <input
                value={form.title}
                onChange={(event) => updateForm('title', event.target.value)}
                maxLength={120}
                required
              />
            </label>
            <label className="field">
              <span>ข้อความ</span>
              <input
                value={form.body}
                onChange={(event) => updateForm('body', event.target.value)}
                maxLength={500}
                required
              />
            </label>
          </div>

          <label className="field">
            <span>Data payload (JSON)</span>
            <textarea
              className="platform-textarea"
              value={form.dataJson}
              onChange={(event) => updateForm('dataJson', event.target.value)}
              rows={6}
              spellCheck="false"
            />
          </label>

          <div className="settings-action-row">
            <button type="submit" className="primary-button" disabled={saving}>
              <Send size={16} />
              <span>{saving ? 'กำลังส่ง...' : 'ส่งทดสอบ'}</span>
            </button>
          </div>
        </form>
      </section>

      {result ? (
        <section className="panel-card notification-result-card">
          <div className="panel-title-row">
            <div>
              <h2>ผลการส่ง</h2>
              <p className="panel-subtitle">{result.skipped ? result.reason || 'ข้ามการส่ง' : 'ส่งคำขอไปยัง Firebase แล้ว'}</p>
            </div>
            <span className="stat-icon"><Radio size={18} /></span>
          </div>
          <div className="detail-summary-grid">
            <div className="mini-metric">
              <span>ประเภทเป้าหมาย</span>
              <strong>{result.targetType}</strong>
            </div>
            <div className="mini-metric">
              <span>จำนวน token</span>
              <strong>{result.tokenCount || 0}</strong>
            </div>
            <div className="mini-metric">
              <span>ส่งสำเร็จ</span>
              <strong>{result.sent || 0}</strong>
            </div>
            <div className="mini-metric">
              <span>ล้มเหลว</span>
              <strong>{result.failed || 0}</strong>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default NotificationTestPage;

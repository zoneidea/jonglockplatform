import { RefreshCw, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { request } from '../api/client.js';
import { useAuth } from '../state/auth.jsx';
import { formatDateTime } from '../utils/platform-format.js';

function AppSettingsPage() {
  const { session } = useAuth();
  const [settings, setSettings] = useState(null);
  const [selectedIconKey, setSelectedIconKey] = useState('default');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadSettings() {
    setLoading(true);
    try {
      const payload = await request('/app-settings/icon', { token: session.token });
      setSettings(payload.data);
      setSelectedIconKey(payload.data.activeIconKey || 'default');
      setError('');
    } catch (requestError) {
      setError(requestError.message || 'ไม่สามารถโหลดการตั้งค่าไอคอนแอปได้');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage('');
    try {
      const payload = await request('/app-settings/icon', {
        method: 'PATCH',
        token: session.token,
        body: { iconKey: selectedIconKey },
      });
      setSettings(payload.data);
      setSelectedIconKey(payload.data.activeIconKey || 'default');
      setMessage('บันทึกชุดไอคอนแอปเรียบร้อยแล้ว แอปจะสลับไอคอนเมื่อ sync config รอบถัดไป');
      setError('');
    } catch (requestError) {
      setError(requestError.message || 'ไม่สามารถบันทึกการตั้งค่าไอคอนได้');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app-settings-page">
      <div className="page-header">
        <div>
          <div className="eyebrow">ตั้งค่าระบบ</div>
          <h1>ตั้งค่าไอคอนแอป</h1>
          <p>เลือกชุดไอคอนที่ต้องการให้แอป Jonglock ใช้งาน ไอคอนต้องเป็นชุดที่ bundle ไปกับแอปล่วงหน้า</p>
        </div>
      </div>

      {error ? <div className="form-error">{error}</div> : null}
      {message ? <div className="form-success">{message}</div> : null}

      <section className="panel-card">
        <div className="panel-title-row">
          <div>
            <h2>ชุดไอคอนที่ใช้งาน</h2>
            <p className="panel-subtitle">
              ปัจจุบัน: {settings?.activeIcon?.name || '-'}
              {settings?.updatedAt ? ` · อัปเดตล่าสุด ${formatDateTime(settings.updatedAt)}` : ''}
            </p>
          </div>
          <button type="button" className="secondary-button" onClick={loadSettings} disabled={loading || saving}>
            <RefreshCw size={16} />
            <span>รีเฟรช</span>
          </button>
        </div>

        {loading ? <div className="empty-inline">กำลังโหลดชุดไอคอน...</div> : null}

        {!loading ? (
          <>
            <div className="icon-variant-grid">
              {(settings?.variants || []).map((variant) => (
                <button
                  type="button"
                  key={variant.key}
                  className={selectedIconKey === variant.key ? 'icon-variant-card selected' : 'icon-variant-card'}
                  onClick={() => setSelectedIconKey(variant.key)}>
                  <span className="icon-variant-preview" style={{ background: variant.accentColor }}>
                    J
                  </span>
                  <span className="icon-variant-copy">
                    <strong>{variant.name}</strong>
                    <small>{variant.description}</small>
                  </span>
                  <span className="icon-variant-status">
                    {settings?.activeIconKey === variant.key ? 'กำลังใช้งาน' : selectedIconKey === variant.key ? 'เลือกไว้' : ''}
                  </span>
                </button>
              ))}
            </div>

            <div className="settings-action-row">
              <button
                type="button"
                className="primary-button"
                onClick={handleSave}
                disabled={saving || selectedIconKey === settings?.activeIconKey}>
                <Save size={16} />
                <span>{saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}</span>
              </button>
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}

export default AppSettingsPage;

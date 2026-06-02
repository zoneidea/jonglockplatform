import { ShieldCheck, Building2, Boxes } from 'lucide-react';
import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/auth.jsx';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login, apiBaseUrl } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(form);
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'ไม่สามารถเข้าสู่ระบบได้');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-grid">
        <section className="login-hero">
          <div className="hero-chip">เส้นทางระบบ: `/platform`</div>
          <h1>ระบบจัดการแพลตฟอร์มสำหรับดูแลทุกองค์กรในเครือข่าย</h1>
          <p>
            แยกจากระบบจัดการตลาดเดิมอย่างชัดเจน ใช้ backend ชุดเดิมผ่าน route platform
            เพื่อรองรับ subscription, support, billing และ monitoring ในระยะต่อไป
          </p>
          <div className="hero-points">
            <div className="hero-point"><ShieldCheck size={18} /><span>สิทธิ์เข้าใช้งานแพลตฟอร์มแยกจากระบบจัดการตลาด</span></div>
            <div className="hero-point"><Building2 size={18} /><span>ดูภาพรวมทุกองค์กรได้จากหน้ากลางเดียว</span></div>
            <div className="hero-point"><Boxes size={18} /><span>โครงเมนูพร้อมต่อยอดเป็นคอนโซลเต็มระบบ</span></div>
          </div>
        </section>

        <section className="login-card">
          <div className="login-card-header">
            <div className="eyebrow">Jonglock Platform Console</div>
            <h2>เข้าสู่ระบบ</h2>
            <p>{apiBaseUrl}</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>ชื่อผู้ใช้</span>
              <input
                type="text"
                value={form.username}
                onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                placeholder="ชื่อผู้ใช้ของผู้ดูแลแพลตฟอร์ม"
                autoComplete="username"
                required
              />
            </label>

            <label className="field">
              <span>รหัสผ่าน</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="••••••••••"
                autoComplete="current-password"
                required
              />
            </label>

            {error ? <div className="form-error">{error}</div> : null}

            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่แดชบอร์ด'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default LoginPage;

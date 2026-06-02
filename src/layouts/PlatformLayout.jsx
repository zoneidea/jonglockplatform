import { LogOut, PanelLeft } from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useAuth } from '../state/auth.jsx';
import jonglockLogoWhite from '../assets/jonglock-logo-white.png';

const POWERED_BY_TEXT = 'Powered by zone-idea innovation co.,ltd.';
const ROLE_LABELS = {
  platform_superadmin: 'ผู้ดูแลแพลตฟอร์มสูงสุด',
  platform_support: 'เจ้าหน้าที่ช่วยเหลือ',
  platform_billing: 'เจ้าหน้าที่การเงิน',
  platform_ops: 'เจ้าหน้าที่ปฏิบัติการ',
  platform_audit: 'ผู้ตรวจสอบ',
};

function PlatformLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const sections = useMemo(() => session?.user?.navigation || [], [session?.user?.navigation]);
  const currentMenuLabel = useMemo(() => {
    for (const section of sections) {
      const matched = section.items.find((item) => location.pathname === item.path || location.pathname.startsWith(`${item.path}/`));
      if (matched) return matched.label;
    }
    return 'ระบบจัดการแพลตฟอร์ม';
  }, [location.pathname, sections]);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="platform-shell">
      <aside className={`platform-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand-block">
          <img src={jonglockLogoWhite} alt="Jonglock ระบบจองพื้นที่ขาย" className="brand-logo" />
        </div>

        <nav className="sidebar-nav">
          {sections.map((section) => (
            <div key={section.section} className="nav-section">
              <div className="nav-section-title">{section.section}</div>
              <div className="nav-items">
                {section.items.map((item) => (
                  <NavLink
                    key={item.key}
                    to={item.path}
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="footer-user-name">{session?.user?.name || 'ผู้ใช้งานแพลตฟอร์ม'}</div>
          <div className="footer-user-role">{ROLE_LABELS[session?.user?.role] || session?.user?.role || '-'}</div>
        </div>
      </aside>

      <div className="platform-main">
        <header className="platform-topbar">
          <button
            type="button"
            className="icon-button mobile-only"
            onClick={() => setSidebarOpen((current) => !current)}>
            <PanelLeft size={18} />
          </button>
          <div>
            <div className="topbar-title">{currentMenuLabel}</div>
            <div className="topbar-subtitle">Jonglock Platform Console</div>
          </div>
          <button type="button" className="logout-button" onClick={handleLogout}>
            <LogOut size={16} />
            <span>ออกจากระบบ</span>
          </button>
        </header>

        <main className="platform-content">
          <Outlet />
        </main>

        <footer className="platform-footer">{POWERED_BY_TEXT}</footer>
      </div>
    </div>
  );
}

export default PlatformLayout;

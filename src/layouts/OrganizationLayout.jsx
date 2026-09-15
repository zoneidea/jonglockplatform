import { Link, NavLink, Outlet, useParams } from 'react-router-dom';
import '../styles/organizations.css';

export default function OrganizationLayout() {
  const { organizationId } = useParams();
  const base = `/organizations/${organizationId}`;
  return <div className="org-workspace">
    <Link to="/organizations" className="table-link-button">← รายการองค์กรทั้งหมด</Link>
    <nav className="org-tabs" aria-label="จัดการองค์กร">
      <NavLink to={base} end>ข้อมูลองค์กร</NavLink>
      <NavLink to={`${base}/markets`}>ตลาดขององค์กร</NavLink>
      <NavLink to={`${base}/users`}>ผู้ใช้งานองค์กร</NavLink>
      <NavLink to={`${base}/reports`}>รายงาน</NavLink>
    </nav>
    <Outlet key={organizationId} />
  </div>;
}

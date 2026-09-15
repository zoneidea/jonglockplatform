import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useOrganizationData from '../hooks/useOrganizationData.js';
import OrganizationTable from '../components/organizations/OrganizationTable.jsx';
import OrganizationUserDialog from '../components/organizations/OrganizationUserDialog.jsx';
import { formatDateTime, getStatusLabel, ROLE_LABELS } from '../utils/platform-format.js';

export default function OrganizationUsersPage() {
  const { organizationId } = useParams();
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState('');
  const state = useOrganizationData(`/organizations/${organizationId}/users?page=${page}`, revision);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 2000); return () => clearTimeout(timer); }, [notice]);
  return <>
    <div className="page-header"><div><h1>ผู้ใช้งานองค์กร</h1><p>บัญชีเจ้าหน้าที่ supervisor / admin / accounting / audit · องค์กร #{organizationId}</p></div></div>
    <p className="org-notice">ปิดใช้งานเพื่อระงับการล็อกอินใหม่ โดย session เดิมยังใช้งานได้จน token หมดอายุ</p>
    {notice ? <div className="org-success" role="status">{notice}</div> : null}
    <OrganizationTable {...state} columns={['ผู้ใช้งาน', 'บทบาท', 'สถานะ', 'เข้าใช้ล่าสุด', 'จัดการ']} onPage={setPage} onRetry={() => setRevision((n) => n + 1)}>
      {state.data?.items.map((user) => <tr key={user.id}>
        <td><strong>{user.name || '-'}</strong><small>#{user.id} · {user.email || '-'}</small></td><td>{ROLE_LABELS[user.role] || user.role}</td><td>{getStatusLabel(user.status)}</td><td>{formatDateTime(user.lastLoginAt)}</td>
        <td>{state.data.canManage ? <div className="org-actions"><button type="button" className="secondary-button" onClick={() => setSelected({ user, action: 'password' })}>รีเซ็ตรหัสผ่าน</button><button type="button" className="secondary-button" onClick={() => setSelected({ user, action: 'status' })}>{user.status === 'active' ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}</button></div> : 'ดูข้อมูลเท่านั้น'}</td>
      </tr>)}
    </OrganizationTable>
    {selected ? <OrganizationUserDialog organizationId={organizationId} {...selected} onClose={() => setSelected(null)} onSaved={(message) => { setSelected(null); setNotice(message); setRevision((n) => n + 1); }} /> : null}
  </>;
}

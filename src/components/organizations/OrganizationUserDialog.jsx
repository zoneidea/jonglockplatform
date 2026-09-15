import { useEffect, useRef, useState } from 'react';
import { request } from '../../api/client.js';
import { useAuth } from '../../state/auth.jsx';

export default function OrganizationUserDialog({ organizationId, user, action, onClose, onSaved }) {
  const { session } = useAuth();
  const dialog = useRef(null);
  const lock = useRef(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const reset = action === 'password';
  const title = reset ? 'รีเซ็ตรหัสผ่าน' : user.status === 'active' ? 'ปิดใช้งานผู้ใช้' : 'เปิดใช้งานผู้ใช้';
  useEffect(() => { dialog.current.showModal(); }, []);

  async function save(event) {
    event.preventDefault();
    if (lock.current) return;
    if (reset && (password !== confirmation || password.length < 10 || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password) || new TextEncoder().encode(password).length > 72)) {
      setError('รหัสผ่านต้องตรงกัน ยาวอย่างน้อย 10 ตัว มีตัวพิมพ์ใหญ่ ตัวเลข อักขระพิเศษ และไม่เกิน 72 ไบต์');
      return;
    }
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      await request(`/organizations/${organizationId}/users/${user.id}`, {
        token: session.token, method: 'PATCH', body: reset ? { password } : { status: user.status === 'active' ? 'inactive' : 'active' },
      });
      onSaved(`${title}สำเร็จ`);
    } catch (failure) {
      setError(failure.message || 'บันทึกไม่สำเร็จ กรุณาตรวจสอบข้อมูลและลองใหม่');
      lock.current = false;
      setBusy(false);
    }
  }

  return <dialog ref={dialog} className="org-user-dialog" aria-labelledby="org-user-dialog-title" onCancel={(event) => { event.preventDefault(); if (!lock.current) onClose(); }}>
    <form onSubmit={save}>
      <h2 id="org-user-dialog-title">{title}</h2><p>{user.name || '-'} · ผู้ใช้ #{user.id}</p>
      <p className="org-notice">การเปลี่ยนแปลงมีผลต่อการล็อกอินครั้งถัดไป ไม่ยกเลิก session เดิมจนกว่า token จะหมดอายุ</p>
      {reset ? <>
        <label className="field"><span>รหัสผ่านใหม่</span><input autoFocus type="password" autoComplete="new-password" required minLength={10} value={password} disabled={busy} onChange={(e) => setPassword(e.target.value)} /></label>
        <label className="field"><span>ยืนยันรหัสผ่านใหม่</span><input type="password" autoComplete="new-password" required minLength={10} value={confirmation} disabled={busy} onChange={(e) => setConfirmation(e.target.value)} /></label>
        <p>อย่างน้อย 10 ตัว มีตัวพิมพ์ใหญ่ ตัวเลข และอักขระพิเศษ</p>
      </> : <p>ยืนยัน{title}รายนี้หรือไม่?</p>}
      {error ? <p role="alert" className="form-error">{error}</p> : null}
      <div className="org-actions"><button type="button" className="secondary-button" disabled={busy} onClick={onClose}>ยกเลิก</button><button className="primary-button" disabled={busy}>{busy ? 'กำลังบันทึก...' : 'ยืนยัน'}</button></div>
    </form>
  </dialog>;
}

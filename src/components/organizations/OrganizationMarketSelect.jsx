import { useEffect, useState } from 'react';
import { request } from '../../api/client.js';
import { useAuth } from '../../state/auth.jsx';

export default function OrganizationMarketSelect({ organizationId, value, onChange }) {
  const { session } = useAuth();
  const [markets, setMarkets] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let current = true;
    setMarkets([]); setError(''); setLoading(true);
    async function load() {
      const all = [];
      let page = 1;
      while (current) {
        const { data } = await request(`/organizations/${organizationId}/markets?page=${page}&pageSize=100`, { token: session.token });
        if (!current) return;
        all.push(...data.items);
        if (page >= data.pagination.totalPages) break;
        page += 1;
      }
      if (current) { setMarkets(all); setLoading(false); }
    }
    load().catch((e) => { if (current) { setError(e.message); setLoading(false); } });
    return () => { current = false; };
  }, [organizationId, session.token, revision]);
  return <div><label className="field"><span>ตลาด</span><select value={value} disabled={loading || Boolean(error)} onChange={(e) => onChange(e.target.value)}><option value="">{loading ? 'กำลังโหลดตลาด...' : 'ทุกตลาด'}</option>{markets.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.code})</option>)}</select></label>{error ? <div role="alert">{error} <button type="button" onClick={() => setRevision((n) => n + 1)}>โหลดตลาดใหม่</button></div> : null}</div>;
}

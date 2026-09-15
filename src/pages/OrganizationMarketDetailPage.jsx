import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import useOrganizationData from '../hooks/useOrganizationData.js';
import OrganizationTable from '../components/organizations/OrganizationTable.jsx';
import { formatAmount, formatDate, getStatusLabel } from '../utils/platform-format.js';

export default function OrganizationMarketDetailPage() {
  const { organizationId, marketId } = useParams();
  const [zonePage, setZonePage] = useState(1);
  const [boothPage, setBoothPage] = useState(1);
  const [zone, setZone] = useState(null);
  const [revision, setRevision] = useState(0);
  const base = `/organizations/${organizationId}/markets/${marketId}`;
  const zones = useOrganizationData(`${base}/zones?page=${zonePage}`, revision);
  const booths = useOrganizationData(`${base}/booths?page=${boothPage}${zone ? `&zoneId=${zone.id}` : ''}`, revision);
  const retry = () => setRevision((n) => n + 1);
  return <>
    <div className="page-header"><div><h1>{zones.data?.market.name || 'โซนและบูธของตลาด'}</h1><p>องค์กร #{organizationId} · ตลาด #{marketId}</p></div><Link className="secondary-button" to={`/organizations/${organizationId}/markets`}>กลับรายการตลาด</Link></div>
    <h2>โซน / แผนผัง</h2>
    <OrganizationTable {...zones} columns={['โซน', 'ช่วงวันที่', 'สถานะ', 'บูธ']} onPage={setZonePage} onRetry={retry}>
      {zones.data?.items.map((item) => <tr key={item.id}><td>{item.name}</td><td>{formatDate(item.startDate)} – {formatDate(item.endDate)}</td><td>{getStatusLabel(item.status)}</td><td><button type="button" className="table-link-button" onClick={() => { setZone(item); setBoothPage(1); }}>ดูบูธ ({item.boothCount})</button></td></tr>)}
    </OrganizationTable>
    <div className="org-section-heading"><h2>บูธ: {zone?.name || 'ทุกโซน รวมไม่ระบุโซน'}</h2>{zone ? <button className="secondary-button" onClick={() => { setZone(null); setBoothPage(1); }}>แสดงทุกโซน</button> : null}</div>
    <OrganizationTable {...booths} columns={['บูธ', 'โซน', 'ราคา', 'สถานะ']} onPage={setBoothPage} onRetry={retry}>
      {booths.data?.items.map((item) => <tr key={item.id}><td><strong>{item.code}</strong><small>{item.name}</small></td><td>{item.zoneName}</td><td>{formatAmount(item.price)}</td><td>{item.status === 'maintenance' ? 'ปรับปรุง' : getStatusLabel(item.status)}</td></tr>)}
    </OrganizationTable>
  </>;
}

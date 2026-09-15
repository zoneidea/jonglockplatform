import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import useOrganizationData from '../hooks/useOrganizationData.js';
import OrganizationTable from '../components/organizations/OrganizationTable.jsx';
import { getStatusLabel } from '../utils/platform-format.js';

export default function OrganizationMarketsPage() {
  const { organizationId } = useParams();
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const state = useOrganizationData(`/organizations/${organizationId}/markets?page=${page}`, revision);
  return <>
    <div className="page-header"><div><h1>ตลาดขององค์กร</h1><p>แสดงทุกตลาด รวมตลาดที่ปิดใช้งาน · องค์กร #{organizationId}</p></div></div>
    <OrganizationTable {...state} columns={['ตลาด', 'สถานะ', 'โซน / บูธ', 'จัดการ']} onPage={setPage} onRetry={() => setRevision((n) => n + 1)}>
      {state.data?.items.map((market) => <tr key={market.id}>
        <td><strong>{market.name}</strong><small>{market.code}</small></td>
        <td>{getStatusLabel(market.status)}</td><td>{market.zoneCount} โซน / {market.boothCount} บูธ</td>
        <td><Link className="table-link-button" to={`/organizations/${organizationId}/markets/${market.id}`}>ดูโซนและบูธ</Link></td>
      </tr>)}
    </OrganizationTable>
  </>;
}

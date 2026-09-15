import { useEffect, useState } from 'react';
import { request } from '../api/client.js';
import { useAuth } from '../state/auth.jsx';

export default function useOrganizationData(path, revision = 0) {
  const { session } = useAuth();
  const [state, setState] = useState({ path: '', data: null, loading: true, error: '' });
  useEffect(() => {
    let current = true;
    setState({ path, data: null, loading: true, error: '' });
    request(path, { token: session.token }).then((response) => {
      if (current) setState({ path, data: response.data, loading: false, error: '' });
    }).catch((error) => {
      if (current) setState({ path, data: null, loading: false, error: error.message || 'โหลดข้อมูลไม่สำเร็จ' });
    });
    return () => { current = false; };
  }, [path, revision, session.token]);
  return state.path === path ? state : { data: null, loading: true, error: '' };
}

import { useCallback, useEffect, useState } from 'react';
export function useFetch(fetcher, dependencies = []) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const reload = useCallback(async () => {
    setLoading(true); setError('');
    try { setData(await fetcher()); } catch (reason) { setError(reason.message); } finally { setLoading(false); }
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { reload(); }, [reload]);
  return { data, loading, error, reload, setData };
}


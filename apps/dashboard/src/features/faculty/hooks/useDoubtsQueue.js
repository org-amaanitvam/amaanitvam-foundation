import { useState, useEffect } from 'react';
import { fetchAssignedDoubts } from '../services/doubtsApi';

export function useDoubtsQueue(facultyId, status = '', token) {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!facultyId || !token) return;

    let isMounted = true;
    setLoading(true);

    fetchAssignedDoubts(facultyId, status, token)
      .then((data) => {
        if (isMounted) {
          setDoubts(data?.data || []);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) setError(err?.message || 'Failed to fetch doubts');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [facultyId, status, token]);

  return { doubts, setDoubts, loading, error };
}

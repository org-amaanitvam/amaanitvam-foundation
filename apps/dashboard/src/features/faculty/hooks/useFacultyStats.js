import { useState, useEffect } from 'react';
import { fetchFacultyStats } from '../services/facultyApi';

export function useFacultyStats(facultyId, token) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!facultyId || !token) return;

    let isMounted = true;
    setLoading(true);

    fetchFacultyStats(facultyId, token)
      .then((data) => {
        if (isMounted) {
          setStats(data?.stats || null);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) setError(err?.message || 'Failed to fetch stats');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [facultyId, token]);

  return { stats, loading, error };
}

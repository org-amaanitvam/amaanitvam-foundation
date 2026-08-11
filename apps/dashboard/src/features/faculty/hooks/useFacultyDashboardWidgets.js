import { useState, useEffect } from 'react';
import { fetchFacultySessions } from '../services/sessionsApi';
import { fetchFacultyPunchHistory } from '../services/attendanceApi';
import { fetchAnnouncements } from '../services/announcementsApi';
import { fetchApplications } from '../services/applicationsApi';

/**
 * Custom hook to export upcoming live sessions with real-time 15s polling
 */
export function useUpcomingSessions(facultyId) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchFacultySessions(facultyId || 'faculty-current');
        if (res.success && res.meetings) {
          const upcoming = res.meetings.filter(
            (m) => m.status !== 'completed' && new Date(m.endTime || m.startTime) >= new Date()
          );
          setSessions(upcoming.slice(0, 3));
        }
      } catch (err) {
        console.warn('[useUpcomingSessions] Failed to load upcoming sessions:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 15000); // 15s polling
    return () => clearInterval(interval);
  }, [facultyId]);

  return { sessions, loading };
}

/**
 * Custom hook to export faculty self-punch status with real-time 10s polling
 */
export function useTodayPunchStatus(userId) {
  const [todayLog, setTodayLog] = useState(null);
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchFacultyPunchHistory(userId || 'faculty-current');
        if (res.success && res.history) {
          const today = new Date().toISOString().split('T')[0];
          const log = res.history.find((h) => h.date === today);
          setTodayLog(log || null);
          setIsPunchedIn(Boolean(log && !log.punchOut));
        }
      } catch (err) {
        console.warn('[useTodayPunchStatus] Failed to load punch status:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 10000); // 10s polling
    return () => clearInterval(interval);
  }, [userId]);

  return { todayLog, isPunchedIn, loading };
}

/**
 * Custom hook to export recent announcements feed with real-time 15s polling
 */
export function useRecentAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchAnnouncements();
        if (res.success && res.announcements) {
          setAnnouncements(res.announcements.slice(0, 4));
        }
      } catch (err) {
        console.warn('[useRecentAnnouncements] Failed to load announcements:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 15000); // 15s polling
    return () => clearInterval(interval);
  }, []);

  return { announcements, loading };
}

/**
 * Custom hook to export pending candidate applications count with real-time 15s polling
 */
export function usePendingApplicationsCount() {
  const [count, setCount] = useState(3);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchApplications();
        if (res.success && res.applications) {
          const pending = res.applications.filter((a) => a.status === 'pending').length;
          setCount(pending);
        }
      } catch (err) {
        console.warn('[usePendingApplicationsCount] Failed to load applications:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 15000); // 15s polling
    return () => clearInterval(interval);
  }, []);

  return { count, loading };
}

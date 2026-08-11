import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  BookOpen,
  TrendingUp,
  MessageCircleQuestion,
  Download,
  CalendarDays,
} from 'lucide-react';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { fetchFacultyStats, MOCK_FACULTY_STATS } from '../services/facultyApi';

const PIE_COLORS = ['#8a164b', '#e8d5dc'];
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-[#eadde2] bg-white px-4 py-3 shadow-xl">
      <p className="mb-2 text-sm font-bold text-[#5d0f2d]">
        {label}
      </p>
      {payload.map((item) => (
        <div
          key={item.dataKey}
          className="flex items-center justify-between gap-5 text-xs"
        >
          <span className="text-gray-500">
            {item.name}
          </span>

          <span className="font-bold text-[#5d0f2d]">
            {item.value}%
          </span>
        </div>
      ))}
    </div>
  );
}

export default function FacultyAnalytics() {
  const [statsData, setStatsData] = useState(MOCK_FACULTY_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchFacultyStats();
        if (res.success && res.stats) {
          setStatsData(res.stats);
        }
      } catch (err) {
        console.warn('[FacultyAnalytics] Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const performanceData = statsData.performanceData || MOCK_FACULTY_STATS.performanceData;
  const monthlyData = statsData.monthlyData || MOCK_FACULTY_STATS.monthlyData;
  const doubtData = statsData.doubtData || MOCK_FACULTY_STATS.doubtData;
  return (
    <div className="animate-fade-in min-h-full bg-[#faf7f8] px-5 py-8 lg:px-8">
      {/* ================= HEADER ================= */}
      <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f4e4ea]">
            <BarChart3 className="h-6 w-6 text-[#8a164b]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#5d0f2d]">
              Teaching & Course Analytics
            </h1>
            <p className="mt-1 text-sm text-[#76666b]">
              Track student engagement, course completion, and doubt resolution SLA.
            </p>
          </div>
        </div>

        {/* Time Filter */}
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl border border-[#eadde2] bg-white px-4 py-2.5 text-sm font-semibold text-[#8a164b] shadow-sm transition hover:bg-[#fff8fa]"
        >
          <CalendarDays className="h-4 w-4" />
          This Month
        </button>
      </div>

      {/* ================= KPI CARDS ================= */}
      <div className="mb-7 grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* Student Engagement */}
        <div className="rounded-2xl border border-[#eadde2] border-t-4 border-t-[#8a164b] bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#76666b]">
                Student Engagement
              </p>
              <h2 className="mt-4 font-[var(--font-heading)] text-4xl font-bold text-[#5d0f2d]">
                92.4%
              </h2>
              <div className="mt-2 flex items-center gap-1 text-xs font-bold text-emerald-600">
                <TrendingUp className="h-3.5 w-3.5" />
                +8.2% this month
              </div>
            </div>

            <div className="rounded-xl bg-[#f7e8ed] p-3">
              <Users className="h-5 w-5 text-[#8a164b]" />
            </div>
          </div>
        </div>

        {/* Course Completion */}
        <div className="rounded-2xl border border-[#eadde2] border-t-4 border-t-[#d8a15f] bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#76666b]">
                Course Completion
              </p>
              <h2 className="mt-4 font-[var(--font-heading)] text-4xl font-bold text-[#5d0f2d]">
                87.6%
              </h2>
              <div className="mt-2 text-xs font-bold text-emerald-600">
                +4.7% this month
              </div>
            </div>
            <div className="rounded-xl bg-[#f8ecd8] p-3">
              <BookOpen className="h-5 w-5 text-[#b98243]" />
            </div>
          </div>
        </div>

        {/* Doubt Resolution */}
        <div className="rounded-2xl border border-[#eadde2] border-t-4 border-t-emerald-500 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#76666b]">
                Doubt Resolution
              </p>
              <h2 className="mt-4 font-[var(--font-heading)] text-4xl font-bold text-[#5d0f2d]">
                94.1%
              </h2>
              <div className="mt-2 text-xs font-bold text-emerald-600">
                Within SLA
              </div>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3">
              <MessageCircleQuestion className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* ================= MAIN BAR CHART ================= */}
      <div className="mb-7 rounded-2xl border border-[#eadde2] bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h2 className="font-[var(--font-heading)] text-2xl font-bold text-[#5d0f2d]">
              Course Performance Overview
            </h2>
            <p className="mt-1 text-sm text-[#76666b]">
              Compare engagement, completion and doubt resolution across your courses.
            </p>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 self-start rounded-lg border border-[#eadde2] px-4 py-2 text-xs font-bold text-[#8a164b] transition hover:bg-[#fff7f9]"
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
        <div className="h-[390px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={performanceData}
              margin={{
                top: 10,
                right: 20,
                left: 0,
                bottom: 10,
              }}
              barGap={8}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#eee3e7"
                vertical={false}
              />
              <XAxis
                dataKey="course"
                tick={{
                  fill: '#76666b',
                  fontSize: 12,
                  fontWeight: 600,
                }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                domain={[0, 100]}
                tick={{
                  fill: '#76666b',
                  fontSize: 11,
                }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{
                  fontSize: '12px',
                  paddingTop: '15px',
                }}
              />
              <Bar
                dataKey="engagement"
                name="Engagement"
                fill="#8a164b"
                radius={[6, 6, 0, 0]}
                maxBarSize={24}
              />
              <Bar
                dataKey="completion"
                name="Completion"
                fill="#d8a15f"
                radius={[6, 6, 0, 0]}
                maxBarSize={24}
              />
              <Bar
                dataKey="doubts"
                name="Doubt Resolution"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
                maxBarSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* ================= SECONDARY VISUALS ================= */}
      <div className="grid grid-cols-1 gap-7 xl:grid-cols-3">
        {/* Student Growth */}
        <div className="rounded-2xl border border-[#eadde2] bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-5">
            <h2 className="font-[var(--font-heading)] text-xl font-bold text-[#5d0f2d]">
              Student Enrollment Growth
            </h2>
            <p className="mt-1 text-sm text-[#76666b]">
              Total students enrolled across your courses.
            </p>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#eee3e7"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#76666b',
                    fontSize: 12,
                  }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#76666b',
                    fontSize: 11,
                  }}
                />
                <Tooltip />
                <Bar
                  dataKey="students"
                  name="Students"
                  fill="#5d0f2d"
                  radius={[7, 7, 0, 0]}
                  maxBarSize={42}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Resolution Visual */}
        <div className="rounded-2xl border border-[#eadde2] bg-white p-6 shadow-sm">
          <h2 className="font-[var(--font-heading)] text-xl font-bold text-[#5d0f2d]">
            Doubt Resolution
          </h2>
          <p className="mt-1 text-sm text-[#76666b]">
            Current resolution performance.
          </p>
          <div className="relative mt-4 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={doubtData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={4}
                  startAngle={90}
                  endAngle={-270}
                >

                  {doubtData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index]}
                    />
                  ))}

                </Pie>

                <Tooltip />

              </PieChart>

            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">

              <span className="font-[var(--font-heading)] text-3xl font-bold text-[#5d0f2d]">
                94%
              </span>

              <span className="text-xs font-semibold text-[#76666b]">
                Resolved
              </span>

            </div>

          </div>

          <div className="mt-2 flex justify-center gap-5 text-xs">

            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#8a164b]" />
              <span className="text-gray-600">
                Resolved 94%
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#e8d5dc]" />
              <span className="text-gray-600">
                Pending 6%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
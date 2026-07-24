import {
  TrendingUp,
  Users,
  ClipboardList,
  FolderKanban,
  CheckCircle2,
  CalendarCheck,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";

import CountUp from "react-countup";

export default function GrowthAnalytics({
  openTasks,
  completedTasks,
  totalProjects,
  totalMembers = 0,
}) {

const taskData = [
  { month: "Jan", completed: 18, pending: 8 },
  { month: "Feb", completed: 22, pending: 12 },
  { month: "Mar", completed: 28, pending: 10 },
  { month: "Apr", completed: 35, pending: 9 },
  { month: "May", completed: 42, pending: 7 },
  { month: "Jun", completed: completedTasks, pending: openTasks },
];

const radialData = [
  {
    name: "Efficiency",
    value:
      Math.round(
        (completedTasks /
          ((completedTasks + openTasks) || 1)) * 100
      ),
    fill: "#56051a",
  },
];

  const sparkline = [
  { value: 20 },
  { value: 28 },
  { value: 24 },
  { value: 38 },
  { value: 35 },
  { value: 48 },
  { value: 56 },
  { value: 52 },
  { value: 70 },
  { value: 84 },
];

  const COLORS = [
  "#7a1921",
  "#d8a15f",
  "#16a34a",
  "#2563eb",
  "#9333ea",
];
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
  {[
    {
      title: "Members",
      value: totalMembers,
      icon: Users,
      change: "+12%",
      progress: 82,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Projects",
      value: totalProjects,
      icon: FolderKanban,
      change: "+8%",
      progress: 72,
      gradient: "from-[#56051a] to-[#d8a15f]",
    },
    {
      title: "Open Tasks",
      value: openTasks,
      icon: ClipboardList,
      change: "+3%",
      progress: 48,
      gradient: "from-orange-500 to-yellow-400",
    },
    {
      title: "Completed",
      value: completedTasks,
      icon: CheckCircle2,
      change: "+18%",
      progress: 94,
      gradient: "from-green-500 to-emerald-400",
    },
  ].map((card) => {
    const Icon = card.icon;
    return (
      <div
        key={card.title}
        className="relative overflow-hidden rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 p-6"
      >
        <div
          className={`absolute left-0 top-0 h-1 w-full bg-linear-to-r ${card.gradient}`}
        />
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-500 text-sm font-medium">
              {card.title}
            </p>
            <h2 className="text-4xl font-bold mt-3 text-slate-900">
              <CountUp
                end={card.value}
                duration={2}
              />
            </h2>
            <div className="flex items-center gap-2 mt-3">
              <div className="bg-green-100 text-green-700 rounded-full px-3 py-1 text-xs font-semibold">
                ↑ {card.change}
              </div>
              <span className="text-xs text-slate-400">
                vs last month
              </span>
            </div>
          </div>
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-linear-to-r ${card.gradient} text-white shadow-lg`}
          >
            <Icon size={28} />
          </div>
        </div>
        <div className="mt-6">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>Monthly Target</span>
            <span>{card.progress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              style={{
                width: `${card.progress}%`,
              }}
              className={`h-full rounded-full bg-linear-to-r ${card.gradient}`}
            />
          </div>
        </div>
        <div className="h-16 mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkline}>
              <defs>
                <linearGradient
                  id={`gradient-${card.title}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="#56051a"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="95%"
                    stopColor="#56051a"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke="#56051a"
                strokeWidth={3}
                fill={`url(#gradient-${card.title})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  })}

</div>

      <div className="grid lg:grid-cols-2 gap-8 mt-10">
        <div className="bg-slate-50 rounded-3xl border border-slate-100 p-6 min-h-105 shadow-sm hover:shadow-lg transition flex flex-col">
<div className="flex items-center justify-between mb-5">
  <div>
    <h3 className="font-bold text-lg text-slate-900">
      Task Overview
    </h3>

    <p className="text-sm text-slate-500">
      Monthly task performance
    </p>
  </div>

  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
    ↑ 18%
  </span>
</div>

          <ResponsiveContainer width="100%" height="100%">
<BarChart
  data={taskData}
  margin={{
    top: 20,
    right: 20,
    left: -20,
    bottom: 10,
  }}
>
  <defs>
    <linearGradient id="taskGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#56051a" />
      <stop offset="100%" stopColor="#d8a15f" />
    </linearGradient>
  </defs>

<CartesianGrid
  strokeDasharray="4 4"
  stroke="#edf2f7"
/>

<XAxis
  dataKey="month"
  tickLine={false}
  axisLine={false}
  tick={{
    fill: "#64748b",
    fontSize: 13,
    fontWeight: 600,
  }}
/>

<YAxis
  tickLine={false}
  axisLine={false}
  tick={{
    fill: "#94a3b8",
  }}
/>

<Tooltip
  contentStyle={{
    borderRadius: 16,
    border: "none",
    background: "#fff",
    boxShadow: "0 15px 35px rgba(0,0,0,.15)",
  }}
/>

<Legend />

<Bar
  dataKey="completed"
  radius={[12, 12, 0, 0]}
  fill="#56051a"
  animationDuration={1800}
/>

<Bar
  dataKey="pending"
  radius={[12, 12, 0, 0]}
  fill="#d8a15f"
  animationDuration={1800}
/>
</BarChart>
          </ResponsiveContainer>

        </div>
        <div className="bg-slate-50 rounded-3xl border border-slate-100 p-6 min-h-[420px] shadow-sm hover:shadow-lg transition flex flex-col">
<div className="flex justify-between items-center mb-5">
  <div>
    <h3 className="text-lg font-bold text-slate-800">
      Task Performance
    </h3>

    <p className="text-sm text-slate-500">
      Current workload overview
    </p>
  </div>

  <div className="px-3 py-1 rounded-full bg-[#56051a]/10 text-[#56051a] text-xs font-semibold">
    Live
  </div>
</div>

<div className="flex-1 flex items-center justify-center">
  <ResponsiveContainer width="100%" height={320}>
<RadialBarChart
  innerRadius={75}
  outerRadius={110}
  data={radialData}
  startAngle={90}
  endAngle={-270}
>
  <PolarAngleAxis
    type="number"
    domain={[0, 100]}
    tick={false}
  />

  <RadialBar
    dataKey="value"
    background
    cornerRadius={12}
    clockWise
    animationDuration={1800}
  />

  <text
    x="50%"
    y="48%"
    textAnchor="middle"
    dominantBaseline="middle"
  >
    <tspan
      fontSize="36"
      fontWeight="700"
      fill="#56051a"
    >
      {radialData[0].value}%
    </tspan>

    <tspan
      x="50%"
      dy="24"
      fontSize="14"
      fill="#64748b"
    >
      Efficiency
    </tspan>
  </text>

  <Tooltip
    contentStyle={{
      borderRadius:14,
      border:"none",
      boxShadow:"0 12px 30px rgba(0,0,0,.15)",
    }}
  />

</RadialBarChart>
          </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Recent Activity */}

<div className="mt-10 bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

  <div className="flex justify-between items-center mb-6">

    <div>
      <h2 className="text-xl font-bold text-slate-900">
        Recent Activity
      </h2>

      <p className="text-sm text-slate-500">
        Latest updates across your organisation
      </p>
    </div>

    <span className="px-4 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
      Live
    </span>

  </div>

  <div className="space-y-5">

    {[
      {
        title: "New volunteer joined",
        time: "5 mins ago",
        color: "bg-green-500",
      },
      {
        title: "Blood Donation Camp created",
        time: "20 mins ago",
        color: "bg-[#56051a]",
      },
      {
        title: "12 tasks completed",
        time: "1 hour ago",
        color: "bg-blue-500",
      },
      {
        title: "Project approved",
        time: "Today",
        color: "bg-amber-500",
      },
      {
        title: "Meeting scheduled",
        time: "Tomorrow",
        color: "bg-purple-500",
      },
    ].map((item, index) => (

      <div
        key={index}
        className="flex items-center gap-4"
      >

        <div className="relative">
          <div
            className={`w-4 h-4 rounded-full ${item.color}`}
          />

          {index !== 4 && (
            <div className="absolute left-1.5 top-4 h-12 w-0.5 bg-slate-200" />
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-slate-800">
            {item.title}
          </h4>
          <p className="text-sm text-slate-500">
            {item.time}
          </p>
        </div>
      </div>
    ))}
  </div>
</div>
    </div>
  );
}
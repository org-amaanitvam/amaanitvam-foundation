import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function AnalyticsCharts({
  openTasks,
  completedTasks,
  projects,
}) {
  const taskData = [
    {
      name: "Open",
      value: openTasks,
    },
    {
      name: "Completed",
      value: completedTasks,
    },
  ];

  const projectData = [
    {
      name: "Completed",
      value: projects.filter(p => p.status === "completed").length,
    },
    {
      name: "Ongoing",
      value: projects.filter(p => p.status === "ongoing").length,
    },
    {
      name: "Planning",
      value: projects.filter(p => p.status === "planning").length,
    },
  ];

  const COLORS = [
  "#7a1921",
  "#d8a15f",
  "#16a34a",
  "#2563eb",
  "#9333ea",
];

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <h2 className="font-bold text-lg mb-5">
          Task Analytics
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
  data={taskData}
  margin={{
    top: 10,
    right: 20,
    left: -20,
    bottom: 0,
  }}
>
  <XAxis
    dataKey="name"
    axisLine={false}
    tickLine={false}
  />

  <Tooltip
    cursor={{ fill: "#f8fafc" }}
    contentStyle={{
      borderRadius: 14,
      border: "none",
      boxShadow: "0 12px 25px rgba(0,0,0,.12)",
    }}
  />

  <Bar
    dataKey="value"
    radius={[12, 12, 0, 0]}
  >
    <Cell fill="#7a1921" />
    <Cell fill="#d8a15f" />
  </Bar>
</BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <h2 className="font-bold text-lg mb-5">
          Project Status
        </h2>

        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
  data={projectData}
  dataKey="value"
  innerRadius={50}
  outerRadius={90}
  paddingAngle={3}
  label
>
              {projectData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
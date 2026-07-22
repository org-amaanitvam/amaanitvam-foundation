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
    "#56051a",
    "#d8a15f",
    "#10b981",
  ];

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <h2 className="font-bold text-lg mb-5">
          Task Analytics
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={taskData}>
            <XAxis dataKey="name" />
            <Tooltip />
            <Bar
              dataKey="value"
              fill="#56051a"
              radius={[6, 6, 0, 0]}
            />
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
              outerRadius={90}
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
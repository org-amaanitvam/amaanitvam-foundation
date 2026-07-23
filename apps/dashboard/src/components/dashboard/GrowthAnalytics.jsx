import {
  TrendingUp,
  Users,
  ClipboardList,
  FolderKanban,
  CalendarCheck,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function GrowthAnalytics({
  openTasks,
  completedTasks,
  totalProjects,
  totalMembers = 0,
}) {
  const cards = [
    {
      title: "Members",
      value: totalMembers,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Projects",
      value: totalProjects,
      icon: FolderKanban,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Completed Tasks",
      value: completedTasks,
      icon: CalendarCheck,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Open Tasks",
      value: openTasks,
      icon: ClipboardList,
      color: "bg-red-50 text-red-600",
    },
  ];

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
      name: "Projects",
      value: totalProjects,
    },
    {
      name: "Tasks",
      value: openTasks + completedTasks,
    },
  ];

  const COLORS = ["#7a1921", "#d8a15f"];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">

      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-[#56051a]" />
        <h2 className="text-xl font-bold text-slate-900">
          Growth Analytics
        </h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-xl border border-slate-100 p-5 hover:shadow-md transition"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}
              >
                <Icon size={22} />
              </div>

              <h3 className="mt-4 text-3xl font-bold">
                {card.value}
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                {card.title}
              </p>
            </div>
          );
        })}

      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="h-72">
          <h3 className="font-semibold mb-4">
            Task Overview
          </h3>

          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={taskData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="value"
                fill="#7a1921"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>

        </div>
        <div className="h-72">
          <h3 className="font-semibold mb-4">
            Projects Distribution
          </h3>

          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={projectData}
                dataKey="value"
                outerRadius={90}
                label
              >
                {projectData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
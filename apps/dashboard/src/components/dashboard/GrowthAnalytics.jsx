import { TrendingUp, Users, ClipboardList, FolderKanban, CalendarCheck } from "lucide-react";

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

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-[#56051a]" />
        <h2 className="text-xl font-bold text-slate-900">
          Growth Analytics
        </h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">

        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="rounded-xl border border-slate-100 p-5 hover:shadow-md transition"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}>
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

    </div>
  );
}
import {
Users,
FolderKanban,
ClipboardList,
CheckCircle2,
ResponsiveContainer,
AreaChart,
Area,
} from "lucide-react";

<div className="grid grid-cols-2 xl:grid-cols-4 gap-6">

{[
{
title:"Members",
value:members.length,
change:"+12%",
progress:82,
icon:Users,
gradient:"from-blue-500 to-cyan-400"
},

{
title:"Projects",
value:projects.length,
change:"+8%",
progress:70,
icon:FolderKanban,
gradient:"from-purple-500 to-pink-400"
},

{
title:"Open Tasks",
value:openTasks,
change:"+3%",
progress:45,
icon:ClipboardList,
gradient:"from-orange-500 to-yellow-400"
},

{
title:"Completed",
value:completedTasks,
change:"+18%",
progress:95,
icon:CheckCircle2,
gradient:"from-green-500 to-emerald-400"
}

].map((card)=>{

const Icon=card.icon;

return(

<div
key={card.title}
className="relative overflow-hidden rounded-3xl p-6 bg-white border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 duration-300"
>

<div
className={`absolute inset-x-0 top-0 h-1 bg-linear-to-r ${card.gradient}`}
/>

<div className="flex justify-between">

<div>

<p className="text-slate-500 text-sm">

{card.title}

</p>

<h2 className="text-4xl font-bold mt-3">

{card.value}

</h2>

<div className="flex items-center gap-2 mt-3">

<span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">

{card.change}

</span>

<span className="text-xs text-slate-400">

vs last month

</span>

</div>

</div>

<div
className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-linear-to-r ${card.gradient} text-white shadow-lg`}
>

<Icon size={28}/>

</div>

</div>

<div className="mt-6">

<div className="flex justify-between text-xs text-slate-500 mb-2">

<span>Target</span>

<span>{card.progress}%</span>

</div>

<div className="w-full h-2 rounded-full bg-slate-100">

<div
style={{width:`${card.progress}%`}}
className={`h-2 rounded-full bg-linear-to-r ${card.gradient}`}
/>

</div>

</div>

</div>

);

})}

</div>
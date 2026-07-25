// export default function QuickActionButton({
//   icon: Icon,
//   label,
//   onClick,
// }) {
//   return (
//     <button
//       onClick={onClick}
//       className="
//       flex
//       items-center
//       gap-3
//       rounded-xl
//       border
//       border-slate-200
//       bg-white
//       px-5
//       py-3
//       font-medium
//       text-slate-700
//       shadow-sm
//       hover:border-[#56051a]
//       hover:text-[#56051a]
//       hover:shadow-md
//       transition-all
//       "
//     >
//       <Icon size={18} />

//       {label}
//     </button>
//   );
// }




// -----------------------------------------------------





// export default function QuickActionButton({
//   icon: Icon,
//   label,
//   description,
//   color = "bg-[#56051a]/10 text-[#56051a]",
//   onClick,
// }) {
//   return (
//     <button
//       onClick={onClick}
//       className="
//       group
//       relative
//       overflow-hidden
//       rounded-2xl
//       border
//       border-slate-200
//       bg-white
//       p-5
//       text-left
//       transition-all
//       duration-300
//       hover:-translate-y-2
//       hover:shadow-xl
//       hover:border-[#56051a]/30
//       "
//     >
//       {/* Background Glow */}
//       <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-[#56051a]/10 blur-3xl opacity-0 group-hover:opacity-100 transition" />

//       {/* Icon */}
//       <div
//         className={`h-16 w-16 rounded-2xl flex items-center justify-center ${color}
//         shadow-md transition-all duration-300
//         group-hover:scale-110 group-hover:rotate-6`}
//       >
//         <Icon className="h-8 w-8" strokeWidth={2.2} />
//       </div>

//       {/* Title */}
//       <h3 className="mt-5 text-base font-semibold text-slate-800">
//         {label}
//       </h3>

//       {/* Description */}
//       <p className="mt-1 text-sm text-slate-500">
//         {description}
//       </p>

//       {/* Arrow */}
//       <div className="mt-4 flex items-center text-[#56051a] font-medium opacity-0 group-hover:opacity-100 transition">
//         Open
//         <span className="ml-1 transition-transform group-hover:translate-x-1">
//           →
//         </span>
//       </div>
//     </button>
//   );
// }




import { Link } from "react-router-dom";




export default function QuickActionButton({
  icon: Icon,
  label,
  description,
  color,
  onClick,
  openLink,
}) {
  return (
    <button
      onClick={onClick}
      // className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all duration-300 hover:-translate-y-2 hover:border-[#8b1730]/40 hover:shadow-xl"

      className="
group
relative
flex
h-54
flex-col
overflow-hidden
rounded-2xl
border
border-slate-200
bg-gradient-to-br
from-white
via-white
to-[#fff8f9]
p-6
text-left
shadow-sm
transition-all
duration-300
hover:-translate-y-2
hover:border-[#8b1730]/40
hover:shadow-2xl
"


    >
      {/* Background Glow */}
      <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-[#8b1730]/10 blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

      <div className="relative">
        {/* Icon */}
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-2xl ${color} shadow-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}
        >
          <Icon className="h-8 w-8" strokeWidth={2.2} />
        </div>

        <h3 className="mt-5 text-base font-semibold text-slate-800">
          {label}
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>

        {/* <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#8b1730] opacity-0 transition-all duration-300 group-hover:opacity-100">
          Open
          <span className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </span> */}

        <Link
          to={openLink}
          onClick={(e) => e.stopPropagation()}
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#8b1730] opacity-0 transition-all duration-300 group-hover:opacity-100 hover:underline"
        >
          Open
          <span className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </Link>




      </div>


      {/* Bottom Hover Line */}
      <div className="absolute inset-x-0 bottom-0 h-1 scale-x-0 bg-[#8b1730] transition-transform duration-300 origin-left group-hover:scale-x-100"></div>
    </button>
  );
}
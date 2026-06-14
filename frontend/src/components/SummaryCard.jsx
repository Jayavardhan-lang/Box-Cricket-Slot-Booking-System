export default function SummaryCard({ title, value, icon, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-5 hover:shadow-md transition-shadow">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: color + '15', color }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-gray-500 text-sm truncate">{title}</p>
        <p className="text-2xl font-extrabold text-[#1a1a1a] mt-0.5 truncate">{value}</p>
      </div>
    </div>
  )
}

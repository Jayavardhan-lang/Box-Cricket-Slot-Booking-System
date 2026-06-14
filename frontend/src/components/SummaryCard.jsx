export default function SummaryCard({ title, value, icon, color }) {
  return (
    <div
      className="bg-brand-card rounded-2xl border border-white/5 shadow-lg p-6 flex items-center gap-5 hover:scale-[1.02] transition-transform duration-300"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-accent text-[11px] text-brand-greyMedium tracking-wider uppercase truncate">{title}</p>
        <p className="font-display text-4xl text-white mt-1 truncate" style={{ color }}>
          {value}
        </p>
      </div>
    </div>
  )
}

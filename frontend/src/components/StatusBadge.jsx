/**
 * StatusBadge component
 * Displays a color-coded status badge
 *
 * @param {{ status: string }} props
 */
function StatusBadge({ status }) {
  const statusMap = {
    confirmed:  { bg: 'rgba(0, 200, 83, 0.1)',  color: '#00c853', label: 'Confirmed' },
    pending:    { bg: 'rgba(255, 145, 0, 0.1)',  color: '#ff9100', label: 'Pending' },
    cancelled:  { bg: 'rgba(255, 23, 68, 0.1)',  color: '#ff1744', label: 'Cancelled' },
    available:  { bg: 'rgba(0, 200, 83, 0.1)',  color: '#00c853', label: 'Available' },
    booked:     { bg: 'rgba(255, 23, 68, 0.1)',  color: '#ff1744', label: 'Booked' },
    blocked:    { bg: 'rgba(255, 255, 255, 0.05)', color: '#9e9e9e', label: 'Blocked' },
  }

  const normalizedStatus = status?.toLowerCase() || 'pending'
  const config = statusMap[normalizedStatus] || { bg: '#f3f4f6', color: '#6b7280', label: status || 'Unknown' }

  return (
    <span
      style={{
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.color}30`,
      }}
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
    >
      <span
        style={{ backgroundColor: config.color }}
        className="w-1.5 h-1.5 rounded-full mr-1.5"
      />
      {config.label}
    </span>
  )
}

export default StatusBadge

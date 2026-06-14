/**
 * StatusBadge component
 * Displays a color-coded status badge
 *
 * @param {{ status: string }} props
 */
function StatusBadge({ status }) {
  const statusMap = {
    confirmed:  { bg: '#dcfce7', color: '#16a34a', label: 'Confirmed' },
    pending:    { bg: '#fef9c3', color: '#d97706', label: 'Pending' },
    cancelled:  { bg: '#fee2e2', color: '#dc2626', label: 'Cancelled' },
    available:  { bg: '#dcfce7', color: '#16a34a', label: 'Available' },
    booked:     { bg: '#fee2e2', color: '#dc2626', label: 'Booked' },
    blocked:    { bg: '#f3f4f6', color: '#6b7280', label: 'Blocked' },
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

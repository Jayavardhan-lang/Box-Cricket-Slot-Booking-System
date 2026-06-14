function Spinner({ size = 'md', color = '#00c853' }) {
  const sizes = { sm: 16, md: 32, lg: 48 }
  const px = sizes[size] || 32
  return (
    <div className="flex items-center justify-center">
      <svg
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-spin"
      >
        <circle cx="12" cy="12" r="10" stroke={color} strokeOpacity="0.2" strokeWidth="3" />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

export default Spinner

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

export function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  className = '',
  type = 'button'
}: ButtonProps) {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 backdrop-blur-sm'
  
  const variantClasses = {
    primary: 'bg-white/20 text-white hover:bg-white/30 focus:ring-white/50 border border-white/30',
    secondary: 'bg-white/10 text-white hover:bg-white/20 focus:ring-white/30 border border-white/20',
    ghost: 'bg-transparent text-white hover:bg-white/10 border border-white/30 focus:ring-white/30'
  }
  
  const disabledClasses = 'opacity-50 cursor-not-allowed'
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${disabled ? disabledClasses : ''} ${className}`}
    >
      {children}
    </button>
  )
}
interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
}

export function Card({ children, className = '', padding = 'md' }: CardProps) {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  }
  
  return (
    <div className={`bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  )
}
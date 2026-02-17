
import React from 'react'

interface CardProps {
    children: React.ReactNode
    className?: string
    title?: string
    description?: string
    icon?: React.ReactNode
    onClick?: () => void
}

export function Card({ children, className = '', title, description, icon, onClick }: CardProps) {
    return (
        <div
            onClick={onClick}
            className={`bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${onClick ? 'cursor-pointer' : ''} ${className}`}
        >
            {(title || icon) && (
                <div className="flex items-center gap-4 mb-6">
                    {icon && (
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                            {icon}
                        </div>
                    )}
                    {title && (
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                            {description && <p className="text-sm text-slate-500">{description}</p>}
                        </div>
                    )}
                </div>
            )}
            {children}
        </div>
    )
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    icon?: React.ReactNode
    loading?: boolean
}

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    loading,
    className = '',
    ...props
}: ButtonProps) {
    const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none'

    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200',
        secondary: 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200',
        outline: 'bg-transparent border-2 border-slate-200 text-slate-600 hover:border-blue-600 hover:text-blue-600',
        ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
        danger: 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white',
    }

    const sizes = {
        sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
        md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
        lg: 'px-8 py-3.5 text-base rounded-2xl gap-3',
    }

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={loading}
            {...props}
        >
            {loading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : icon}
            {children}
        </button>
    )
}

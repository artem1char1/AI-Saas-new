import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/shared/lib'

import styles from './Button.module.css'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: 'primary' | 'secondary'
}

export function Button({
  children,
  className,
  variant = 'primary',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(styles.button, styles[variant], className)}
      {...props}
    >
      {children}
    </button>
  )
}

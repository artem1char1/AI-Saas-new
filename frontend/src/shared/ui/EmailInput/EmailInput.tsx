import type { InputHTMLAttributes } from 'react'

import { useI18n } from '@/shared/lib/i18n'
import { isValidEmail, maskEmailInput } from '@/shared/lib/masks'

import styles from './EmailInput.module.css'

type EmailInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> & {
  value: string
  onChange: (value: string) => void
  invalid?: boolean
}

export function EmailInput({
  value,
  onChange,
  invalid,
  className,
  onBlur,
  placeholder,
  ...props
}: EmailInputProps) {
  const { t } = useI18n()

  return (
    <input
      {...props}
      type="email"
      inputMode="email"
      autoComplete="email"
      spellCheck={false}
      className={[className, invalid ? styles.invalid : ''].filter(Boolean).join(' ')}
      value={value}
      placeholder={placeholder ?? t('contacts.emailPlaceholder')}
      onChange={(event) => onChange(maskEmailInput(event.target.value))}
      onBlur={(event) => {
        onChange(maskEmailInput(event.target.value.trim()))
        onBlur?.(event)
      }}
    />
  )
}

export { isValidEmail }

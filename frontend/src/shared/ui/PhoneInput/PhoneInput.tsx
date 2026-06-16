import type { ChangeEvent, InputHTMLAttributes } from 'react'

import { useI18n } from '@/shared/lib/i18n'
import { extractPhoneDigits, formatPhoneDisplay } from '@/shared/lib/masks'

import styles from './PhoneInput.module.css'

type PhoneInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> & {
  value: string
  onChange: (digits: string) => void
  invalid?: boolean
}

export function PhoneInput({
  value,
  onChange,
  invalid,
  className,
  onBlur,
  placeholder,
  ...props
}: PhoneInputProps) {
  const { t } = useI18n()
  const displayValue = formatPhoneDisplay(value)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(extractPhoneDigits(event.target.value))
  }

  return (
    <input
      {...props}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      className={[className, invalid ? styles.invalid : ''].filter(Boolean).join(' ')}
      value={displayValue}
      placeholder={placeholder ?? t('contacts.phonePlaceholder')}
      onChange={handleChange}
      onBlur={onBlur}
    />
  )
}

export { isValidPhone } from '@/shared/lib/masks'

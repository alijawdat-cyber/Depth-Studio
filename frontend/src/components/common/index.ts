// مكونات بسيطة جداً
export { default as BaseButton } from './BaseButton.vue'
export { default as BaseCard } from './BaseCard.vue'
export { default as BaseInput } from './BaseInput.vue'

// Types
export interface ButtonProps {
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'
  variant?: 'elevated' | 'flat' | 'tonal' | 'outlined' | 'text' | 'plain'
  size?: 'x-small' | 'small' | 'default' | 'large' | 'x-large'
  loading?: boolean
  disabled?: boolean
  block?: boolean
}

export interface CardProps {
  title?: string
  subtitle?: string
  elevation?: number | string
  variant?: 'elevated' | 'flat' | 'tonal' | 'outlined'
  hoverable?: boolean
  padding?: 'none' | 'small' | 'medium' | 'large'
}

export interface InputProps {
  modelValue?: string | number
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'textarea'
  label?: string
  placeholder?: string
  hint?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
} 
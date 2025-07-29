export const validation = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    validate: (password: string) => {
      const errors: string[] = []
      
      if (password.length < 8) {
        errors.push('Password must be at least 8 characters')
      }
      if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter')
      }
      if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter')
      }
      if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number')
      }
      
      return {
        isValid: errors.length === 0,
        errors
      }
    }
  },
  username: {
    pattern: /^[a-zA-Z0-9_-]{3,20}$/,
    message: 'Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens'
  },
  url: {
    pattern: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    message: 'Please enter a valid URL'
  }
}

export function validateEmail(email: string): boolean {
  return validation.email.pattern.test(email)
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  return validation.password.validate(password)
}

export function validateForm<T extends Record<string, any>>(
  data: T,
  rules: Partial<Record<keyof T, (value: any) => string | null>>
): { isValid: boolean; errors: Partial<Record<keyof T, string>> } {
  const errors: Partial<Record<keyof T, string>> = {}
  
  for (const [field, validator] of Object.entries(rules) as [keyof T, (value: any) => string | null][]) {
    if (validator) {
      const error = validator(data[field])
      if (error) {
        errors[field] = error
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}
import { useState, useCallback } from 'react'

interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  validate?: (value: any) => boolean | string
  message?: string
}

interface ValidationRules {
  [key: string]: ValidationRule | ValidationRule[]
}

interface FormErrors {
  [key: string]: string
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules
) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validateField = useCallback((name: string, value: any): string | null => {
    const rules = validationRules[name]
    if (!rules) return null

    const rulesArray = Array.isArray(rules) ? rules : [rules]

    for (const rule of rulesArray) {
      if (rule.required && !value) {
        return rule.message || 'This field is required'
      }

      if (rule.minLength && value.length < rule.minLength) {
        return rule.message || `Must be at least ${rule.minLength} characters`
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        return rule.message || `Must be no more than ${rule.maxLength} characters`
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        return rule.message || 'Invalid format'
      }

      if (rule.validate) {
        const result = rule.validate(value)
        if (typeof result === 'string') return result
        if (result === false) return rule.message || 'Invalid value'
      }
    }

    return null
  }, [validationRules])

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setValues(prev => ({ ...prev, [name]: value }))

    // Validate on change if field has been touched
    if (touched[name]) {
      const error = validateField(name, value)
      setErrors(prev => ({
        ...prev,
        [name]: error || ''
      }))
    }
  }, [touched, validateField])

  const handleBlur = useCallback((
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))

    const error = validateField(name, value)
    setErrors(prev => ({
      ...prev,
      [name]: error || ''
    }))
  }, [validateField])

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {}
    let isValid = true

    Object.keys(validationRules).forEach(name => {
      const error = validateField(name, values[name])
      if (error) {
        newErrors[name] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    setTouched(Object.keys(validationRules).reduce((acc, key) => ({
      ...acc,
      [key]: true
    }), {}))

    return isValid
  }, [validationRules, values, validateField])

  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  const setFieldValue = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }))
  }, [])

  const setFieldError = useCallback((name: string, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }))
  }, [])

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    resetForm,
    setFieldValue,
    setFieldError,
    isValid: Object.keys(errors).length === 0
  }
}
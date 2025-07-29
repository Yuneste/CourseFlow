'use client'

import { forwardRef, useId } from 'react'
import { cn } from '@/lib/utils'
import { ariaLabels, generateAriaId } from '@/lib/utils/aria-labels'
import { ValidationAnnouncer } from './AriaLiveRegion'

interface AccessibleFormFieldProps {
  label: string
  error?: string
  required?: boolean
  description?: string
  children: React.ReactElement
  className?: string
}

export const AccessibleFormField = forwardRef<
  HTMLDivElement,
  AccessibleFormFieldProps
>(({ label, error, required, description, children, className }, ref) => {
  const fieldId = useId()
  const errorId = generateAriaId('error')
  const descriptionId = generateAriaId('description')

  // Clone child element with proper ARIA attributes
  const enhancedChild = {
    ...children,
    props: {
      ...children.props,
      id: children.props.id || fieldId,
      'aria-required': required,
      'aria-invalid': !!error,
      'aria-describedby': [
        error && errorId,
        description && descriptionId,
        children.props['aria-describedby']
      ].filter(Boolean).join(' ') || undefined
    }
  }

  return (
    <div ref={ref} className={cn('space-y-2', className)}>
      <label 
        htmlFor={enhancedChild.props.id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
        {required && (
          <span 
            className="text-red-500 ml-1"
            aria-label={ariaLabels.form.required}
          >
            *
          </span>
        )}
      </label>
      
      {description && (
        <p 
          id={descriptionId}
          className="text-sm text-muted-foreground"
        >
          {description}
        </p>
      )}
      
      {enhancedChild}
      
      {error && (
        <p 
          id={errorId}
          className="text-sm text-red-500"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
})

AccessibleFormField.displayName = 'AccessibleFormField'

// Accessible form component
interface AccessibleFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  errors?: Record<string, string | string[]>
  touched?: Record<string, boolean>
  loading?: boolean
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>
}

export const AccessibleForm = forwardRef<
  HTMLFormElement,
  AccessibleFormProps
>(({ 
  children, 
  errors = {}, 
  touched = {}, 
  loading = false,
  onSubmit,
  className,
  ...props 
}, ref) => {
  const formId = useId()
  const hasErrors = Object.keys(errors).length > 0

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await onSubmit(e)
  }

  return (
    <>
      <form
        ref={ref}
        id={formId}
        onSubmit={handleSubmit}
        aria-busy={loading}
        className={className}
        noValidate
        {...props}
      >
        {children}
      </form>
      
      <ValidationAnnouncer 
        errors={errors} 
        touched={touched}
        announceOn="change"
      />
    </>
  )
})

AccessibleForm.displayName = 'AccessibleForm'

// Fieldset with legend for grouping related fields
interface AccessibleFieldsetProps {
  legend: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function AccessibleFieldset({
  legend,
  description,
  children,
  className
}: AccessibleFieldsetProps) {
  const descriptionId = description ? generateAriaId('fieldset-desc') : undefined

  return (
    <fieldset 
      className={cn('space-y-4', className)}
      aria-describedby={descriptionId}
    >
      <legend className="text-lg font-semibold">
        {legend}
      </legend>
      
      {description && (
        <p 
          id={descriptionId}
          className="text-sm text-muted-foreground mt-1"
        >
          {description}
        </p>
      )}
      
      {children}
    </fieldset>
  )
}

// Radio group with proper ARIA
interface AccessibleRadioGroupProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  options: Array<{
    value: string
    label: string
    description?: string
    disabled?: boolean
  }>
  error?: string
  required?: boolean
  className?: string
}

export function AccessibleRadioGroup({
  label,
  name,
  value,
  onChange,
  options,
  error,
  required,
  className
}: AccessibleRadioGroupProps) {
  const groupId = useId()
  const errorId = error ? generateAriaId('error') : undefined

  return (
    <div 
      role="radiogroup"
      aria-labelledby={`${groupId}-label`}
      aria-required={required}
      aria-invalid={!!error}
      aria-describedby={errorId}
      className={cn('space-y-2', className)}
    >
      <div id={`${groupId}-label`} className="text-sm font-medium">
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label={ariaLabels.form.required}>
            *
          </span>
        )}
      </div>
      
      <div className="space-y-2">
        {options.map((option) => {
          const optionId = `${groupId}-${option.value}`
          const descriptionId = option.description 
            ? `${optionId}-desc` 
            : undefined
          
          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={cn(
                'flex items-start space-x-2 cursor-pointer',
                option.disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              <input
                type="radio"
                id={optionId}
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange(e.target.value)}
                disabled={option.disabled}
                aria-describedby={descriptionId}
                className="mt-1"
              />
              <div className="space-y-1">
                <div className="text-sm font-medium">{option.label}</div>
                {option.description && (
                  <div 
                    id={descriptionId}
                    className="text-sm text-muted-foreground"
                  >
                    {option.description}
                  </div>
                )}
              </div>
            </label>
          )
        })}
      </div>
      
      {error && (
        <p id={errorId} className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// Checkbox group with proper ARIA
interface AccessibleCheckboxGroupProps {
  label: string
  options: Array<{
    value: string
    label: string
    checked: boolean
    onChange: (checked: boolean) => void
    description?: string
    disabled?: boolean
  }>
  error?: string
  className?: string
}

export function AccessibleCheckboxGroup({
  label,
  options,
  error,
  className
}: AccessibleCheckboxGroupProps) {
  const groupId = useId()
  const errorId = error ? generateAriaId('error') : undefined

  return (
    <div 
      role="group"
      aria-labelledby={`${groupId}-label`}
      aria-describedby={errorId}
      className={cn('space-y-2', className)}
    >
      <div id={`${groupId}-label`} className="text-sm font-medium">
        {label}
      </div>
      
      <div className="space-y-2">
        {options.map((option, index) => {
          const optionId = `${groupId}-${index}`
          const descriptionId = option.description 
            ? `${optionId}-desc` 
            : undefined
          
          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={cn(
                'flex items-start space-x-2 cursor-pointer',
                option.disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              <input
                type="checkbox"
                id={optionId}
                checked={option.checked}
                onChange={(e) => option.onChange(e.target.checked)}
                disabled={option.disabled}
                aria-describedby={descriptionId}
                className="mt-1"
              />
              <div className="space-y-1">
                <div className="text-sm font-medium">{option.label}</div>
                {option.description && (
                  <div 
                    id={descriptionId}
                    className="text-sm text-muted-foreground"
                  >
                    {option.description}
                  </div>
                )}
              </div>
            </label>
          )
        })}
      </div>
      
      {error && (
        <p id={errorId} className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
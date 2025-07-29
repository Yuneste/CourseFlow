// Utility functions for generating consistent ARIA labels

export const ariaLabels = {
  // Navigation
  navigation: {
    main: 'Main navigation',
    breadcrumb: 'Breadcrumb navigation',
    pagination: 'Pagination navigation',
    sidebar: 'Sidebar navigation',
    userMenu: 'User account menu',
    mobileMenu: 'Mobile navigation menu'
  },

  // Buttons
  button: {
    close: 'Close',
    dismiss: 'Dismiss',
    delete: (item: string) => `Delete ${item}`,
    edit: (item: string) => `Edit ${item}`,
    save: 'Save changes',
    cancel: 'Cancel',
    submit: 'Submit form',
    upload: 'Upload file',
    download: (fileName: string) => `Download ${fileName}`,
    toggleMenu: 'Toggle menu',
    toggleTheme: 'Toggle color theme',
    search: 'Search',
    filter: 'Filter results',
    sort: 'Sort results',
    refresh: 'Refresh',
    expand: 'Expand',
    collapse: 'Collapse',
    next: 'Next',
    previous: 'Previous',
    play: 'Play',
    pause: 'Pause',
    mute: 'Mute',
    unmute: 'Unmute'
  },

  // Forms
  form: {
    required: 'required',
    optional: 'optional',
    error: (field: string, error: string) => `${field} error: ${error}`,
    helpText: (field: string) => `Help text for ${field}`,
    characterCount: (current: number, max: number) => `${current} of ${max} characters`,
    passwordStrength: (strength: string) => `Password strength: ${strength}`,
    fileInput: {
      single: 'Choose a file',
      multiple: 'Choose files',
      dragDrop: 'Drag and drop files here or click to browse'
    }
  },

  // Status
  status: {
    loading: 'Loading',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Information',
    new: 'New',
    updated: 'Updated',
    online: 'Online',
    offline: 'Offline',
    busy: 'Busy',
    away: 'Away',
    active: 'Active',
    inactive: 'Inactive'
  },

  // Interactive elements
  interactive: {
    accordion: {
      expand: (section: string) => `Expand ${section} section`,
      collapse: (section: string) => `Collapse ${section} section`
    },
    tabs: {
      list: 'Tab list',
      tab: (name: string, selected: boolean) => 
        `${name} tab${selected ? ', selected' : ''}`
    },
    modal: {
      title: (title: string) => `${title} dialog`,
      close: 'Close dialog'
    },
    dropdown: {
      trigger: (label: string, expanded: boolean) => 
        `${label} dropdown menu, ${expanded ? 'expanded' : 'collapsed'}`,
      option: (option: string, selected: boolean) => 
        `${option}${selected ? ', selected' : ''}`
    },
    slider: {
      label: (name: string, value: number, min: number, max: number) => 
        `${name} slider, current value ${value}, minimum ${min}, maximum ${max}`
    },
    progress: {
      determinate: (percent: number) => `Progress: ${percent}%`,
      indeterminate: 'Progress: in progress'
    }
  },

  // Data tables
  table: {
    caption: (description: string) => description,
    sortable: (column: string, direction?: 'asc' | 'desc') => 
      `Sort by ${column}${direction ? `, currently sorted ${direction === 'asc' ? 'ascending' : 'descending'}` : ''}`,
    rowAction: (action: string, row: string) => `${action} ${row}`,
    selectAll: 'Select all rows',
    selectRow: (row: string) => `Select ${row}`,
    expandRow: (row: string) => `Expand ${row} details`,
    collapseRow: (row: string) => `Collapse ${row} details`
  },

  // File management
  files: {
    fileType: (type: string) => `${type} file`,
    fileSize: (size: string) => `Size: ${size}`,
    lastModified: (date: string) => `Last modified: ${date}`,
    uploadProgress: (percent: number) => `Upload progress: ${percent}%`,
    thumbnail: (fileName: string) => `Thumbnail for ${fileName}`
  },

  // Course specific
  course: {
    courseCard: (name: string) => `${name} course`,
    enrollment: (status: 'enrolled' | 'not-enrolled') => 
      status === 'enrolled' ? 'Enrolled' : 'Not enrolled',
    progress: (percent: number) => `Course progress: ${percent}% complete`,
    grade: (grade: string) => `Grade: ${grade}`,
    instructor: (name: string) => `Instructor: ${name}`,
    duration: (hours: number) => `Duration: ${hours} hours`,
    difficulty: (level: string) => `Difficulty: ${level}`
  },

  // Notifications
  notification: {
    count: (count: number) => `${count} notification${count !== 1 ? 's' : ''}`,
    unread: (count: number) => `${count} unread notification${count !== 1 ? 's' : ''}`,
    markAsRead: 'Mark as read',
    markAllAsRead: 'Mark all as read',
    settings: 'Notification settings'
  }
}

// Helper function to combine multiple ARIA attributes
export function combineAriaAttributes(...attributes: (string | undefined | null)[]): string {
  return attributes.filter(Boolean).join(' ')
}

// Helper function to generate description from multiple parts
export function ariaDescribedBy(...ids: (string | undefined | null)[]): string | undefined {
  const validIds = ids.filter(Boolean)
  return validIds.length > 0 ? validIds.join(' ') : undefined
}

// Helper to generate unique IDs for ARIA relationships
let idCounter = 0
export function generateAriaId(prefix: string): string {
  return `${prefix}-${++idCounter}`
}

// Type-safe ARIA attribute builder
export class AriaAttributes {
  private attributes: Record<string, string | boolean | undefined> = {}

  label(label: string): this {
    this.attributes['aria-label'] = label
    return this
  }

  labelledBy(id: string | string[]): this {
    this.attributes['aria-labelledby'] = Array.isArray(id) ? id.join(' ') : id
    return this
  }

  describedBy(id: string | string[]): this {
    this.attributes['aria-describedby'] = Array.isArray(id) ? id.join(' ') : id
    return this
  }

  hidden(hidden: boolean = true): this {
    this.attributes['aria-hidden'] = hidden
    return this
  }

  expanded(expanded: boolean): this {
    this.attributes['aria-expanded'] = expanded
    return this
  }

  selected(selected: boolean): this {
    this.attributes['aria-selected'] = selected
    return this
  }

  checked(checked: boolean | 'mixed'): this {
    this.attributes['aria-checked'] = checked
    return this
  }

  disabled(disabled: boolean = true): this {
    this.attributes['aria-disabled'] = disabled
    return this
  }

  required(required: boolean = true): this {
    this.attributes['aria-required'] = required
    return this
  }

  invalid(invalid: boolean = true): this {
    this.attributes['aria-invalid'] = invalid
    return this
  }

  busy(busy: boolean = true): this {
    this.attributes['aria-busy'] = busy
    return this
  }

  live(live: 'polite' | 'assertive' | 'off' = 'polite'): this {
    this.attributes['aria-live'] = live
    return this
  }

  role(role: string): this {
    this.attributes['role'] = role
    return this
  }

  build(): Record<string, string | boolean | undefined> {
    return { ...this.attributes }
  }
}

// Factory function for creating ARIA attributes
export function aria(): AriaAttributes {
  return new AriaAttributes()
}
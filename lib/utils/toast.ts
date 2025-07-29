import { toast as sonnerToast } from 'sonner'

interface ToastOptions {
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export const toast = {
  success: (message: string, options?: ToastOptions) => {
    sonnerToast.success(message, {
      description: options?.description,
      duration: options?.duration ?? 4000,
      action: options?.action,
    })
  },
  error: (message: string, options?: ToastOptions) => {
    sonnerToast.error(message, {
      description: options?.description,
      duration: options?.duration ?? 6000,
      action: options?.action,
    })
  },
  info: (message: string, options?: ToastOptions) => {
    sonnerToast.info(message, {
      description: options?.description,
      duration: options?.duration ?? 4000,
      action: options?.action,
    })
  },
  warning: (message: string, options?: ToastOptions) => {
    sonnerToast.warning(message, {
      description: options?.description,
      duration: options?.duration ?? 5000,
      action: options?.action,
    })
  },
  loading: (message: string, description?: string) => {
    return sonnerToast.loading(message, {
      description,
    })
  },
  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading,
      success,
      error,
    })
  },
  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId)
  },
}

// Specific toast helpers for common actions
export const fileToast = {
  uploadSuccess: (fileName: string) => {
    toast.success(`${fileName} uploaded successfully`, {
      action: {
        label: 'View',
        onClick: () => window.location.href = '/dashboard/files'
      }
    })
  },

  uploadError: (fileName: string, error?: string) => {
    toast.error(`Failed to upload ${fileName}`, {
      description: error,
      duration: 8000
    })
  },

  deleteSuccess: (fileName: string) => {
    toast.success(`${fileName} deleted`)
  },

  processingStart: (fileName: string) => {
    return toast.loading(`Processing ${fileName}...`)
  },

  processingComplete: (fileName: string) => {
    toast.success(`${fileName} processed successfully`)
  }
}

export const authToast = {
  loginSuccess: (userName?: string) => {
    toast.success(`Welcome back${userName ? `, ${userName}` : ''}!`)
  },

  loginError: (error?: string) => {
    toast.error('Login failed', {
      description: error || 'Please check your credentials.'
    })
  },

  logoutSuccess: () => {
    toast.success('Logged out successfully')
  },

  sessionExpired: () => {
    toast.warning('Session expired', {
      description: 'Please log in again.',
      duration: 10000,
      action: {
        label: 'Log in',
        onClick: () => window.location.href = '/login'
      }
    })
  }
}

export const subscriptionToast = {
  upgradeSuccess: (planName: string) => {
    toast.success(`Successfully upgraded to ${planName} plan! 🎉`, {
      duration: 6000
    })
  },

  paymentError: (error?: string) => {
    toast.error('Payment failed', {
      description: error || 'Please try again or contact support.',
      duration: 8000,
      action: {
        label: 'Contact Support',
        onClick: () => window.location.href = '/support'
      }
    })
  },

  trialEnding: (daysLeft: number) => {
    toast.warning(`Trial ending soon`, {
      description: `${daysLeft} day${daysLeft === 1 ? '' : 's'} remaining`,
      action: {
        label: 'Upgrade Now',
        onClick: () => window.location.href = '/dashboard/billing'
      }
    })
  }
}

export const aiToast = {
  generatingStart: (type: 'summary' | 'flashcards' | 'quiz') => {
    const messages = {
      summary: 'Generating summary...',
      flashcards: 'Creating flashcards...',
      quiz: 'Preparing quiz questions...'
    }
    return toast.loading(messages[type])
  },

  generatingSuccess: (type: 'summary' | 'flashcards' | 'quiz') => {
    const messages = {
      summary: 'Summary generated successfully',
      flashcards: 'Flashcards created successfully',
      quiz: 'Quiz questions ready'
    }
    toast.success(messages[type])
  },

  generatingError: (type: 'summary' | 'flashcards' | 'quiz') => {
    const messages = {
      summary: 'Failed to generate summary',
      flashcards: 'Failed to create flashcards',
      quiz: 'Failed to prepare quiz'
    }
    toast.error(messages[type], {
      action: {
        label: 'Try Again',
        onClick: () => window.location.reload()
      }
    })
  }
}
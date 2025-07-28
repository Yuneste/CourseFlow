import { toast as sonnerToast } from 'sonner'

export const toast = {
  success: (message: string, description?: string) => {
    sonnerToast.success(message, {
      description,
    })
  },
  error: (message: string, description?: string) => {
    sonnerToast.error(message, {
      description,
    })
  },
  info: (message: string, description?: string) => {
    sonnerToast.info(message, {
      description,
    })
  },
  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, {
      description,
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
}
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, ThumbsUp, ThumbsDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useEnhancedAnalytics } from './AnalyticsHooks'

// Floating feedback button
interface FeedbackButtonProps {
  onClick: () => void
  position?: 'left' | 'right'
  className?: string
}

export function FeedbackButton({ 
  onClick, 
  position = 'right',
  className 
}: FeedbackButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'fixed bottom-20 z-40 bg-primary text-primary-foreground p-3 rounded-full shadow-lg',
        'hover:shadow-xl transition-shadow',
        position === 'right' ? 'right-4' : 'left-4',
        className
      )}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <MessageSquare className="h-5 w-5" />
    </motion.button>
  )
}

// Feedback widget
interface FeedbackWidgetProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (feedback: FeedbackData) => void
  position?: 'left' | 'right'
}

interface FeedbackData {
  type: 'bug' | 'feature' | 'general'
  rating?: 'positive' | 'negative'
  message: string
  email?: string
  metadata?: Record<string, any>
}

export function FeedbackWidget({
  isOpen,
  onClose,
  onSubmit,
  position = 'right'
}: FeedbackWidgetProps) {
  const [feedbackType, setFeedbackType] = useState<FeedbackData['type']>('general')
  const [rating, setRating] = useState<FeedbackData['rating']>()
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const { trackFeatureUsage } = useEnhancedAnalytics()

  const handleSubmit = async () => {
    if (!message.trim()) return

    setIsSubmitting(true)
    
    const feedbackData: FeedbackData = {
      type: feedbackType,
      rating,
      message,
      email: email || undefined,
      metadata: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }
    }

    try {
      await onSubmit(feedbackData)
      trackFeatureUsage('feedback_widget', 'submitted')
      setIsSubmitted(true)
      
      // Reset after delay
      setTimeout(() => {
        onClose()
        setIsSubmitted(false)
        setMessage('')
        setEmail('')
        setRating(undefined)
      }, 2000)
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={cn(
            'fixed bottom-20 z-50 w-80 bg-background border rounded-lg shadow-xl',
            position === 'right' ? 'right-4' : 'left-4'
          )}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">Send Feedback</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {isSubmitted ? (
            // Success state
            <div className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Send className="h-8 w-8 text-green-600 dark:text-green-400" />
              </motion.div>
              <p className="font-medium">Thank you for your feedback!</p>
            </div>
          ) : (
            <>
              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Feedback type */}
                <div className="flex gap-2">
                  {(['bug', 'feature', 'general'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFeedbackType(type)}
                      className={cn(
                        'flex-1 py-1.5 px-3 text-sm rounded-md border transition-colors capitalize',
                        feedbackType === type
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background hover:bg-muted border-input'
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* Rating */}
                <div className="flex items-center justify-center gap-4 py-2">
                  <button
                    onClick={() => setRating('positive')}
                    className={cn(
                      'p-2 rounded-md transition-colors',
                      rating === 'positive'
                        ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                        : 'hover:bg-muted text-muted-foreground'
                    )}
                  >
                    <ThumbsUp className="h-5 w-5" />
                  </button>
                  <span className="text-sm text-muted-foreground">How are we doing?</span>
                  <button
                    onClick={() => setRating('negative')}
                    className={cn(
                      'p-2 rounded-md transition-colors',
                      rating === 'negative'
                        ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                        : 'hover:bg-muted text-muted-foreground'
                    )}
                  >
                    <ThumbsDown className="h-5 w-5" />
                  </button>
                </div>

                {/* Message */}
                <Textarea
                  placeholder="Tell us more..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[100px] resize-none"
                />

                {/* Email (optional) */}
                <input
                  type="email"
                  placeholder="Email (optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-md bg-background"
                />
              </div>

              {/* Footer */}
              <div className="p-4 border-t">
                <Button
                  onClick={handleSubmit}
                  disabled={!message.trim() || isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Sending...
                    </span>
                  ) : (
                    'Send Feedback'
                  )}
                </Button>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Complete feedback system
export function FeedbackSystem() {
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = async (feedback: FeedbackData) => {
    // Send to your feedback endpoint
    console.log('Feedback submitted:', feedback)
    
    // In production, send to API
    // await fetch('/api/feedback', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(feedback)
    // })
  }

  return (
    <>
      <FeedbackButton onClick={() => setIsOpen(true)} />
      <FeedbackWidget
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  )
}

// NPS Survey component
interface NPSSurveyProps {
  onSubmit: (score: number, feedback?: string) => void
  onDismiss: () => void
}

export function NPSSurvey({ onSubmit, onDismiss }: NPSSurveyProps) {
  const [score, setScore] = useState<number | null>(null)
  const [feedback, setFeedback] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)

  const handleScoreSelect = (selectedScore: number) => {
    setScore(selectedScore)
    setShowFeedback(true)
  }

  const handleSubmit = () => {
    if (score !== null) {
      onSubmit(score, feedback)
    }
  }

  return (
    <motion.div
      className="fixed bottom-4 right-4 z-50 bg-background border rounded-lg shadow-xl p-6 max-w-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <button
        onClick={onDismiss}
        className="absolute top-2 right-2 p-1 hover:bg-muted rounded"
      >
        <X className="h-4 w-4" />
      </button>

      {!showFeedback ? (
        <>
          <h3 className="font-semibold mb-2">
            How likely are you to recommend CourseFlow to a friend?
          </h3>
          <div className="flex gap-1 mt-4">
            {[...Array(11)].map((_, i) => (
              <button
                key={i}
                onClick={() => handleScoreSelect(i)}
                className={cn(
                  'w-8 h-8 text-sm rounded border transition-colors',
                  'hover:bg-primary hover:text-primary-foreground hover:border-primary',
                  i <= 6 && 'border-red-200',
                  i >= 7 && i <= 8 && 'border-yellow-200',
                  i >= 9 && 'border-green-200'
                )}
              >
                {i}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Not likely</span>
            <span>Very likely</span>
          </div>
        </>
      ) : (
        <>
          <h3 className="font-semibold mb-2">Thanks for your feedback!</h3>
          <p className="text-sm text-muted-foreground mb-4">
            What&apos;s the main reason for your score?
          </p>
          <Textarea
            placeholder="Your feedback (optional)"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="min-h-[80px] mb-4"
          />
          <Button onClick={handleSubmit} className="w-full">
            Submit
          </Button>
        </>
      )}
    </motion.div>
  )
}
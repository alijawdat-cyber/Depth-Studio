'use client'

import React from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; reset: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo)
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error} reset={this.reset} />
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error?: Error
  reset: () => void
}

function DefaultErrorFallback({ error, reset }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Alert 
          variant="error" 
          title="حدث خطأ غير متوقع"
          message={error?.message || 'حدث خطأ في التطبيق. يرجى المحاولة مرة أخرى.'}
          className="mb-4"
        />
        
        {process.env.NODE_ENV === 'development' && error?.stack && (
          <details className="mt-4 mb-4">
            <summary className="cursor-pointer text-sm font-medium">
              تفاصيل الخطأ (Development Mode)
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
              {error.stack}
            </pre>
          </details>
        )}
        
        <div className="flex gap-2">
          <Button onClick={reset} className="flex-1">
            إعادة المحاولة
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
            className="flex-1"
          >
            الصفحة الرئيسية
          </Button>
        </div>
      </div>
    </div>
  )
}

// Hook version for function components
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null)

  const captureError = React.useCallback((error: Error) => {
    setError(error)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return captureError
} 
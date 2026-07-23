import { useState } from "react"
import { useRouteError } from "react-router-dom"
import { IconAlertTriangle, IconRefresh, IconHome, IconChevronDown, IconChevronUp } from "@tabler/icons-react"

export default function GlobalErrorBoundary() {
  const error = useRouteError() as any
  const [showStack, setShowStack] = useState(false)

  const errorMessage = error?.message || error?.statusText || String(error) || "An unexpected application error occurred."
  const errorStack = error?.stack

  const handleReload = () => {
    window.location.reload()
  }

  const handleGoHome = () => {
    window.location.href = "/"
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-foreground">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg shadow-black/5 transition-all md:p-8">
        <div className="flex flex-col items-center text-center">
          {/* Glowing Alert Icon */}
          <div className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 dark:bg-rose-500/20">
            <IconAlertTriangle className="h-7 w-7" />
            <div className="absolute inset-0 -z-10 rounded-full bg-rose-500/20 blur-md"></div>
          </div>

          <h1 className="text-xl font-bold tracking-tight md:text-2xl">
            Application Error
          </h1>
          <p className="mt-2 text-xs text-muted-foreground">
            Something went wrong while rendering this page.
          </p>
        </div>

        {/* Error Details */}
        <div className="mt-6 rounded-lg border border-border/40 bg-muted/40 p-4 font-mono text-xs">
          <div className="font-semibold text-rose-600 dark:text-rose-400 break-words">
            {errorMessage}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-stretch">
          <button
            onClick={handleReload}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90 cursor-pointer"
          >
            <IconRefresh className="h-4 w-4" />
            Reload Page
          </button>
          <button
            onClick={handleGoHome}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-input bg-background px-4 py-2.5 text-xs font-semibold hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
          >
            <IconHome className="h-4 w-4" />
            Return to Dashboard
          </button>
        </div>

        {/* Expandable Stack Trace */}
        {errorStack && (
          <div className="mt-6 border-t border-border/60 pt-4">
            <button
              onClick={() => setShowStack(!showStack)}
              className="flex w-full items-center justify-between text-left text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <span>Technical Details</span>
              {showStack ? (
                <IconChevronUp className="h-4 w-4" />
              ) : (
                <IconChevronDown className="h-4 w-4" />
              )}
            </button>
            
            {showStack && (
              <div className="mt-3 max-h-48 overflow-y-auto rounded bg-muted p-3 font-mono text-[10px] text-muted-foreground break-all whitespace-pre-wrap border border-border/30">
                {errorStack}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

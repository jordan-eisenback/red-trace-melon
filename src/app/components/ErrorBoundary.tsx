import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { logger } from "../utils/logger";

interface Props {
  children: ReactNode;
  /**
   * Optional custom fallback. Receives the error and a reset callback.
   * Defaults to the full-page recovery UI.
   */
  fallback?: (error: Error, reset: () => void) => ReactNode;
  /** If true, renders a compact inline card instead of full-page UI. */
  inline?: boolean;
}

interface State {
  error: Error | null;
}

/**
 * React error boundary that catches uncaught render/lifecycle exceptions and
 * shows a recovery UI instead of a blank screen.
 *
 * Usage:
 *   // Top-level (wraps entire app):
 *   <ErrorBoundary><App /></ErrorBoundary>
 *
 *   // Inline (wraps a single panel):
 *   <ErrorBoundary inline><SomePanel /></ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logger.error('ErrorBoundary', error.message, error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) {
      return this.props.fallback(error, this.reset);
    }

    if (this.props.inline) {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <AlertTriangle className="size-4 text-red-500 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-800">Something went wrong</p>
            <p className="text-xs text-red-600 mt-0.5 truncate">{error.message}</p>
          </div>
          <Button variant="outline" size="sm" onClick={this.reset} className="shrink-0">
            <RefreshCw className="size-3.5 mr-1.5" />
            Retry
          </Button>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="size-8 text-red-500" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Something went wrong</h1>
            <p className="text-sm text-slate-500 mt-1">
              An unexpected error occurred. Your data is safe — it is stored in your browser and
              on disk, and has not been affected.
            </p>
          </div>
          <details className="text-left">
            <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600">
              Show error details
            </summary>
            <pre className="mt-2 text-xs bg-slate-100 rounded p-3 overflow-auto text-red-700 whitespace-pre-wrap">
              {error.message}
            </pre>
          </details>
          <div className="flex gap-2 justify-center pt-2">
            <Button onClick={this.reset}>
              <RefreshCw className="size-4 mr-2" />
              Try again
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reload page
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

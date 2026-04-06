import { Component, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
  /** When true, renders a compact error banner instead of a full-screen takeover.
   *  Use this for page/section-level boundaries so the shell (nav, sidebar) stays visible. */
  inline?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.inline) {
        return (
          <div className="flex h-[50vh] flex-col items-center justify-center gap-3 px-6 text-center">
            <AlertTriangle size={32} className="text-status-warning" aria-hidden />
            <p className="max-w-sm text-sm text-fg-muted">
              {this.state.error?.message || "This page could not be loaded."}
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 rounded-lg border border-border-default bg-bg-surface px-3 py-1.5 text-sm font-medium text-fg-default hover:bg-bg-surface-hover transition-colors cursor-pointer"
            >
              <RotateCcw size={14} aria-hidden />
              Try again
            </button>
          </div>
        );
      }

      return (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg-app px-6 text-center">
          <AlertTriangle size={48} className="text-status-warning" aria-hidden />
          <h1 className="text-xl font-semibold text-fg-default">
            Something went wrong
          </h1>
          <p className="max-w-md text-sm text-fg-muted">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="mt-2 inline-flex items-center gap-2 rounded-lg border border-border-default bg-bg-surface px-4 py-2 text-sm font-medium text-fg-default hover:bg-bg-surface-hover transition-colors cursor-pointer"
          >
            <RotateCcw size={16} aria-hidden />
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

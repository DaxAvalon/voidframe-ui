import { Component, type ErrorInfo, type ReactNode } from "react";

export interface ErrorBoundaryProps {
  /**
   * Fallback UI. Either a ReactNode (static) or a render function receiving
   * `(error, reset)` for interactive recovery.
   */
  fallback?:
    | ReactNode
    | ((error: Error, reset: () => void) => ReactNode);
  children?: ReactNode;
  /** Invoked when a descendant throws. */
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  error: Error | null;
}

/**
 * Class-based error boundary. Catches render/effect errors in descendants,
 * renders `fallback`, and exposes `reset()` to recover.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  override state: State = { error: null };

  static displayName = "ErrorBoundary";

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info);
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  override render() {
    if (this.state.error) {
      const { fallback } = this.props;
      if (typeof fallback === "function") {
        return fallback(this.state.error, this.reset);
      }
      if (fallback !== undefined) return fallback;
      return null;
    }
    return this.props.children ?? null;
  }
}

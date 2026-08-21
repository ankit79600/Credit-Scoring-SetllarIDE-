"use client";

import * as Sentry from "@sentry/nextjs";
import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  eventId?: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const eventId = Sentry.captureException(error, {
      extra: { componentStack: errorInfo.componentStack ?? "" },
    });
    this.setState({ eventId });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return this.props.fallback ?? (
      <div className="flex flex-col items-center justify-center min-h-[200px] gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-white/80">Something went wrong</p>
          <p className="text-xs text-white/35 mt-1">This error has been reported automatically.</p>
        </div>
        <button
          onClick={() => this.setState({ hasError: false })}
          className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs text-white/50 hover:text-white/80 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }
}

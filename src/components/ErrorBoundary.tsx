import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      let details = null;

      try {
        const parsed = JSON.parse(this.state.error?.message || "");
        if (parsed.error && parsed.operationType) {
          errorMessage = `Firestore ${parsed.operationType} error on path: ${parsed.path}`;
          details = (
            <div className="mt-4 p-4 bg-red-50 rounded-lg text-xs font-mono overflow-auto max-h-60">
              <pre>{JSON.stringify(parsed, null, 2)}</pre>
            </div>
          );
        }
      } catch (e) {
        errorMessage = this.state.error?.message || "An unexpected error occurred.";
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8F9FA]">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-2xl w-full border border-[#E9ECEF]">
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">Application Error</h2>
            <p className="text-[#6C757D] mb-6">{errorMessage}</p>
            {details}
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-3 bg-[#0066FF] text-white font-bold rounded-xl hover:bg-[#0052CC] transition-all"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

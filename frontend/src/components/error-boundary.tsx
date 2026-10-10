import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-svh items-center justify-center p-6">
            <div className="max-w-sm text-center">
              <img src="/grb-mark.png" alt="" className="mx-auto mb-6 h-14 w-auto" />
              <h1 className="text-3xl font-semibold">Nešto je pošlo po krivu</h1>
              <p className="mt-2 text-muted-foreground">
                Došlo je do neočekivane greške.
              </p>
              <button
                className="mt-6 h-10 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-brand-deep"
                onClick={() => window.location.reload()}
              >
                Osvježi stranicu
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

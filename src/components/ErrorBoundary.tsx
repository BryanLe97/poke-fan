import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback: (error: Error, retry: () => void) => ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Catches errors thrown while rendering its children — including a
 * rejected promise surfaced by React's `use()`, which is how our Suspense
 * data hooks report a failed fetch — and renders `fallback` instead of
 * crashing the page.
 *
 * `retry` just clears the caught error so children re-render; that alone
 * is enough to actually retry because the resources in
 * src/api/pokemonResource.ts evict a failed fetch from their cache on
 * rejection, so the next render's `use()` call fetches fresh instead of
 * replaying the same rejection.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: unknown): State {
    return {
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }

  private retry = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (error) return this.props.fallback(error, this.retry);
    return this.props.children;
  }
}

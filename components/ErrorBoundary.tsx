import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="p-8 bg-zinc-900 border-2 border-red-600 rounded-sm text-center">
                    <h2 className="text-2xl font-rugged text-red-500 uppercase mb-4">Diagnostic System offline</h2>
                    <p className="text-zinc-500 text-xs uppercase font-bold mb-6">An unexpected error occurred in this module.</p>
                    <button
                        onClick={() => this.setState({ hasError: false })}
                        className="px-6 py-2 bg-zinc-800 border border-zinc-700 text-zinc-100 hover:bg-zinc-700 uppercase font-black text-[10px]"
                    >
                        Attempt Re-mount
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

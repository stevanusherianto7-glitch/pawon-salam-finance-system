import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Mail } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("🔴 UNCAUGHT ERROR:", error, errorInfo);
        this.setState({ error, errorInfo });

        // Log to system (in production, send to monitoring service)
        this.logError(error, errorInfo);
    }

    private logError = (error: Error, errorInfo: ErrorInfo) => {
        const errorLog = {
            timestamp: new Date().toISOString(),
            error: error.toString(),
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            userAgent: navigator.userAgent
        };

        // Store in localStorage for debugging (in production, send to backend)
        try {
            const logs = JSON.parse(localStorage.getItem('error_logs') || '[]');
            logs.unshift(errorLog);
            localStorage.setItem('error_logs', JSON.stringify(logs.slice(0, 10))); // Keep last 10 errors
        } catch (e) {
            console.error('Failed to log error:', e);
        }
    };

    private handleReload = () => {
        window.location.reload();
    };

    private handleReport = () => {
        const errorDetails = `
Error: ${this.state.error?.toString()}
Time: ${new Date().toISOString()}
Browser: ${navigator.userAgent}

Stack Trace:
${this.state.error?.stack}

Component Stack:
${this.state.errorInfo?.componentStack}
        `.trim();

        // Copy to clipboard
        navigator.clipboard.writeText(errorDetails).then(() => {
            alert('Error details copied to clipboard! Please send this to the admin.');
        }).catch(() => {
            console.error('Failed to copy error details');
        });
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
                    <div className="glass-card max-w-md w-full p-8 text-center">
                        {/* Icon */}
                        <div className="mb-4 flex justify-center">
                            <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
                                <AlertTriangle size={64} className="text-red-500" strokeWidth={1.5} />
                            </div>
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">
                            Terjadi Kesalahan Sistem
                        </h2>

                        {/* Description */}
                        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                            Maaf, aplikasi mengalami error yang tidak terduga. Tim kami sudah mendapat notifikasi otomatis.
                            Silakan reload halaman atau laporkan masalah ini.
                        </p>

                        {/* Error Message (Optional - for debugging) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-left">
                                <p className="text-xs font-mono text-red-700 break-all">
                                    {this.state.error.toString()}
                                </p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={this.handleReload}
                                className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <RefreshCw size={18} />
                                Reload Halaman
                            </button>
                            <button
                                onClick={this.handleReport}
                                className="flex-1 py-3 px-4 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <Mail size={18} />
                                Lapor ke Admin
                            </button>
                        </div>

                        {/* Footer */}
                        <p className="mt-6 text-xs text-gray-400">
                            Error ID: {new Date().getTime()}
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

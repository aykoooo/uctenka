"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";

type ToastVariant = "success" | "info" | "error";

interface ToastItem {
    id: string;
    message: string;
    variant: ToastVariant;
}

interface ToastContextValue {
    showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

function variantStyles(variant: ToastVariant): { icon: React.ReactNode; className: string } {
    switch (variant) {
        case "success":
            return {
                icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
                className: "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
            };
        case "error":
            return {
                icon: <TriangleAlert className="h-4 w-4 text-red-600" />,
                className: "border-red-200 bg-red-50 text-red-950 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100",
            };
        case "info":
        default:
            return {
                icon: <Info className="h-4 w-4 text-blue-600" />,
                className: "border-blue-200 bg-blue-50 text-blue-950 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-100",
            };
    }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback((message: string, variant: ToastVariant = "info") => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        setToasts((prev) => [...prev, { id, message, variant }]);

        window.setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, 2600);
    }, []);

    const value = useMemo(() => ({ showToast }), [showToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}

            <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(92vw,360px)] flex-col gap-2">
                {toasts.map((toast) => {
                    const styles = variantStyles(toast.variant);
                    return (
                        <div
                            key={toast.id}
                            className={`pointer-events-auto flex items-start gap-2 rounded-lg border px-3 py-2 shadow-sm ${styles.className}`}
                            role="status"
                            aria-live="polite"
                        >
                            <span className="mt-0.5">{styles.icon}</span>
                            <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
                            <button
                                type="button"
                                onClick={() => removeToast(toast.id)}
                                className="rounded p-0.5 opacity-70 transition hover:opacity-100"
                                aria-label="Zavřít oznámení"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within ToastProvider");
    }

    return context;
}

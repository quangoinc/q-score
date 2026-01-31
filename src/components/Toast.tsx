"use client";

import { useEffect, useState } from "react";

export interface ToastData {
  id: string;
  message: string;
  type: "undo" | "celebration";
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

function Toast({ toast, onDismiss }: ToastProps) {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const duration = toast.duration || 5000;
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => onDismiss(toast.id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  const isCelebration = toast.type === "celebration";

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
        isLeaving ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
      } ${
        isCelebration
          ? "bg-gradient-to-r from-crimson to-crimson-dark text-white"
          : "bg-card border border-border text-foreground"
      }`}
    >
      {isCelebration && (
        <span className="text-xl animate-bounce">&#127942;</span>
      )}
      <span className="text-sm flex-1">{toast.message}</span>
      {toast.action && (
        <button
          onClick={() => {
            toast.action?.onClick();
            handleDismiss();
          }}
          className={`text-sm font-medium px-2 py-1 rounded transition-colors ${
            isCelebration
              ? "text-white/80 hover:text-white hover:bg-white/10"
              : "text-crimson hover:bg-crimson/10"
          }`}
        >
          {toast.action.label}
        </button>
      )}
      <button
        onClick={handleDismiss}
        className={`p-1 rounded transition-colors ${
          isCelebration
            ? "text-white/60 hover:text-white"
            : "text-muted hover:text-foreground"
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

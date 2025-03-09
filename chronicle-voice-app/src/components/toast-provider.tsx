"use client";

import React, { createContext, useContext, useState } from "react";
import { ToastContainer } from "@/components/ui/toast";

interface ToastProps {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
}

interface Toast extends ToastProps {
  id: string;
}

interface ToastContextType {
  toast: (props: ToastProps) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = ({
    title,
    description,
    variant = "default",
    duration = 5000,
  }: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { id, title, description, variant, duration };

    setToasts((prevToasts) => [...prevToasts, newToast]);

    // Auto-dismiss toast after duration
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, duration);

    return id;
  };

  const dismiss = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

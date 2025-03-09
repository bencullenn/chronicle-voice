import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastProps {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
  onDismiss: (id: string) => void;
}

export function Toast({
  id,
  title,
  description,
  variant = "default",
  onDismiss,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    // Wait for animation to complete
    setTimeout(() => onDismiss(id), 300);
  };

  return (
    <div
      className={cn(
        "fixed right-4 transition-all duration-300 ease-in-out max-w-sm w-full shadow-lg rounded-lg pointer-events-auto overflow-hidden",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        variant === "destructive"
          ? "bg-red-50 text-red-800 border border-red-200"
          : "bg-white text-gray-800 border border-gray-200"
      )}
      style={{
        bottom: "1rem",
        zIndex: 50,
      }}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-1">
            <p className="font-medium text-sm">{title}</p>
            {description && (
              <p className="mt-1 text-sm opacity-80">{description}</p>
            )}
          </div>
          <button
            onClick={handleDismiss}
            className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    title: string;
    description?: string;
    variant?: "default" | "destructive";
  }>;
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-0 right-0 p-4 z-50 space-y-4">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          title={toast.title}
          description={toast.description}
          variant={toast.variant}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}
